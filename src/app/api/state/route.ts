import { NextResponse } from "next/server";
import { currentTwitchSession } from "@/lib/current-session";
import { snapshot } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const state = snapshot();
  const session = await currentTwitchSession();
  if (state.broadcasterId && state.broadcasterId !== session?.userId) {
    return NextResponse.json({ error: "Connect the active Twitch channel to view this session" }, { status: 403 });
  }
  return NextResponse.json(state, { headers: { "Cache-Control": "no-store" } });
}
