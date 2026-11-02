import { NextResponse } from "next/server";
import { runDemoSequence, snapshot } from "@/lib/store";

export const runtime = "nodejs";

export async function POST() {
  await runDemoSequence();
  const state = snapshot();
  return NextResponse.json({
    ...state,
    connected: false,
    connecting: false,
    broadcasterId: "judge-demo",
    broadcasterName: "El Clásico Control Room",
    listenerError: undefined,
    recentChat: state.recentChat.filter((chat) => chat.simulated),
    moments: state.moments.filter((moment) => moment.simulated),
  });
}
