import { createHmac, timingSafeEqual } from "crypto";
import { env } from "@repo/config";

export type SessionPayload = {
  userId: string;
  tenantId: string;
};

const encodePayload = (payload: SessionPayload) => {
  const json = JSON.stringify(payload);
  return Buffer.from(json).toString("base64url");
};

const signPayload = (payload: string) => {
  return createHmac("sha256", env.sessionSecret)
    .update(payload)
    .digest("base64url");
};

const decodePayload = (payload: string): SessionPayload | null => {
  try {
    const json = Buffer.from(payload, "base64url").toString("utf-8");
    const parsed = JSON.parse(json) as Partial<SessionPayload>;

    if (typeof parsed.userId !== "string") return null;
    if (typeof parsed.tenantId !== "string") return null;

    return { userId: parsed.userId, tenantId: parsed.tenantId };
  } catch {
    return null;
  }
};

const verifySignature = (payload: string, signature: string): boolean => {
  const expected = signPayload(payload);

  if (expected.length !== signature.length) {
    return false;
  }

  return timingSafeEqual(
    Buffer.from(expected, "utf-8"),
    Buffer.from(signature, "utf-8")
  );
};

export const createSessionCookie = (payload: SessionPayload) => {
  const encoded = encodePayload(payload);
  const signature = signPayload(encoded);

  return `${encoded}.${signature}`;
};

export const readSessionCookie = (
  cookieValue?: string
): SessionPayload | null => {
  if (!cookieValue) return null;

  const [encoded, signature] = cookieValue.split(".");

  if (!encoded || !signature) return null;
  if (!verifySignature(encoded, signature)) return null;

  return decodePayload(encoded);
};
