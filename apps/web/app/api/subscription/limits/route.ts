import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import type { MembershipRole } from "@repo/shared";
import { subscriptionLimitsUpdateSchema } from "@repo/shared";
import { prisma, recordAuditEvent } from "@repo/db";
import {
  buildTenantError,
  resolveTenantContext,
  TenantAccessError,
} from "../../../../lib/auth/tenant-context";
import { EntitlementError } from "../../../../lib/domain/entitlements/errors";
import { updatePlanLimits } from "../../../../lib/domain/entitlements/entitlements";

const resolveTenantStatus = (code: TenantAccessError["code"]): number => {
  switch (code) {
    case "UNAUTHENTICATED":
      return 401;
    case "TENANT_MISMATCH":
    case "MEMBERSHIP_REQUIRED":
      return 403;
    default:
      return 500;
  }
};

const resolveEntitlementStatus = (code: EntitlementError["code"]): number => {
  switch (code) {
    case "PLAN_EXPIRED":
    case "QUOTA_EXCEEDED":
      return 403;
    case "SUBSCRIPTION_MISSING":
    case "PLAN_LIMIT_MISSING":
    case "USAGE_MISSING":
      return 404;
    default:
      return 500;
  }
};

const adminRoles: MembershipRole[] = ["OWNER", "ADMIN"];

const recordDeniedAccess = async (
  tenantId: string,
  actorId: string,
  reason: string,
): Promise<void> => {
  try {
    await recordAuditEvent({
      tenantId,
      actorId,
      eventName: "security.rbac.denied",
      resource: "subscription",
      action: "update",
      metadata: { reason },
    });
  } catch {
    return;
  }
};

const assertAdminAccess = async (
  tenantId: string,
  actorId: string,
): Promise<void> => {
  const membership = await prisma.membership.findFirst({
    where: { tenantId, userId: actorId },
    select: { id: true, role: true, status: true },
  });

  if (!membership) {
    await recordDeniedAccess(tenantId, actorId, "membership_missing");
    throw new TenantAccessError("MEMBERSHIP_REQUIRED", "Acces refuse", {
      reason: "membership_missing",
    });
  }

  if (membership.status !== "ACTIVE") {
    await recordDeniedAccess(tenantId, actorId, "membership_inactive");
    throw new TenantAccessError("MEMBERSHIP_REQUIRED", "Acces refuse", {
      reason: "membership_inactive",
    });
  }

  if (!adminRoles.includes(membership.role)) {
    await recordDeniedAccess(tenantId, actorId, "role_forbidden");
    throw new TenantAccessError("MEMBERSHIP_REQUIRED", "Acces refuse", {
      reason: "role_forbidden",
    });
  }
};

const buildValidationError = (
  requestId: string,
  details?: Record<string, string[] | undefined>,
): NextResponse => {
  return NextResponse.json(
    {
      error: {
        code: "VALIDATION_ERROR",
        message: "Donnees invalides",
        details,
        requestId,
      },
    },
    { status: 400 },
  );
};

const buildEntitlementError = (
  error: EntitlementError,
  requestId: string,
): NextResponse => {
  return NextResponse.json(
    {
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
        requestId,
      },
    },
    { status: resolveEntitlementStatus(error.code) },
  );
};

const buildUnknownError = (requestId: string): NextResponse => {
  return NextResponse.json(
    {
      error: {
        code: "UNKNOWN_ERROR",
        message: "Erreur inattendue",
        requestId,
      },
    },
    { status: 500 },
  );
};

export const PATCH = async (request: Request): Promise<NextResponse> => {
  const requestId = randomUUID();
  let payload: unknown = {};

  try {
    payload = await request.json();
  } catch {
    payload = {};
  }

  const parsed = subscriptionLimitsUpdateSchema.safeParse(payload);

  if (!parsed.success) {
    return buildValidationError(requestId, parsed.error.flatten().fieldErrors);
  }

  try {
    const context = await resolveTenantContext({
      request,
      resource: "subscription",
      action: "update",
    });
    await assertAdminAccess(context.tenantId, context.userId);

    await updatePlanLimits({
      tenantId: context.tenantId,
      actorId: context.userId,
      limits: parsed.data,
    });

    return NextResponse.json({ data: { updated: true } }, { status: 200 });
  } catch (error) {
    if (error instanceof TenantAccessError) {
      return NextResponse.json(buildTenantError(error, requestId), {
        status: resolveTenantStatus(error.code),
      });
    }

    if (error instanceof EntitlementError) {
      return buildEntitlementError(error, requestId);
    }

    console.error("subscription-limits-update-failed", { requestId, error });
    return buildUnknownError(requestId);
  }
};
