alter table tenants enable row level security;
alter table memberships enable row level security;
alter table users enable row level security;
alter table audit_events enable row level security;

create or replace function is_tenant_member(target_tenant_id text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from memberships
    where memberships.tenant_id = target_tenant_id
      and memberships.user_id = auth.uid()::text
  );
$$;

create policy tenant_select on tenants
  for select
  using (is_tenant_member(id));

create policy tenant_insert on tenants
  for insert
  with check (auth.uid() is not null);

create policy tenant_update on tenants
  for update
  using (is_tenant_member(id))
  with check (is_tenant_member(id));

create policy tenant_delete on tenants
  for delete
  using (is_tenant_member(id));

create policy membership_select on memberships
  for select
  using (is_tenant_member(tenant_id));

create policy membership_insert on memberships
  for insert
  with check (
    user_id = auth.uid()::text
    or is_tenant_member(tenant_id)
  );

create policy membership_update on memberships
  for update
  using (is_tenant_member(tenant_id))
  with check (is_tenant_member(tenant_id));

create policy membership_delete on memberships
  for delete
  using (is_tenant_member(tenant_id));

create policy user_select on users
  for select
  using (is_tenant_member(tenant_id));

create policy user_insert on users
  for insert
  with check (
    id = auth.uid()::text
    or is_tenant_member(tenant_id)
  );

create policy user_update on users
  for update
  using (is_tenant_member(tenant_id))
  with check (is_tenant_member(tenant_id));

create policy user_delete on users
  for delete
  using (is_tenant_member(tenant_id));

create policy audit_select on audit_events
  for select
  using (is_tenant_member(tenant_id));

create policy audit_insert on audit_events
  for insert
  with check (actor_id = auth.uid()::text);
