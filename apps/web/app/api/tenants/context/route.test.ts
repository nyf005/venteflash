import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@repo/db", () => ({
  prisma: {
    membership: {
      findFirst: vi.fn(),
    },
  },
  recordAuditEvent: vi.fn(),
}));

import { prisma, recordAuditEvent } from "@repo/db";
import { createSessionCookie } from "../../../../lib/auth/session";
import { POST } from "./route";

const prismaMock = prisma as unknown as {
  membership: { findFirst: ReturnType<typeof vi.fn> };
};

describe("POST /api/tenants/context", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejette un tenantId override avec erreur standard", async () => {
    const session = { userId: "user-1", tenantId: "tenant-1" };
    const cookie = createSessionCookie(session);
    const recordAuditEventMock = vi.mocked(recordAuditEvent);

    prismaMock.membership.findFirst.mockResolvedValue({ id: "membership-1" });
    recordAuditEventMock.mockResolvedValue(undefined);

    const response = await POST(
      new Request("http://localhost/api/tenants/context", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          cookie: `vf_session=${cookie}`,
        },
        body: JSON.stringify({ tenantId: "tenant-2" }),
      })
    );

    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toEqual({
      code: "TENANT_MISMATCH",
      message: "Acces refuse",
      details: { reason: "tenant_mismatch" },
      requestId: expect.any(String),
    });
    expect(recordAuditEventMock).toHaveBeenCalledWith({
      tenantId: "tenant-1",
      actorId: "user-1",
      eventName: "security.rls.denied",
      resource: "tenants",
      action: "context",
      metadata: {
        reason: "tenant_mismatch",
        attemptedTenantId: "tenant-2",
      },
    });
  });
});
