import { NextResponse } from "next/server";
import { currentTwitchSession } from "@/lib/current-session";
import { createOpeningBrief, findMatchRoom } from "@/lib/match-room-store";

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  const session = await currentTwitchSession();
  if (!session) return NextResponse.json({ error: "Connect Twitch first" }, { status: 401 });
  const { id } = await context.params;
  const room = findMatchRoom(id);
  if (!room || room.creatorId !== session.userId) {
    return NextResponse.json({ error: "Match Room not found" }, { status: 404 });
  }
  return NextResponse.json({ brief: createOpeningBrief(id) });
}
