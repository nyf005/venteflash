import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import {
  buildTenantError,
  resolveTenantContext,
  TenantAccessError,
} from "../../../../lib/auth/tenant-context";

type TenantContextPayload = {
  tenantId?: string;
};

const resolveStatusCode = (code: TenantAccessError["code"]): number => {
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

const buildUnknownError = (requestId: string) => {
  return {
    error: {
      code: "UNKNOWN_ERROR",
      message: "Erreur inattendue",
      requestId,
    },
  };
};

export const POST = async (request: Request): Promise<NextResponse> => {
  const requestId = randomUUID();
  let payload: TenantContextPayload = {};

  try {
    payload = (await request.json()) as TenantContextPayload;
  } catch {
    payload = {};
  }

  try {
    const context = await resolveTenantContext({
      request,
      providedTenantId: payload.tenantId,
      resource: "tenants",
      action: "context",
    });

    return NextResponse.json({ data: context }, { status: 200 });
  } catch (error) {
    if (error instanceof TenantAccessError) {
      return NextResponse.json(buildTenantError(error, requestId), {
        status: resolveStatusCode(error.code),
      });
    }

    return NextResponse.json(buildUnknownError(requestId), { status: 500 });
  }
};
