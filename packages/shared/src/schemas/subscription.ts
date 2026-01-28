import { z } from "zod";

export const subscriptionStatusSchema = z.enum(["trial", "active", "expired"]);

export const entitlementQuotaSchema = z.enum([
  "monthly_orders",
  "active_products",
  "team_members",
]);

export const subscriptionUsageSchema = z.object({
  monthlyOrders: z.number().int().nonnegative(),
  activeProducts: z.number().int().nonnegative(),
  teamMembers: z.number().int().nonnegative(),
});

export const subscriptionPlanSchema = z.object({
  code: z.string().min(1),
  name: z.string().min(1),
});

export const subscriptionOverviewSchema = z.object({
  status: subscriptionStatusSchema,
  plan: subscriptionPlanSchema,
  limits: subscriptionUsageSchema,
  usage: subscriptionUsageSchema,
  remaining: subscriptionUsageSchema,
  trialEndsAt: z.string().datetime().nullable(),
  currentPeriodEndsAt: z.string().datetime().nullable(),
});

export const entitlementCheckRequestSchema = z.object({
  quota: entitlementQuotaSchema,
  quantity: z.number().int().positive().optional(),
});

export const entitlementCheckResponseSchema = z.object({
  allowed: z.boolean(),
});

export const subscriptionLimitsUpdateSchema = z.object({
  monthlyOrdersLimit: z.number().int().nonnegative(),
  activeProductsLimit: z.number().int().nonnegative(),
  teamMembersLimit: z.number().int().nonnegative(),
});

export type SubscriptionStatus = z.infer<typeof subscriptionStatusSchema>;
export type EntitlementQuota = z.infer<typeof entitlementQuotaSchema>;
export type SubscriptionUsage = z.infer<typeof subscriptionUsageSchema>;
export type SubscriptionPlan = z.infer<typeof subscriptionPlanSchema>;
export type SubscriptionOverview = z.infer<typeof subscriptionOverviewSchema>;
export type EntitlementCheckRequest = z.infer<
  typeof entitlementCheckRequestSchema
>;
export type EntitlementCheckResponse = z.infer<
  typeof entitlementCheckResponseSchema
>;
export type SubscriptionLimitsUpdate = z.infer<
  typeof subscriptionLimitsUpdateSchema
>;
