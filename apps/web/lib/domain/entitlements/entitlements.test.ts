import { describe, expect, it, vi } from "vitest";
import {
  checkEntitlement,
  recordSubscriptionAudit,
  updatePlanLimits,
} from "./entitlements";
import type {
  EntitlementsClient,
  PlanLimitRecord,
  SubscriptionRecord,
  SubscriptionUsageRecord,
} from "./types";
import { EntitlementError } from "./errors";

vi.mock("@repo/db", () => ({
  recordAuditEvent: vi.fn(),
}));

const createClient = (seed?: {
  subscription?: SubscriptionRecord;
  planLimit?: PlanLimitRecord;
  usage?: SubscriptionUsageRecord;
}): EntitlementsClient => {
  let subscription = seed?.subscription ?? null;
  let planLimit = seed?.planLimit ?? null;
  let usage = seed?.usage ?? null;

  const client: EntitlementsClient = {
    subscription: {
      findUnique: async (args) => {
        if (!subscription) return null;
        if (args.include?.planLimit) {
          return { ...subscription, planLimit, usage } as SubscriptionRecord;
        }
        return subscription;
      },
      upsert: async ({ create }) => {
        if (!subscription) {
          subscription = {
            tenantId: create.tenantId,
            planCode: create.planCode,
            status: create.status,
            trialEndsAt: create.trialEndsAt ?? null,
            currentPeriodEndsAt: create.currentPeriodEndsAt ?? null,
          };
        }
        return subscription as SubscriptionRecord;
      },
    },
    planLimit: {
      upsert: async ({ create }) => {
        if (!planLimit) {
          planLimit = { ...create };
        }
        return planLimit as PlanLimitRecord;
      },
      update: async ({ data }) => {
        if (!planLimit) {
          throw new Error("Plan limit missing");
        }
        planLimit = { ...planLimit, ...data } as PlanLimitRecord;
        return planLimit as PlanLimitRecord;
      },
    },
    subscriptionUsage: {
      findUnique: async () => usage,
      upsert: async ({ create }) => {
        if (!usage) {
          usage = { ...create };
        }
        return usage as SubscriptionUsageRecord;
      },
      update: async () => usage as SubscriptionUsageRecord,
    },
    $transaction: async (fn) => fn(client),
  };

  return client;
};

describe("entitlements", () => {
  it("autorise quand le quota est disponible", async () => {
    const client = createClient();

    const result = await checkEntitlement({
      tenantId: "tenant-1",
      quota: "team_members",
      client,
    });

    expect(result.allowed).toBe(true);
  });

  it("refuse quand le quota est depasse", async () => {
    const client = createClient({
      subscription: {
        tenantId: "tenant-1",
        planCode: "pro",
        status: "ACTIVE",
        trialEndsAt: null,
        currentPeriodEndsAt: null,
      },
      planLimit: {
        tenantId: "tenant-1",
        code: "pro",
        name: "Pro Plan",
        monthlyOrdersLimit: 1000,
        activeProductsLimit: 50,
        teamMembersLimit: 5,
      },
      usage: {
        tenantId: "tenant-1",
        monthlyOrdersCount: 450,
        activeProductsCount: 12,
        teamMembersCount: 5,
      },
    });

    await expect(
      checkEntitlement({
        tenantId: "tenant-1",
        quota: "team_members",
        client,
      }),
    ).rejects.toBeInstanceOf(EntitlementError);
  });

  it("refuse quand le plan est expire", async () => {
    const client = createClient({
      subscription: {
        tenantId: "tenant-1",
        planCode: "pro",
        status: "EXPIRED",
        trialEndsAt: null,
        currentPeriodEndsAt: null,
      },
      planLimit: {
        tenantId: "tenant-1",
        code: "pro",
        name: "Pro Plan",
        monthlyOrdersLimit: 1000,
        activeProductsLimit: 50,
        teamMembersLimit: 5,
      },
      usage: {
        tenantId: "tenant-1",
        monthlyOrdersCount: 450,
        activeProductsCount: 12,
        teamMembersCount: 4,
      },
    });

    await expect(
      checkEntitlement({
        tenantId: "tenant-1",
        quota: "team_members",
        client,
      }),
    ).rejects.toBeInstanceOf(EntitlementError);
  });

  it("journalise un audit pour changement de plan", async () => {
    const { recordAuditEvent } = await import("@repo/db");

    await recordSubscriptionAudit({
      tenantId: "tenant-1",
      actorId: "actor-1",
      action: "plan.change",
      metadata: { planCode: "pro" },
    });

    expect(recordAuditEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        tenantId: "tenant-1",
        actorId: "actor-1",
        eventName: "subscription.plan.change",
        action: "plan.change",
      }),
    );
  });

  it("journalise un audit lors d'un ajustement de quotas", async () => {
    const client = createClient({
      subscription: {
        tenantId: "tenant-1",
        planCode: "pro",
        status: "ACTIVE",
        trialEndsAt: null,
        currentPeriodEndsAt: null,
      },
      planLimit: {
        tenantId: "tenant-1",
        code: "pro",
        name: "Pro Plan",
        monthlyOrdersLimit: 1000,
        activeProductsLimit: 50,
        teamMembersLimit: 5,
      },
      usage: {
        tenantId: "tenant-1",
        monthlyOrdersCount: 0,
        activeProductsCount: 0,
        teamMembersCount: 0,
      },
    });
    const { recordAuditEvent } = await import("@repo/db");

    await updatePlanLimits({
      tenantId: "tenant-1",
      actorId: "actor-1",
      limits: {
        monthlyOrdersLimit: 2000,
        activeProductsLimit: 75,
        teamMembersLimit: 10,
      },
      client,
    });

    expect(recordAuditEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        tenantId: "tenant-1",
        actorId: "actor-1",
        eventName: "subscription.quota.adjust",
        action: "quota.adjust",
      }),
    );
  });
});
