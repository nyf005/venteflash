import { describe, expect, it, vi } from "vitest";
import { createSessionCookie } from "./session";
import {
  buildTenantError,
  resolveTenantContext,
  TenantAccessError,
} from "./tenant-context";

const buildRequest = (cookieValue?: string) => {
  return new Request("http://localhost/api/test", {
    headers: cookieValue ? { cookie: `vf_session=${cookieValue}` } : undefined,
  });
};

const createMembershipClient = (hasMembership = true) => {
  return {
    membership: {
      findFirst: vi
        .fn()
        .mockResolvedValue(hasMembership ? { id: "membership-1" } : null),
    },
  };
};

const createAuditLogger = () => {
  return {
    recordAuditEvent: vi.fn().mockResolvedValue(undefined),
  };
};

describe("resolveTenantContext", () => {
  it("derive le contexte depuis la session", async () => {
    const session = { userId: "user-1", tenantId: "tenant-1" };
    const request = buildRequest(createSessionCookie(session));
    const client = createMembershipClient();

    const context = await resolveTenantContext({
      request,
      providedTenantId: "tenant-1",
      client,
    });

    expect(context).toEqual(session);
    expect(client.membership.findFirst).toHaveBeenCalledWith({
      where: { tenantId: "tenant-1", userId: "user-1" },
      select: { id: true },
    });
  });

  it("rejette un tenantId override et retourne une erreur standard", async () => {
    const session = { userId: "user-1", tenantId: "tenant-1" };
    const request = buildRequest(createSessionCookie(session));
    const client = createMembershipClient();
    const audit = createAuditLogger();

    let thrown: unknown;

    try {
      await resolveTenantContext({
        request,
        providedTenantId: "tenant-2",
        client,
        audit,
        resource: "orders",
        action: "read",
      });
    } catch (error) {
      thrown = error;
    }

    expect(thrown).toBeInstanceOf(TenantAccessError);

    const payload = buildTenantError(thrown as TenantAccessError, "req-1");

    expect(payload).toEqual({
      error: {
        code: "TENANT_MISMATCH",
        message: "Acces refuse",
        details: { reason: "tenant_mismatch" },
        requestId: "req-1",
      },
    });

    expect(audit.recordAuditEvent).toHaveBeenCalledWith({
      tenantId: "tenant-1",
      actorId: "user-1",
      eventName: "security.rls.denied",
      resource: "orders",
      action: "read",
      metadata: {
        reason: "tenant_mismatch",
        attemptedTenantId: "tenant-2",
      },
    });
  });

  it("journalise le refus quand la membership est manquante", async () => {
    const session = { userId: "user-1", tenantId: "tenant-1" };
    const request = buildRequest(createSessionCookie(session));
    const client = createMembershipClient(false);
    const audit = createAuditLogger();

    let thrown: unknown;

    try {
      await resolveTenantContext({
        request,
        providedTenantId: "tenant-1",
        client,
        audit,
        resource: "memberships",
        action: "read",
      });
    } catch (error) {
      thrown = error;
    }

    expect(thrown).toBeInstanceOf(TenantAccessError);
    expect(audit.recordAuditEvent).toHaveBeenCalledWith({
      tenantId: "tenant-1",
      actorId: "user-1",
      eventName: "security.rls.denied",
      resource: "memberships",
      action: "read",
      metadata: {
        reason: "membership_missing",
      },
    });
  });
});
