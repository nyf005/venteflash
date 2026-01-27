import { randomUUID } from "crypto";
import { readFile } from "node:fs/promises";
import type { Prisma } from "@prisma/client";
import { prisma } from "../../packages/db/src/client";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

describe("RLS policies", () => {
  it("reference auth.uid() et memberships", async () => {
    const sql = await readFile(
      "packages/db/prisma/rls.sql",
      "utf-8"
    );

    expect(sql).toContain("auth.uid()");
    expect(sql).toContain("memberships");
  });

  it("definit les policies d'insertion", async () => {
    const sql = await readFile(
      "packages/db/prisma/rls.sql",
      "utf-8"
    );

    expect(sql).toMatch(/create policy tenant_insert[\s\S]*for insert/i);
    expect(sql).toMatch(/create policy membership_insert[\s\S]*for insert/i);
    expect(sql).toMatch(/create policy user_insert[\s\S]*for insert/i);
  });

  it("definit les policies select, update et delete tenant-scopees", async () => {
    const sql = await readFile(
      "packages/db/prisma/rls.sql",
      "utf-8"
    );

    expect(sql).toMatch(/create policy tenant_select[\s\S]*for select/i);
    expect(sql).toMatch(/create policy tenant_update[\s\S]*for update/i);
    expect(sql).toMatch(/create policy tenant_delete[\s\S]*for delete/i);

    expect(sql).toMatch(/create policy membership_select[\s\S]*for select/i);
    expect(sql).toMatch(/create policy membership_update[\s\S]*for update/i);
    expect(sql).toMatch(/create policy membership_delete[\s\S]*for delete/i);

    expect(sql).toMatch(/create policy user_select[\s\S]*for select/i);
    expect(sql).toMatch(/create policy user_update[\s\S]*for update/i);
    expect(sql).toMatch(/create policy user_delete[\s\S]*for delete/i);
  });

  it("applique is_tenant_member pour bloquer les acces cross-tenant", async () => {
    const sql = await readFile(
      "packages/db/prisma/rls.sql",
      "utf-8"
    );

    expect(sql).toMatch(/create or replace function is_tenant_member/i);
    expect(sql).toMatch(/security definer/i);
    expect(sql).toMatch(/set search_path = public/i);
    expect(sql).toMatch(/tenant_select[\s\S]*is_tenant_member\(id\)/i);
    expect(sql).toMatch(/tenant_update[\s\S]*is_tenant_member\(id\)/i);
    expect(sql).toMatch(/membership_select[\s\S]*is_tenant_member\(tenant_id\)/i);
    expect(sql).toMatch(/membership_update[\s\S]*is_tenant_member\(tenant_id\)/i);
    expect(sql).toMatch(/user_select[\s\S]*is_tenant_member\(tenant_id\)/i);
    expect(sql).toMatch(/user_update[\s\S]*is_tenant_member\(tenant_id\)/i);
  });

  it("configure l'audit trail en lecture/ecriture uniquement", async () => {
    const sql = await readFile(
      "packages/db/prisma/rls.sql",
      "utf-8"
    );

    expect(sql).toMatch(/create policy audit_select[\s\S]*for select/i);
    expect(sql).toMatch(/create policy audit_insert[\s\S]*for insert/i);
    expect(sql).not.toMatch(/create policy audit_update/i);
    expect(sql).not.toMatch(/create policy audit_delete/i);
  });

  it("garde rls.sql synchronise avec la migration RLS", async () => {
    const [rlsSql, migrationSql] = await Promise.all([
      readFile("packages/db/prisma/rls.sql", "utf-8"),
      readFile(
        "packages/db/prisma/migrations/20260127101000_apply_rls_policies/migration.sql",
        "utf-8"
      ),
    ]);

    const normalize = (sql: string) => {
      return sql
        .split("\n")
        .map((line) => line.trim())
        .filter(
          (line) =>
            line.length > 0 &&
            !line.startsWith("--") &&
            !line.startsWith("drop policy")
        )
        .join("\n");
    };

    expect(normalize(migrationSql)).toContain(normalize(rlsSql));
  });
});

const runIntegration = Boolean(process.env.DATABASE_URL);
const describeIntegration = runIntegration ? describe : describe.skip;

