import { beforeEach, describe, expect, it, vi } from "vitest";
import { PATCH } from "./route";
import { resolveTenantContext } from "../../../../lib/auth/tenant-context";
import { updatePlanLimits } from "../../../../lib/domain/entitlements/entitlements";

vi.mock("@repo/db", () => ({
  prisma: {
    membership: {
      findFirst: vi.fn(),
    },
  },
  recordAuditEvent: vi.fn(),
}));

vi.mock("../../../../lib/domain/entitlements/entitlements", async () => {
  const actual = await vi.importActual<
    typeof import("../../../../lib/domain/entitlements/entitlements")
  >("../../../../lib/domain/entitlements/entitlements");

  return {
    ...actual,
    updatePlanLimits: vi.fn(),
  };
});

vi.mock("../../../../lib/auth/tenant-context", async () => {
  const actual = await vi.importActual<
    typeof import("../../../../lib/auth/tenant-context")
  >("../../../../lib/auth/tenant-context");

  return {
    ...actual,
    resolveTenantContext: vi.fn(),
  };
});

import { prisma, recordAuditEvent } from "@repo/db";

const prismaMock = prisma as unknown as {
  membership: { findFirst: ReturnType<typeof vi.fn> };
};

describe("PATCH /api/subscription/limits", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(resolveTenantContext).mockResolvedValue({
      userId: "actor-1",
      tenantId: "tenant-1",
    });
    prismaMock.membership.findFirst.mockResolvedValue({
      id: "membership-1",
      role: "OWNER",
      status: "ACTIVE",
    });
  });

  it("met a jour les quotas", async () => {
    const response = await PATCH(
      new Request("http://localhost/api/subscription/limits", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          monthlyOrdersLimit: 2000,
          activeProductsLimit: 75,
          teamMembersLimit: 10,
        }),
      }),
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data).toEqual({ updated: true });
    expect(updatePlanLimits).toHaveBeenCalledWith({
      tenantId: "tenant-1",
      actorId: "actor-1",
      limits: {
        monthlyOrdersLimit: 2000,
        activeProductsLimit: 75,
        teamMembersLimit: 10,
      },
    });
  });

  it("retourne une erreur de validation", async () => {
    const response = await PATCH(
      new Request("http://localhost/api/subscription/limits", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamMembersLimit: -1 }),
      }),
    );
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error.code).toBe("VALIDATION_ERROR");
  });

  it("refuse un membre non admin", async () => {
    prismaMock.membership.findFirst.mockResolvedValue({
      id: "membership-1",
      role: "AGENT",
      status: "ACTIVE",
    });

    const response = await PATCH(
      new Request("http://localhost/api/subscription/limits", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          monthlyOrdersLimit: 2000,
          activeProductsLimit: 75,
          teamMembersLimit: 10,
        }),
      }),
    );
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toEqual({
      code: "MEMBERSHIP_REQUIRED",
      message: "Acces refuse",
      details: { reason: "role_forbidden" },
      requestId: expect.any(String),
    });
    expect(updatePlanLimits).not.toHaveBeenCalled();
    expect(vi.mocked(recordAuditEvent)).toHaveBeenCalledWith({
      tenantId: "tenant-1",
      actorId: "actor-1",
      eventName: "security.rbac.denied",
      resource: "subscription",
      action: "update",
      metadata: { reason: "role_forbidden" },
    });
  });
});
