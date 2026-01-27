import { readSessionCookie, type SessionPayload } from "./session";

export type TenantContext = SessionPayload;

type MembershipClient = {
  membership: {
    findFirst: (args: {
      where: { tenantId: string; userId: string };
      select: { id: true };
    }) => Promise<{ id: string } | null>;
  };
};

type AuditLogger = {
  recordAuditEvent: (input: {
    tenantId: string;
    actorId: string;
    eventName: string;
    resource: string;
    action: string;
    metadata?: Record<string, string>;
  }) => Promise<void>;
};

type ResolveTenantContextOptions = {
  request: Request;
  providedTenantId?: string | null;
  client?: MembershipClient;
  audit?: AuditLogger;
  resource?: string;
  action?: string;
};

export class TenantAccessError extends Error {
  constructor(
    public readonly code:
      | "UNAUTHENTICATED"
      | "TENANT_MISMATCH"
      | "MEMBERSHIP_REQUIRED",
    message: string,
    public readonly details?: Record<string, string>
  ) {
    super(message);
  }
}

const getCookieValue = (request: Request, name: string): string | undefined => {
  const header = request.headers.get("cookie");
  if (!header) return undefined;

  const cookies = header.split(";").map((part) => part.trim());

  for (const cookie of cookies) {
    if (!cookie.startsWith(`${name}=`)) continue;
    return cookie.slice(name.length + 1);
  }

  return undefined;
};

const getDefaultClient = async (): Promise<MembershipClient> => {
  const { prisma } = await import("@repo/db");
  return prisma;
};

const getDefaultAuditLogger = async (): Promise<AuditLogger> => {
  const { recordAuditEvent } = await import("@repo/db");
  return { recordAuditEvent };
};

const logDeniedAccess = async (
  options: ResolveTenantContextOptions,
  session: SessionPayload,
  metadata: Record<string, string>
): Promise<void> => {
  const audit = options.audit ?? (await getDefaultAuditLogger());
  const resource = options.resource ?? "unknown";
  const action = options.action ?? "unknown";

  try {
    await audit.recordAuditEvent({
      tenantId: session.tenantId,
      actorId: session.userId,
      eventName: "security.rls.denied",
      resource,
      action,
      metadata,
    });
  } catch {
    return;
  }
};

export const resolveTenantContext = async (
  options: ResolveTenantContextOptions
): Promise<TenantContext> => {
  const sessionValue = getCookieValue(options.request, "vf_session");
  const session = readSessionCookie(sessionValue);

  if (!session) {
    throw new TenantAccessError(
      "UNAUTHENTICATED",
      "Session invalide",
      { reason: "session_invalid" }
    );
  }

  if (options.providedTenantId && options.providedTenantId !== session.tenantId) {
    await logDeniedAccess(options, session, {
      reason: "tenant_mismatch",
      attemptedTenantId: options.providedTenantId,
    });
    throw new TenantAccessError("TENANT_MISMATCH", "Acces refuse", {
      reason: "tenant_mismatch",
    });
  }

  const client = options.client ?? (await getDefaultClient());
  const membership = await client.membership.findFirst({
    where: { tenantId: session.tenantId, userId: session.userId },
    select: { id: true },
  });

  if (!membership) {
    await logDeniedAccess(options, session, {
      reason: "membership_missing",
    });
    throw new TenantAccessError("MEMBERSHIP_REQUIRED", "Acces refuse", {
      reason: "membership_missing",
    });
  }

  return session;
};

export const buildTenantError = (
  error: TenantAccessError,
  requestId: string
): { error: { code: string; message: string; details?: Record<string, string>; requestId: string } } => {
  return {
    error: {
      code: error.code,
      message: error.message,
      details: error.details,
      requestId,
    },
  };
};
