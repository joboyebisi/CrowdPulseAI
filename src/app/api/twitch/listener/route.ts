import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { startEventSub, stopEventSub } from "@/lib/eventsub";
import { decryptSession, SESSION_COOKIE } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  const cookieStore = await cookies();
  const session = decryptSession(cookieStore.get(SESSION_COOKIE)?.value);
  if (!session) return NextResponse.json({ error: "Connect Twitch first" }, { status: 401 });
  try {
    await startEventSub(session);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to start EventSub" },
      { status: 500 },
    );
  }
}

export async function DELETE() {
  stopEventSub();
  return NextResponse.json({ ok: true });
}
