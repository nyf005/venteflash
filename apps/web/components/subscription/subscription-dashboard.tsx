"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
  subscriptionOverviewSchema,
  type SubscriptionOverview,
} from "@repo/shared";
import {
  Bell,
  History,
  LayoutGrid,
  Settings,
  ShoppingCart,
  Sparkles,
  Package,
  Users,
  ArrowDownToLine,
  BadgeCheck,
} from "lucide-react";
import { DashboardLayout } from "../layout/dashboard-layout";
import type { NavItem, UserProfile } from "../layout/dashboard-layout";
import { Button } from "../ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "../ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import styles from "./subscription-dashboard.module.css";

type ResponsePayload<T> = {
  data?: T;
  error?: { message?: string };
};

const requestJson = async <T,>(
  input: string,
  init: RequestInit,
): Promise<T> => {
  const response = await fetch(input, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init.headers,
    },
  });

  let payload: unknown = null;

  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  const parsedPayload: ResponsePayload<T> =
    payload && typeof payload === "object"
      ? (payload as ResponsePayload<T>)
      : {};

  if (!response.ok) {
    const message = parsedPayload.error?.message ?? "Action impossible";
    throw new Error(message);
  }

  return parsedPayload.data as T;
};

const seedOverview: SubscriptionOverview = {
  status: "active",
  plan: { code: "pro", name: "Pro Plan" },
  limits: { monthlyOrders: 1000, activeProducts: 50, teamMembers: 5 },
  usage: { monthlyOrders: 450, activeProducts: 12, teamMembers: 4 },
  remaining: { monthlyOrders: 550, activeProducts: 38, teamMembers: 1 },
  trialEndsAt: null,
  currentPeriodEndsAt: "2026-02-01T00:00:00.000Z",
};

const navItems: NavItem[] = [
  { label: "Dashboard", href: "#", icon: <LayoutGrid size={18} /> },
  { label: "Automations", href: "#", icon: <Sparkles size={18} /> },
  { label: "Products", href: "#", icon: <Package size={18} /> },
  { label: "Contacts", href: "#", icon: <Users size={18} /> },
  {
    label: "Settings",
    href: "/settings/subscription",
    icon: <Settings size={18} />,
    active: true,
  },
];

const currentUser: UserProfile = {
  name: "Alex Rivera",
  role: "Admin Account",
  avatarUrl:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuBISF59tEoh4EMKlgGnt9sGyK7g-nmHBjvEB0nCLwNUVso5GBHEX9nHSzopBlKhzf9MLtC_UQSzU5EXBXB14AYeeleoEhFrABcxoTv5I79U8HK98IeskUX1EbY79B9iEo0PmKvLxbgE84krkIZ0kx5SKzYcu-Fyj_mhUt7FWGA_V9IfdbUu7S18UFwC7rQqZBlaniH_xBSkEgL4M_522IGSMhd2tShh0qGtf8I3UBcG6qyAN_eVmS8RPKpCnN0MPXh8HXGZNGW-dA",
};

