import type {
  EntitlementQuota,
  SubscriptionOverview,
  SubscriptionStatus,
} from "@repo/shared";
import { EntitlementError } from "./errors";
import type {
  EntitlementCheckResult,
  EntitlementsClient,
  EntitlementsTransactionClient,
} from "./types";

const defaultPlan = {
  code: "pro",
  name: "Pro Plan",
  limits: {
    monthlyOrders: 1000,
    activeProducts: 50,
    teamMembers: 5,
  },
};

const getDefaultClient = async (): Promise<EntitlementsClient> => {
  const { prisma } = await import("@repo/db");
  return prisma as unknown as EntitlementsClient;
};

const runInTransaction = async <T>(
  client: EntitlementsClient | EntitlementsTransactionClient,
  fn: (tx: EntitlementsTransactionClient) => Promise<T>,
): Promise<T> => {
  if ("$transaction" in client && client.$transaction) {
    return client.$transaction(async (tx) => fn(tx));
  }

  return fn(client as EntitlementsTransactionClient);
};

const mapStatus = (
  status: "TRIAL" | "ACTIVE" | "EXPIRED",
): SubscriptionStatus => {
  switch (status) {
    case "TRIAL":
      return "trial";
    case "ACTIVE":
      return "active";
    case "EXPIRED":
      return "expired";
    default:
      return "trial";
  }
};

const calculateRemaining = (limit: number, used: number): number => {
  return Math.max(0, limit - used);
};

const getQuotaValues = (
  overview: SubscriptionOverview,
  quota: EntitlementQuota,
) => {
  switch (quota) {
    case "monthly_orders":
      return {
        limit: overview.limits.monthlyOrders,
        used: overview.usage.monthlyOrders,
      };
    case "active_products":
      return {
        limit: overview.limits.activeProducts,
        used: overview.usage.activeProducts,
      };
    case "team_members":
      return {
        limit: overview.limits.teamMembers,
        used: overview.usage.teamMembers,
      };
    default:
      return { limit: 0, used: 0 };
  }
};

const ensureSubscriptionDataWithClient = async (input: {
  tenantId: string;
  client: EntitlementsTransactionClient;
}): Promise<void> => {
  const now = new Date();
  const trialEndsAt = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
  const currentPeriodEndsAt = new Date(
    now.getTime() + 30 * 24 * 60 * 60 * 1000,
  );

  await input.client.planLimit.upsert({
    where: {
      tenantId_code: { tenantId: input.tenantId, code: defaultPlan.code },
    },
    create: {
      tenantId: input.tenantId,
      code: defaultPlan.code,
      name: defaultPlan.name,
      monthlyOrdersLimit: defaultPlan.limits.monthlyOrders,
      activeProductsLimit: defaultPlan.limits.activeProducts,
      teamMembersLimit: defaultPlan.limits.teamMembers,
    },
    update: {},
  });

  await input.client.subscription.upsert({
    where: { tenantId: input.tenantId },
    create: {
      tenantId: input.tenantId,
      planCode: defaultPlan.code,
      status: "TRIAL",
      trialEndsAt,
      currentPeriodEndsAt,
    },
    update: {},
  });

  await input.client.subscriptionUsage.upsert({
    where: { tenantId: input.tenantId },
    create: {
      tenantId: input.tenantId,
      monthlyOrdersCount: 0,
      activeProductsCount: 0,
      teamMembersCount: 0,
    },
    update: {},
  });
};

const getSubscriptionOverviewWithClient = async (input: {
  tenantId: string;
  client: EntitlementsTransactionClient;
}): Promise<SubscriptionOverview> => {
  await ensureSubscriptionDataWithClient({
    tenantId: input.tenantId,
    client: input.client,
  });

  const subscription = await input.client.subscription.findUnique({
    where: { tenantId: input.tenantId },
    include: { planLimit: true, usage: true },
  });

  if (!subscription) {
    throw new EntitlementError("SUBSCRIPTION_MISSING", "Abonnement manquant", {
      tenantId: input.tenantId,
    });
  }

  if (!subscription.planLimit) {
    throw new EntitlementError("PLAN_LIMIT_MISSING", "Plan introuvable", {
      tenantId: input.tenantId,
      planCode: subscription.planCode,
    });
  }

  if (!subscription.usage) {
    throw new EntitlementError("USAGE_MISSING", "Usage introuvable", {
      tenantId: input.tenantId,
    });
  }

  const limits = {
    monthlyOrders: subscription.planLimit.monthlyOrdersLimit,
    activeProducts: subscription.planLimit.activeProductsLimit,
    teamMembers: subscription.planLimit.teamMembersLimit,
  };

  const usage = {
    monthlyOrders: subscription.usage.monthlyOrdersCount,
    activeProducts: subscription.usage.activeProductsCount,
    teamMembers: subscription.usage.teamMembersCount,
  };

  return {
    status: mapStatus(subscription.status),
    plan: {
      code: subscription.planLimit.code,
      name: subscription.planLimit.name,
    },
    limits,
    usage,
    remaining: {
      monthlyOrders: calculateRemaining(
        limits.monthlyOrders,
        usage.monthlyOrders,
      ),
      activeProducts: calculateRemaining(
        limits.activeProducts,
        usage.activeProducts,
      ),
      teamMembers: calculateRemaining(limits.teamMembers, usage.teamMembers),
    },
    trialEndsAt: subscription.trialEndsAt
      ? subscription.trialEndsAt.toISOString()
      : null,
    currentPeriodEndsAt: subscription.currentPeriodEndsAt
      ? subscription.currentPeriodEndsAt.toISOString()
      : null,
  };
};

