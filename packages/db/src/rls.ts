export type TenantScopedTable = {
  table: string;
  tenantIdColumn: string;
};

export const tenantScopedTables: TenantScopedTable[] = [
  { table: "tenants", tenantIdColumn: "id" },
  { table: "audit_events", tenantIdColumn: "tenant_id" },
  { table: "users", tenantIdColumn: "tenant_id" },
  { table: "memberships", tenantIdColumn: "tenant_id" },
];

export const tenantIdColumnByTable = tenantScopedTables.reduce(
  (accumulator, entry) => {
    accumulator[entry.table] = entry.tenantIdColumn;
    return accumulator;
  },
  {} as Record<string, string>
);

export const getTenantIdColumn = (table: string): string | undefined => {
  return tenantIdColumnByTable[table];
};
