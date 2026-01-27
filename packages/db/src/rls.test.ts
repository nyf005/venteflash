import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import { tenantScopedTables } from "./rls";

describe("tenant scope mapping", () => {
  it("liste les tables tenant-scopees existantes", () => {
    expect(tenantScopedTables).toEqual([
      { table: "tenants", tenantIdColumn: "id" },
      { table: "audit_events", tenantIdColumn: "tenant_id" },
      { table: "users", tenantIdColumn: "tenant_id" },
      { table: "memberships", tenantIdColumn: "tenant_id" },
    ]);
  });

  it("confirme les colonnes tenant_id dans le schema Prisma", async () => {
    const schema = await readFile("packages/db/prisma/schema.prisma", "utf-8");

    expect(schema).toMatch(/model Tenant[\s\S]*\n\s*id\s+String/);
    expect(schema).toMatch(/model AuditEvent[\s\S]*\n\s*tenantId\s+String/);
    expect(schema).toMatch(/model User[\s\S]*\n\s*tenantId\s+String/);
    expect(schema).toMatch(/model Membership[\s\S]*\n\s*tenantId\s+String/);
  });
});
