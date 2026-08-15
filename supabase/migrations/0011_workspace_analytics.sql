-- Workspace analytics.
--
-- The dashboard was the last thing in Phase 2 still reading zeros. 0009 added
-- project_work_item_counts, but the panel is workspace-scoped and filtered by
-- project, cycle or module, so it never had anything to call.
--
-- One function returning one row, because the panel renders one row of cards:
-- eight counts for the overview tab and five for work items. Doing it as
-- thirteen queries from the browser would be thirteen round trips to fill a
-- header.
--
-- SECURITY INVOKER (the default) is deliberate. Every count here is a count of
-- rows the caller can already see, so RLS does the scoping and a non-member
-- gets zeros rather than an error — which is what the panel should show them.

create or replace function public.workspace_analytics(
  p_workspace_slug text,
  p_project_ids uuid[] default null,
  p_cycle_id uuid default null,
  p_module_id uuid default null
)
returns table (
  total_users integer,
  total_admins integer,
  total_members integer,
  total_guests integer,
  total_projects integer,
  total_cycles integer,
  total_intake integer,
  total_work_items integer,
  backlog_work_items integer,
  un_started_work_items integer,
  started_work_items integer,
  completed_work_items integer,
  cancelled_work_items integer
)
language sql
stable
set search_path = public
as $$
  with workspace as (
    select w.id
    from public.workspaces w
    where w.slug = p_workspace_slug
      and w.deleted_at is null
  ),
  -- The work items the filters actually select. Built once and counted five
  -- ways below, rather than repeating the join per card.
  scoped_items as (
    select i.id, s."group" as state_group
    from public.issues i
    join workspace ws on ws.id = i.workspace_id
    left join public.states s on s.id = i.state_id
    where i.deleted_at is null
      and not i.is_draft
      and (p_project_ids is null or i.project_id = any (p_project_ids))
      and (
        p_cycle_id is null
        or exists (
          select 1 from public.cycle_issues ci
          where ci.issue_id = i.id and ci.cycle_id = p_cycle_id and ci.deleted_at is null
        )
      )
      and (
        p_module_id is null
        or exists (
          select 1 from public.module_issues mi
          where mi.issue_id = i.id and mi.module_id = p_module_id and mi.deleted_at is null
        )
      )
  )
  select
    (select count(*) from public.workspace_members wm
      join workspace ws on ws.id = wm.workspace_id
      where wm.is_active)::integer,
    -- 20 admin, 15 member, 5 guest — Django's numbers, unchanged.
    (select count(*) from public.workspace_members wm
      join workspace ws on ws.id = wm.workspace_id
      where wm.is_active and wm.role = 20)::integer,
    (select count(*) from public.workspace_members wm
      join workspace ws on ws.id = wm.workspace_id
      where wm.is_active and wm.role = 15)::integer,
    (select count(*) from public.workspace_members wm
      join workspace ws on ws.id = wm.workspace_id
      where wm.is_active and wm.role = 5)::integer,
    (select count(*) from public.projects p
      join workspace ws on ws.id = p.workspace_id
      where p.deleted_at is null
        and (p_project_ids is null or p.id = any (p_project_ids)))::integer,
    (select count(*) from public.cycles c
      join workspace ws on ws.id = c.workspace_id
      where c.deleted_at is null
        and (p_project_ids is null or c.project_id = any (p_project_ids)))::integer,
    -- Everything ever filed, not just what is still pending: the card is a
    -- total, and a triaged item was still an intake item.
    (select count(*) from public.intake_issues ii
      join workspace ws on ws.id = ii.workspace_id
      where ii.deleted_at is null
        and (p_project_ids is null or ii.project_id = any (p_project_ids)))::integer,
    (select count(*) from scoped_items)::integer,
    (select count(*) from scoped_items where state_group = 'backlog')::integer,
    (select count(*) from scoped_items where state_group = 'unstarted')::integer,
    (select count(*) from scoped_items where state_group = 'started')::integer,
    (select count(*) from scoped_items where state_group = 'completed')::integer,
    (select count(*) from scoped_items where state_group = 'cancelled')::integer;
$$;

grant execute on function public.workspace_analytics(text, uuid[], uuid, uuid) to authenticated;

comment on function public.workspace_analytics(text, uuid[], uuid, uuid) is
  'Counts behind the workspace analytics panel. Runs as the caller so RLS scopes every count.';

-- ---------------------------------------------------------------------------
-- The work-item insight table
-- ---------------------------------------------------------------------------
-- The same counts as above, broken down per project — one row per project
-- rather than one row for the workspace.
--
-- Projects with no work items are included, at zero. The table is a roster of
-- what exists, and a project vanishing from it because nobody has filed
-- anything yet would read as the project being gone.

create or replace function public.workspace_work_item_stats(
  p_workspace_slug text,
  p_project_ids uuid[] default null,
  p_cycle_id uuid default null,
  p_module_id uuid default null
)
returns table (
  project_id uuid,
  project__name text,
  total_work_items integer,
  backlog_work_items integer,
  un_started_work_items integer,
  started_work_items integer,
  completed_work_items integer,
  cancelled_work_items integer
)
language sql
stable
set search_path = public
as $$
  select
    p.id,
    p.name::text,
    count(i.id)::integer,
    count(i.id) filter (where s."group" = 'backlog')::integer,
    count(i.id) filter (where s."group" = 'unstarted')::integer,
    count(i.id) filter (where s."group" = 'started')::integer,
    count(i.id) filter (where s."group" = 'completed')::integer,
    count(i.id) filter (where s."group" = 'cancelled')::integer
  from public.projects p
  join public.workspaces w on w.id = p.workspace_id
  -- Left join so a project with nothing filed still produces its row of zeros;
  -- the work-item predicates therefore belong in the join, not in WHERE, or
  -- they would turn it back into an inner join.
  left join public.issues i
    on i.project_id = p.id
   and i.deleted_at is null
   and not i.is_draft
   and (
     p_cycle_id is null
     or exists (
       select 1 from public.cycle_issues ci
       where ci.issue_id = i.id and ci.cycle_id = p_cycle_id and ci.deleted_at is null
     )
   )
   and (
     p_module_id is null
     or exists (
       select 1 from public.module_issues mi
       where mi.issue_id = i.id and mi.module_id = p_module_id and mi.deleted_at is null
     )
   )
  left join public.states s on s.id = i.state_id
  where w.slug = p_workspace_slug
    and w.deleted_at is null
    and p.deleted_at is null
    and (p_project_ids is null or p.id = any (p_project_ids))
  group by p.id, p.name
  order by p.name;
$$;

grant execute on function public.workspace_work_item_stats(text, uuid[], uuid, uuid) to authenticated;

comment on function public.workspace_work_item_stats(text, uuid[], uuid, uuid) is
  'Per-project work item counts for the analytics insight table.';
