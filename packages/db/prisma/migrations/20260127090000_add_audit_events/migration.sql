create table "audit_events" (
  "id" text primary key default gen_random_uuid(),
  "tenant_id" text not null,
  "actor_id" text not null,
  "event_name" text not null,
  "resource" text not null,
  "action" text not null,
  "metadata" jsonb,
  "created_at" timestamptz not null default now()
);

create index "audit_events_tenant_id_idx" on "audit_events"("tenant_id");
create index "audit_events_actor_id_idx" on "audit_events"("actor_id");
