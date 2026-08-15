-- RLS policy for project_user_properties (display properties and filters per user/project)

do $$
begin
  if to_regclass('public.project_user_properties') is not null then
    execute 'drop policy if exists "project_user_properties own rows" on public.project_user_properties';
    execute $p$
      create policy "project_user_properties own rows"
        on public.project_user_properties for all
        to authenticated
        using (user_id = auth.uid())
        with check (user_id = auth.uid())
    $p$;
  end if;
end;
$$;
