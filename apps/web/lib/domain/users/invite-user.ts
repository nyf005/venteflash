import type {
  MembershipRole,
  MembershipStatus,
  UserInviteInput,
} from "@repo/shared";
import { recordAuditEvent } from "@repo/db";
import { checkEntitlement, incrementUsage } from "../entitlements/entitlements";
import type { EntitlementsTransactionClient } from "../entitlements/types";
import { UserManagementError } from "./errors";
import { assertCanManageUsers } from "./permissions";
import type { UserManagementClient } from "./types";

export type InviteUserParams = UserInviteInput & {
  tenantId: string;
  actorId: string;
  userId: string;
  client?: UserManagementClient;
};

export type InviteUserResult = {
  userId: string;
  membershipId: string;
  role: MembershipRole;
  status: MembershipStatus;
};

const getDefaultClient = async (): Promise<UserManagementClient> => {
  const { prisma } = await import("@repo/db");
  return prisma as unknown as UserManagementClient;
};

const buildConflictFilters = (
  tenantId: string,
  userId: string,
  email?: string,
  phone?: string,
): Array<Record<string, string>> => {
  const filters: Array<Record<string, string>> = [{ id: userId }];

  if (email) {
    filters.push({ tenantId, email });
  }

  if (phone) {
    filters.push({ tenantId, phone });
  }

  return filters;
};

export const inviteUser = async (
  input: InviteUserParams,
): Promise<InviteUserResult> => {
  const activeClient = input.client ?? (await getDefaultClient());
  await assertCanManageUsers(activeClient, input.tenantId, input.actorId);

  const result = await activeClient.$transaction(async (tx) => {
    const entitlementsClient = tx as unknown as EntitlementsTransactionClient;
    await checkEntitlement({
      tenantId: input.tenantId,
      quota: "team_members",
      quantity: 1,
      client: entitlementsClient,
    });

    const conflictFilters = buildConflictFilters(
      input.tenantId,
      input.userId,
      input.email,
      input.phone,
    );

    const existingUser = await tx.user.findFirst({
      where: { OR: conflictFilters },
      select: { id: true, tenantId: true },
    });

    if (existingUser) {
      const message =
        existingUser.id === input.userId &&
        existingUser.tenantId !== input.tenantId
          ? "Compte deja lie a un autre tenant"
          : "Email ou numero deja utilise";

      throw new UserManagementError("CONFLICT", message, {
        field: "user",
      });
    }

    const status = input.status ?? "INACTIVE";

    const user = await tx.user.create({
      data: {
        id: input.userId,
        tenantId: input.tenantId,
        name: input.name,
        email: input.email ?? null,
        phone: input.phone ?? null,
      },
    });

    const membership = await tx.membership.create({
      data: {
        tenantId: input.tenantId,
        userId: user.id,
        role: input.role,
        status,
      },
    });

    await incrementUsage({
      tenantId: input.tenantId,
      quota: "team_members",
      quantity: 1,
      client: entitlementsClient,
    });

    return { userId: user.id, membershipId: membership.id, status };
  });

  try {
    await recordAuditEvent({
      tenantId: input.tenantId,
      actorId: input.actorId,
      eventName: "users.invite",
      resource: "users",
      action: "invite",
      metadata: {
        targetUserId: result.userId,
        role: input.role,
        status: result.status,
      },
    });
  } catch {
    return {
      ...result,
      role: input.role,
      status: result.status,
    };
  }

  return {
    ...result,
    role: input.role,
    status: result.status,
  };
};
