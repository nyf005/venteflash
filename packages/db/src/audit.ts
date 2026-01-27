import type { Prisma } from "@prisma/client";
import { prisma } from "./client";

export type AuditEventInput = {
  tenantId: string;
  actorId: string;
  eventName: string;
  resource: string;
  action: string;
  metadata?: Prisma.JsonValue;
};

export const recordAuditEvent = async (input: AuditEventInput): Promise<void> => {
  await prisma.$transaction(async (tx) => {
    const claims = JSON.stringify({ sub: input.actorId, role: "authenticated" });
    await tx.$executeRaw`select set_config('request.jwt.claims', ${claims}, true)`;
    await tx.auditEvent.create({ data: input });
  });
};
