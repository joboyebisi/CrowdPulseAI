import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { isTwitchConfigured } from "@/lib/env";
import { decryptSession, SESSION_COOKIE } from "@/lib/session";

export const runtime = "nodejs";

export async function GET() {
  const cookieStore = await cookies();
  const session = decryptSession(cookieStore.get(SESSION_COOKIE)?.value);
  return NextResponse.json({
    configured: isTwitchConfigured,
    authenticated: Boolean(session),
    user: session ? { id: session.userId, login: session.login, displayName: session.displayName } : null,
  });
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete(SESSION_COOKIE);
  return response;
}
