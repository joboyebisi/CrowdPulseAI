import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import type { TwitchSession } from "@/lib/types";
import { env } from "@/lib/env";

export const SESSION_COOKIE = "crowdpulse_session";
export const OAUTH_STATE_COOKIE = "crowdpulse_oauth_state";

function key() {
  if (!env.SESSION_SECRET) throw new Error("SESSION_SECRET is not configured");
  return createHash("sha256").update(env.SESSION_SECRET).digest();
}

export function encryptSession(session: TwitchSession) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key(), iv);
  const encrypted = Buffer.concat([
    cipher.update(JSON.stringify(session), "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]).toString("base64url");
}

export function decryptSession(value?: string): TwitchSession | null {
  if (!value || !env.SESSION_SECRET) return null;
  try {
    const payload = Buffer.from(value, "base64url");
    const iv = payload.subarray(0, 12);
    const tag = payload.subarray(12, 28);
    const encrypted = payload.subarray(28);
    const decipher = createDecipheriv("aes-256-gcm", key(), iv);
    decipher.setAuthTag(tag);
    const clear = Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8");
    return JSON.parse(clear) as TwitchSession;
  } catch {
    return null;
  }
}
