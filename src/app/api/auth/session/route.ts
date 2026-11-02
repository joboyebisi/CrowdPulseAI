import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { agentProvider, isTwitchConfigured } from "@/lib/env";
import { decryptSession, encryptSession, SESSION_COOKIE, sessionCookieOptions } from "@/lib/session";
import { refreshTwitchSession } from "@/lib/twitch";

export const runtime = "nodejs";

export async function GET() {
  const cookieStore = await cookies();
  let session = decryptSession(cookieStore.get(SESSION_COOKIE)?.value);
  let refreshed = false;
  if (session && session.expiresAt < Date.now() + 5 * 60 * 1000) {
    try {
      session = await refreshTwitchSession(session);
      refreshed = true;
    } catch {
      session = null;
    }
  }
  const response = NextResponse.json({
    configured: isTwitchConfigured,
    agentProvider,
    authenticated: Boolean(session),
    user: session ? { id: session.userId, login: session.login, displayName: session.displayName } : null,
  });
  if (session && refreshed) response.cookies.set(SESSION_COOKIE, encryptSession(session), sessionCookieOptions);
  if (!session) response.cookies.delete(SESSION_COOKIE);
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete(SESSION_COOKIE);
  return response;
}
