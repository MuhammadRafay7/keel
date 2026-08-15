-- File storage.
--
-- Access is decided by the object's path, not by a separate permissions table.
-- Every object is stored under the id of the thing that owns it:
--
--   user-assets/{user_id}/…
--   workspace-assets/{workspace_id}/…
--   project-assets/{workspace_id}/{project_id}/…
--
-- storage.foldername(name) splits that path, so a policy can read the owning id
-- out of segment one and hand it to is_workspace_member() — the same helper the
-- tables already use. Rows and files therefore share one definition of access
-- and cannot drift apart as permissions change.
--
-- The trade-off is that the path is load-bearing: an object written to the wrong
-- prefix is governed by the wrong rule. Uploads go through
-- SupabaseStorageService, which builds these paths in one place.

-- ---------------------------------------------------------------------------
-- user-assets — avatars and cover images. Public bucket: readable by anyone
-- with the URL, writable only by the user whose folder it is.
-- ---------------------------------------------------------------------------

drop policy if exists "user assets read" on storage.objects;
create policy "user assets read"
  on storage.objects for select
  to public
  using (bucket_id = 'user-assets');

drop policy if exists "user assets write own" on storage.objects;
create policy "user assets write own"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'user-assets'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "user assets update own" on storage.objects;
create policy "user assets update own"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'user-assets' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "user assets delete own" on storage.objects;
create policy "user assets delete own"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'user-assets' and (storage.foldername(name))[1] = auth.uid()::text);

-- ---------------------------------------------------------------------------
-- workspace-assets — logos. Public to read; only members may write.
-- ---------------------------------------------------------------------------

drop policy if exists "workspace assets read" on storage.objects;
create policy "workspace assets read"
  on storage.objects for select
  to public
  using (bucket_id = 'workspace-assets');

drop policy if exists "workspace assets write" on storage.objects;
create policy "workspace assets write"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'workspace-assets'
    and public.is_workspace_member(((storage.foldername(name))[1])::uuid)
  );

drop policy if exists "workspace assets update" on storage.objects;
create policy "workspace assets update"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'workspace-assets'
    and public.is_workspace_member(((storage.foldername(name))[1])::uuid)
  );

drop policy if exists "workspace assets delete" on storage.objects;
create policy "workspace assets delete"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'workspace-assets'
    and public.is_workspace_member(((storage.foldername(name))[1])::uuid)
  );

-- ---------------------------------------------------------------------------
-- project-assets — attachments and editor uploads. Private: no anonymous read,
-- and the bucket is served only through time-limited signed URLs.
-- ---------------------------------------------------------------------------

drop policy if exists "project assets read" on storage.objects;
create policy "project assets read"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'project-assets'
    and public.is_project_member(((storage.foldername(name))[2])::uuid)
  );

drop policy if exists "project assets write" on storage.objects;
create policy "project assets write"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'project-assets'
    and public.is_project_member(((storage.foldername(name))[2])::uuid)
  );

drop policy if exists "project assets update" on storage.objects;
create policy "project assets update"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'project-assets'
    and public.is_project_member(((storage.foldername(name))[2])::uuid)
  );

drop policy if exists "project assets delete" on storage.objects;
create policy "project assets delete"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'project-assets'
    and public.is_project_member(((storage.foldername(name))[2])::uuid)
  );

-- ---------------------------------------------------------------------------
-- file_assets — the bookkeeping row that ties an object to what it belongs to
-- ---------------------------------------------------------------------------

drop policy if exists "file assets read" on public.file_assets;
create policy "file assets read"
  on public.file_assets for select
  to authenticated
  using (
    user_id = auth.uid()
    or (workspace_id is not null and public.is_workspace_member(workspace_id))
  );

drop policy if exists "file assets write" on public.file_assets;
create policy "file assets write"
  on public.file_assets for insert
  to authenticated
  with check (
    created_by_id = auth.uid()
    and (
      user_id = auth.uid()
      or (workspace_id is not null and public.is_workspace_member(workspace_id))
    )
  );

-- Marking an upload complete, or soft-deleting, is limited to the uploader.
drop policy if exists "file assets update own" on public.file_assets;
create policy "file assets update own"
  on public.file_assets for update
  to authenticated
  using (created_by_id = auth.uid())
  with check (created_by_id = auth.uid());

-- ---------------------------------------------------------------------------
-- Orphan sweep
-- ---------------------------------------------------------------------------
-- A row is written before the upload and confirmed after it. An upload that
-- fails in between leaves a row claiming a file that does not exist. Storage is
-- billed, so these are cleaned up rather than left to accumulate.

create or replace function public.sweep_unfinished_uploads(p_older_than interval default '24 hours')
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
begin
  with removed as (
    delete from public.file_assets
    where is_uploaded = false
      and created_at < now() - p_older_than
    returning 1
  )
  select count(*) into v_count from removed;

  return v_count;
end;
$$;

comment on function public.sweep_unfinished_uploads(interval) is
  'Removes file_assets rows whose upload never completed. Intended for a pg_cron schedule.';
