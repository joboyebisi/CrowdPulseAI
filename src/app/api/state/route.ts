import { NextResponse } from "next/server";
import { currentTwitchSession } from "@/lib/current-session";
import { snapshot } from "@/lib/store";
import { getAwsState, isAwsBackendConfigured } from "@/lib/aws-backend";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const state = snapshot();
  const session = await currentTwitchSession();
  if (isAwsBackendConfigured && session) {
    const durable = await getAwsState(session.userId);
    const simulatedMoments = state.moments.filter((moment) => moment.simulated);
    const simulatedChat = state.recentChat.filter((chat) => chat.simulated);
    return NextResponse.json({
      ...durable,
      moments: [...simulatedMoments, ...durable.moments],
      recentChat: [...simulatedChat, ...durable.recentChat].slice(0, 24),
    }, { headers: { "Cache-Control": "no-store" } });
  }
  if (state.broadcasterId && state.broadcasterId !== session?.userId) {
    return NextResponse.json({ error: "Connect the active Twitch channel to view this session" }, { status: 403 });
  }
  return NextResponse.json(state, { headers: { "Cache-Control": "no-store" } });
}
