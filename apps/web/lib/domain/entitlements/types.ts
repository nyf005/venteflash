import type { EntitlementQuota, SubscriptionOverview } from "@repo/shared";

export type SubscriptionRecord = {
  tenantId: string;
  planCode: string;
  status: "TRIAL" | "ACTIVE" | "EXPIRED";
  trialEndsAt: Date | null;
  currentPeriodEndsAt: Date | null;
  planLimit?: PlanLimitRecord | null;
  usage?: SubscriptionUsageRecord | null;
};

export type PlanLimitRecord = {
  tenantId: string;
  code: string;
  name: string;
  monthlyOrdersLimit: number;
  activeProductsLimit: number;
  teamMembersLimit: number;
};

export type SubscriptionUsageRecord = {
  tenantId: string;
  monthlyOrdersCount: number;
  activeProductsCount: number;
  teamMembersCount: number;
};

export type EntitlementsTransactionClient = {
  subscription: {
    findUnique: (args: {
      where: { tenantId: string };
      include?: { planLimit?: boolean; usage?: boolean };
    }) => Promise<SubscriptionRecord | null>;
    upsert: (args: {
      where: { tenantId: string };
      create: {
        tenantId: string;
        planCode: string;
        status: "TRIAL" | "ACTIVE" | "EXPIRED";
        trialEndsAt?: Date | null;
        currentPeriodEndsAt?: Date | null;
      };
      update: Partial<{
        planCode: string;
        status: "TRIAL" | "ACTIVE" | "EXPIRED";
        trialEndsAt?: Date | null;
        currentPeriodEndsAt?: Date | null;
      }>;
    }) => Promise<SubscriptionRecord>;
  };
  planLimit: {
    upsert: (args: {
      where: { tenantId_code: { tenantId: string; code: string } };
      create: PlanLimitRecord;
      update: Partial<PlanLimitRecord>;
    }) => Promise<PlanLimitRecord>;
    update: (args: {
      where: { tenantId_code: { tenantId: string; code: string } };
      data: Partial<PlanLimitRecord>;
    }) => Promise<PlanLimitRecord>;
  };
  subscriptionUsage: {
    findUnique: (args: {
      where: { tenantId: string };
    }) => Promise<SubscriptionUsageRecord | null>;
    upsert: (args: {
      where: { tenantId: string };
      create: SubscriptionUsageRecord;
      update: Partial<SubscriptionUsageRecord>;
    }) => Promise<SubscriptionUsageRecord>;
    update: (args: {
      where: { tenantId: string };
      data: {
        monthlyOrdersCount?: { increment: number };
        activeProductsCount?: { increment: number };
        teamMembersCount?: { increment: number };
      };
    }) => Promise<SubscriptionUsageRecord>;
  };
};

export type EntitlementsClient = EntitlementsTransactionClient & {
  $transaction: <T>(
    fn: (tx: EntitlementsTransactionClient) => Promise<T>,
  ) => Promise<T>;
};

export type EntitlementCheckResult = {
  allowed: boolean;
  quota: EntitlementQuota;
  overview: SubscriptionOverview;
};
