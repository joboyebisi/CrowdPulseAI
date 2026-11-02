import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { startEventSub, stopEventSub } from "@/lib/eventsub";
import { decryptSession, encryptSession, SESSION_COOKIE, sessionCookieOptions } from "@/lib/session";
import { refreshTwitchSession } from "@/lib/twitch";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  const cookieStore = await cookies();
  let session = decryptSession(cookieStore.get(SESSION_COOKIE)?.value);
  if (!session) return NextResponse.json({ error: "Connect Twitch first" }, { status: 401 });
  try {
    const refreshed = session.expiresAt < Date.now() + 5 * 60 * 1000;
    if (refreshed) session = await refreshTwitchSession(session);
    await startEventSub(session);
    const response = NextResponse.json({ ok: true });
    if (refreshed) response.cookies.set(SESSION_COOKIE, encryptSession(session), sessionCookieOptions);
    return response;
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to start EventSub" },
      { status: 500 },
    );
  }
}

export async function DELETE() {
  const cookieStore = await cookies();
  const session = decryptSession(cookieStore.get(SESSION_COOKIE)?.value);
  if (!session) return NextResponse.json({ error: "Connect Twitch first" }, { status: 401 });
  stopEventSub();
  return NextResponse.json({ ok: true });
}
