-- Give the database the defaults Django used to supply from Python.
--
-- Every table here has a uuid primary key with no default, because Django
-- generated it in the application before inserting. With Django gone, any
-- straight INSERT fails on a not-null violation for `id` — and it fails at the
-- call site, one table at a time, as each feature is migrated.
--
-- The same applies to created_at and updated_at, which Django's model base
-- class filled in on save.
--
-- Fixing it per-insert would mean remembering it in every service, forever.
-- Fixing it here means a plain INSERT works the way the schema implies it
-- should, and the create_* functions that already pass explicit values keep
-- working unchanged.

do $$
declare
  r record;
  n_id int := 0;
  n_ts int := 0;
begin
  -- uuid primary keys with no default
  for r in
    select c.table_name, c.column_name
    from information_schema.columns c
    join information_schema.tables t
      on t.table_schema = c.table_schema and t.table_name = c.table_name
    where c.table_schema = 'public'
      and t.table_type = 'BASE TABLE'
      and c.column_name = 'id'
      and c.data_type = 'uuid'
      and c.column_default is null
  loop
    execute format('alter table public.%I alter column id set default gen_random_uuid()', r.table_name);
    n_id := n_id + 1;
  end loop;

  -- timestamp bookkeeping columns with no default
  for r in
    select c.table_name, c.column_name
    from information_schema.columns c
    join information_schema.tables t
      on t.table_schema = c.table_schema and t.table_name = c.table_name
    where c.table_schema = 'public'
      and t.table_type = 'BASE TABLE'
      and c.column_name in ('created_at', 'updated_at')
      and c.data_type = 'timestamp with time zone'
      and c.is_nullable = 'NO'
      and c.column_default is null
  loop
    execute format('alter table public.%I alter column %I set default now()', r.table_name, r.column_name);
    n_ts := n_ts + 1;
  end loop;

  raise notice 'defaults added: % id columns, % timestamp columns', n_id, n_ts;
end;
$$;