export const getSubscriptionOverview = async (input: {
  tenantId: string;
  client?: EntitlementsClient | EntitlementsTransactionClient;
}): Promise<SubscriptionOverview> => {
  const activeClient = input.client ?? (await getDefaultClient());
  return runInTransaction(activeClient, (tx) =>
    getSubscriptionOverviewWithClient({
      tenantId: input.tenantId,
      client: tx,
    }),
  );
};

export const checkEntitlement = async (input: {
  tenantId: string;
  quota: EntitlementQuota;
  quantity?: number;
  client?: EntitlementsClient | EntitlementsTransactionClient;
}): Promise<EntitlementCheckResult> => {
  const activeClient = input.client ?? (await getDefaultClient());

  return runInTransaction(activeClient, async (tx) => {
    const overview = await getSubscriptionOverviewWithClient({
      tenantId: input.tenantId,
      client: tx,
    });

    if (overview.status === "expired") {
      throw new EntitlementError("PLAN_EXPIRED", "Plan expire", {
        tenantId: input.tenantId,
      });
    }

    const quantity = input.quantity ?? 1;
    const { limit, used } = getQuotaValues(overview, input.quota);

    if (used + quantity > limit) {
      throw new EntitlementError("QUOTA_EXCEEDED", "Quota depasse", {
        quota: input.quota,
        limit: String(limit),
        used: String(used),
        requested: String(quantity),
      });
    }

    return { allowed: true, quota: input.quota, overview };
  });
};

export const incrementUsage = async (input: {
  tenantId: string;
  quota: EntitlementQuota;
  quantity?: number;
  client?: EntitlementsClient | EntitlementsTransactionClient;
}): Promise<void> => {
  const activeClient = input.client ?? (await getDefaultClient());
  const quantity = input.quantity ?? 1;
  const data =
    input.quota === "monthly_orders"
      ? { monthlyOrdersCount: { increment: quantity } }
      : input.quota === "active_products"
        ? { activeProductsCount: { increment: quantity } }
        : { teamMembersCount: { increment: quantity } };

  await activeClient.subscriptionUsage.update({
    where: { tenantId: input.tenantId },
    data,
  });
};

export const updatePlanLimits = async (input: {
  tenantId: string;
  actorId: string;
  limits: {
    monthlyOrdersLimit: number;
    activeProductsLimit: number;
    teamMembersLimit: number;
  };
  client?: EntitlementsClient | EntitlementsTransactionClient;
}): Promise<void> => {
  const activeClient = input.client ?? (await getDefaultClient());

  await runInTransaction(activeClient, async (tx) => {
    const subscription = await tx.subscription.findUnique({
      where: { tenantId: input.tenantId },
      include: { planLimit: true },
    });

    if (!subscription) {
      throw new EntitlementError(
        "SUBSCRIPTION_MISSING",
        "Abonnement manquant",
        {
          tenantId: input.tenantId,
        },
      );
    }

    if (!subscription.planLimit) {
      throw new EntitlementError("PLAN_LIMIT_MISSING", "Plan introuvable", {
        tenantId: input.tenantId,
        planCode: subscription.planCode,
      });
    }

    await tx.planLimit.update({
      where: {
        tenantId_code: {
          tenantId: input.tenantId,
          code: subscription.planCode,
        },
      },
      data: {
        monthlyOrdersLimit: input.limits.monthlyOrdersLimit,
        activeProductsLimit: input.limits.activeProductsLimit,
        teamMembersLimit: input.limits.teamMembersLimit,
      },
    });
  });

  await recordSubscriptionAudit({
    tenantId: input.tenantId,
    actorId: input.actorId,
    action: "quota.adjust",
    metadata: {
      monthlyOrdersLimit: String(input.limits.monthlyOrdersLimit),
      activeProductsLimit: String(input.limits.activeProductsLimit),
      teamMembersLimit: String(input.limits.teamMembersLimit),
    },
  });
};

export const recordSubscriptionAudit = async (input: {
  tenantId: string;
  actorId: string;
  action: "plan.change" | "quota.adjust";
  metadata?: Record<string, string>;
}): Promise<void> => {
  const { recordAuditEvent } = await import("@repo/db");

  await recordAuditEvent({
    tenantId: input.tenantId,
    actorId: input.actorId,
    eventName: `subscription.${input.action}`,
    resource: "subscription",
    action: input.action,
    metadata: input.metadata,
  });
};
