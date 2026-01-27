export { prisma } from "./client";
export { recordAuditEvent, type AuditEventInput } from "./audit";
export {
  getTenantIdColumn,
  tenantIdColumnByTable,
  tenantScopedTables,
} from "./rls";