describeIntegration("RLS integration", () => {
  const tenantAId = randomUUID();
  const tenantBId = randomUUID();
  const userAId = randomUUID();
  const userBId = randomUUID();
  const tenantASlug = `tenant-${tenantAId.slice(0, 8)}`;
  const tenantBSlug = `tenant-${tenantBId.slice(0, 8)}`;

  const ensureAuditTable = async () => {
    await prisma.$executeRawUnsafe(
      `create table if not exists "audit_events" (
        "id" text primary key default gen_random_uuid(),
        "tenant_id" text not null,
        "actor_id" text not null,
        "event_name" text not null,
        "resource" text not null,
        "action" text not null,
        "metadata" jsonb,
        "created_at" timestamptz not null default now()
      );`
    );

    await prisma.$executeRawUnsafe(
      `create index if not exists "audit_events_tenant_id_idx" on "audit_events"("tenant_id");`
    );
    await prisma.$executeRawUnsafe(
      `create index if not exists "audit_events_actor_id_idx" on "audit_events"("actor_id");`
    );
  };

  const applyRlsPolicies = async () => {
    const migrationSql = await readFile(
      "packages/db/prisma/migrations/20260127101000_apply_rls_policies/migration.sql",
      "utf-8"
    );

    await prisma.$executeRawUnsafe(migrationSql);
  };

  const runAs = async <T>(
    userId: string,
    callback: (tx: Prisma.TransactionClient) => Promise<T>
  ) => {
    return prisma.$transaction(async (tx) => {
      const claims = JSON.stringify({ sub: userId, role: "authenticated" });
      await tx.$executeRawUnsafe("set local role authenticated");
      await tx.$executeRaw`select set_config('request.jwt.claims', ${claims}, true)`;
      return callback(tx);
    });
  };

  const seedTenant = async (tenantId: string, slug: string, userId: string) => {
    await runAs(userId, async (tx) => {
      await tx.$executeRaw`insert into tenants (id, name, slug) values (${tenantId}, ${`Tenant ${slug}`}, ${slug})`;
      await tx.$executeRaw`insert into users (id, tenant_id, name) values (${userId}, ${tenantId}, ${`User ${slug}`})`;
      await tx.$executeRaw`insert into memberships (tenant_id, user_id, role) values (${tenantId}, ${userId}, ${"OWNER"})`;
    });
  };

  beforeAll(async () => {
    await ensureAuditTable();
    await applyRlsPolicies();
    await seedTenant(tenantAId, tenantASlug, userAId);
    await seedTenant(tenantBId, tenantBSlug, userBId);
  });

  afterAll(async () => {
    const cleanupTenant = async (tenantId: string, userId: string) => {
      await runAs(userId, async (tx) => {
        await tx.$executeRaw`delete from memberships where tenant_id = ${tenantId}`;
        await tx.$executeRaw`delete from users where id = ${userId}`;
        await tx.$executeRaw`delete from tenants where id = ${tenantId}`;
      });
    };

    await cleanupTenant(tenantAId, userAId);
    await cleanupTenant(tenantBId, userBId);
    await prisma.$disconnect();
  });

  it("refuse la lecture cross-tenant", async () => {
    const crossTenant = await runAs(userAId, (tx) =>
      tx.$queryRaw<{ id: string }[]>`select id from tenants where id = ${tenantBId}`
    );
    const sameTenant = await runAs(userAId, (tx) =>
      tx.$queryRaw<{ id: string }[]>`select id from tenants where id = ${tenantAId}`
    );

    expect(crossTenant).toHaveLength(0);
    expect(sameTenant).toHaveLength(1);
  });

  it("refuse la mise a jour cross-tenant", async () => {
    const crossTenantUpdate = await runAs(userAId, (tx) =>
      tx.$queryRaw<{ id: string }[]>`update tenants set name = ${"Hack"} where id = ${tenantBId} returning id`
    );
    const sameTenantUpdate = await runAs(userAId, (tx) =>
      tx.$queryRaw<{ id: string }[]>`update tenants set name = ${"Owner"} where id = ${tenantAId} returning id`
    );

    expect(crossTenantUpdate).toHaveLength(0);
    expect(sameTenantUpdate).toHaveLength(1);
  });
});