const formatDate = (value?: string | null): string => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export const SubscriptionDashboard = () => {
  const [showAlert, setShowAlert] = useState(true);
  const { data } = useQuery({
    queryKey: ["subscription"],
    queryFn: async () => {
      const payload = await requestJson<SubscriptionOverview>(
        "/api/subscription",
        {
          method: "GET",
        },
      );
      return subscriptionOverviewSchema.parse(payload);
    },
    initialData: seedOverview,
    staleTime: 30_000,
  });

  const teamUsageRatio = data.limits.teamMembers
    ? data.usage.teamMembers / data.limits.teamMembers
    : 0;
  const isNearLimit = teamUsageRatio >= 0.8;
  const isBlocked =
    data.status === "expired" ||
    data.remaining.monthlyOrders === 0 ||
    data.remaining.activeProducts === 0 ||
    data.remaining.teamMembers === 0;

  const statusLabel =
    data.status === "trial"
      ? "Trial"
      : data.status === "expired"
        ? "Expired"
        : "Active";

  const billingDate = useMemo(
    () => formatDate(data.currentPeriodEndsAt),
    [data.currentPeriodEndsAt],
  );
  const trialEndDate = useMemo(
    () => formatDate(data.trialEndsAt),
    [data.trialEndsAt],
  );

  return (
    <DashboardLayout
      navItems={navItems}
      profile={currentUser}
      topbarTitle="Subscription & Quotas"
      topbarActions={
        <div className={styles.topbarActions}>
          <Button
            className={styles.iconButton}
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Notifications"
          >
            <Bell size={18} />
          </Button>
          <Button
            className={styles.iconButton}
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Usage history"
          >
            <History size={18} />
          </Button>
          <Avatar className={styles.avatar} aria-label="User profile">
            {currentUser.avatarUrl ? (
              <AvatarImage
                className={styles.avatarImage}
                src={currentUser.avatarUrl}
                alt={currentUser.name}
              />
            ) : null}
            <AvatarFallback className={styles.avatarFallback}>
              {currentUser.name
                .split(" ")
                .map((segment) => segment[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>
      }
      brandMeta="Social Commerce Admin"
    >
      <div className={styles.page}>
        {showAlert && isNearLimit && (
          <Card className={styles.alertBanner} role="status">
            <CardContent className={styles.alertContent}>
              <BadgeCheck size={18} />
              <p>
                You have used 80% of your Team Member quota. Consider upgrading
                to add more seats.
              </p>
            </CardContent>
            <CardFooter className={styles.alertFooter}>
              <Button
                className={styles.alertDismiss}
                type="button"
                variant="ghost"
                onClick={() => setShowAlert(false)}
              >
                Dismiss
              </Button>
            </CardFooter>
          </Card>
        )}

        {isBlocked && (
          <Card className={styles.blockedBanner} role="status">
            <CardContent className={styles.blockedContent}>
              <p className={styles.blockedTitle}>Action bloquee</p>
              <p className={styles.blockedText}>
                Votre plan est expire ou un quota est depasse. Mettez a jour
                votre abonnement pour continuer.
              </p>
            </CardContent>
            <CardFooter className={styles.blockedFooter}>
              <Button className={styles.blockedAction} type="button">
                Upgrade plan
              </Button>
            </CardFooter>
          </Card>
        )}

        <div className={styles.planGrid}>
          <Card className={styles.planCard}>
            <CardContent className={styles.planInfo}>
              <div className={styles.planHeading}>
                <p className={styles.planKicker}>Current Plan</p>
                <span className={styles.planStatus}>{statusLabel}</span>
              </div>
              <h3>{data.plan.name}</h3>
              {data.status === "trial" ? (
                <p>
                  Trial in progress. Trial ends on <span>{trialEndDate}</span>.
                </p>
              ) : data.status === "expired" ? (
                <p>
                  Your plan has expired. Update your subscription to continue.
                </p>
              ) : (
                <p>
                  Your plan is currently active. Next billing date:{" "}
                  <span>{billingDate}</span>.
                </p>
              )}
              <div className={styles.planActions}>
                <Button className={styles.primaryButton} type="button">
                  Upgrade Plan
                </Button>
                <Button
                  className={styles.secondaryButton}
                  variant="ghost"
                  type="button"
                >
                  Manage Billing
                </Button>
              </div>
            </CardContent>
            <CardFooter className={styles.planVisual}>
              <Sparkles size={48} />
            </CardFooter>
          </Card>
          <Card className={styles.savingsCard}>
            <CardHeader className={styles.savingsHeader}>
              <p className={styles.savingsKicker}>Total Savings</p>
              <h3>$142.00</h3>
              <p className={styles.savingsTrend}>+12% from last month</p>
            </CardHeader>
            <CardFooter className={styles.savingsFooter}>
              <p>Annual billing enabled</p>
            </CardFooter>
          </Card>
        </div>

        <section>
          <h2 className={styles.sectionTitle}>Usage Quotas</h2>
          <div className={styles.quotaGrid}>
            <Card className={styles.quotaCard}>
              <CardHeader className={styles.quotaHeader}>
                <span className={styles.quotaIconBlue}>
                  <ShoppingCart size={18} />
                </span>
                <span className={styles.quotaUsage}>
                  {Math.round(
                    (data.usage.monthlyOrders / data.limits.monthlyOrders) *
                      100,
                  )}
                  % Used
                </span>
              </CardHeader>
              <CardContent className={styles.quotaBody}>
                <h4>Monthly Orders</h4>
                <div className={styles.quotaValue}>
                  <span>{data.usage.monthlyOrders}</span>
                  <small>/ {data.limits.monthlyOrders}</small>
                </div>
                <div className={styles.progressTrack}>
                  <div
                    className={styles.progressFill}
                    style={{
                      width: `${
                        (data.usage.monthlyOrders / data.limits.monthlyOrders) *
                        100
                      }%`,
                    }}
                  />
                </div>
                <p className={styles.quotaMeta}>Resets in 12 days</p>
              </CardContent>
            </Card>

            <Card className={styles.quotaCard}>
              <CardHeader className={styles.quotaHeader}>
                <span className={styles.quotaIconPurple}>
                  <Package size={18} />
                </span>
                <span className={styles.quotaUsage}>
                  {Math.round(
                    (data.usage.activeProducts / data.limits.activeProducts) *
                      100,
                  )}
                  % Used
                </span>
              </CardHeader>
              <CardContent className={styles.quotaBody}>
                <h4>Active Products</h4>
                <div className={styles.quotaValue}>
                  <span>{data.usage.activeProducts}</span>
                  <small>/ {data.limits.activeProducts}</small>
                </div>
                <div className={styles.progressTrack}>
                  <div
                    className={`${styles.progressFill} ${styles.progressPurple}`}
                    style={{
                      width: `${
                        (data.usage.activeProducts /
                          data.limits.activeProducts) *
                        100
                      }%`,
                    }}
                  />
                </div>
                <p className={styles.quotaMeta}>Lifetime inventory limit</p>
              </CardContent>
            </Card>

            <Card className={styles.quotaCardWarning}>
              <CardHeader className={styles.quotaHeader}>
                <span className={styles.quotaIconAmber}>
                  <Users size={18} />
                </span>
                <span className={styles.quotaUsageWarning}>80% Used</span>
              </CardHeader>
              <CardContent className={styles.quotaBody}>
                <h4>Team Members</h4>
                <div className={styles.quotaValueWarning}>
                  <span>{data.usage.teamMembers}</span>
                  <small>/ {data.limits.teamMembers}</small>
                </div>
                <div className={styles.progressTrack}>
                  <div
                    className={`${styles.progressFill} ${styles.progressAmber}`}
                    style={{
                      width: `${
                        (data.usage.teamMembers / data.limits.teamMembers) * 100
                      }%`,
                    }}
                  />
                </div>
                <p className={styles.quotaMetaWarning}>
                  Near limit. Need more seats?
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        <Card className={styles.tableCard}>
          <CardHeader className={styles.tableHeader}>
            <h2>Billing History</h2>
            <Button
              className={styles.downloadButton}
              variant="ghost"
              type="button"
            >
              Download All
            </Button>
          </CardHeader>
          <CardContent className={styles.tableScroll}>
            <Table className={styles.table}>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Invoice ID</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className={styles.alignRight}>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  {
                    date: "Sep 24, 2023",
                    id: "INV-2023-009",
                    amount: "$49.00",
                  },
                  {
                    date: "Aug 24, 2023",
                    id: "INV-2023-008",
                    amount: "$49.00",
                  },
                  {
                    date: "Jul 24, 2023",
                    id: "INV-2023-007",
                    amount: "$49.00",
                  },
                ].map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>{row.date}</TableCell>
                    <TableCell>{row.id}</TableCell>
                    <TableCell className={styles.amountCell}>
                      {row.amount}
                    </TableCell>
                    <TableCell>
                      <span className={styles.badge}>Paid</span>
                    </TableCell>
                    <TableCell className={styles.alignRight}>
                      <Button
                        className={styles.iconLink}
                        variant="ghost"
                        size="icon"
                        type="button"
                        aria-label={`Download ${row.id}`}
                      >
                        <ArrowDownToLine size={18} />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};
