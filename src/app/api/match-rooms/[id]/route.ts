import { NextResponse } from "next/server";
import { findMatchRoom } from "@/lib/match-room-store";
import { getAwsMatchRoom, isAwsBackendConfigured } from "@/lib/aws-backend";
import { updateAwsArenaPhase } from "@/lib/aws-backend";
import { currentTwitchSession } from "@/lib/current-session";
import { arenaPhaseSchema } from "@/lib/match-room-schema";
import { updateArenaPhase } from "@/lib/match-room-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const room = isAwsBackendConfigured ? (await getAwsMatchRoom(id)).room : findMatchRoom(id);
  if (!room) return NextResponse.json({ error: "Match Room not found" }, { status: 404 });
  return NextResponse.json({ room }, { headers: { "Cache-Control": "no-store" } });
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await currentTwitchSession();
  if (!session) return NextResponse.json({ error: "Connect Twitch to control this Arena" }, { status: 401 });
  const parsed = arenaPhaseSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Choose a valid Arena phase" }, { status: 400 });
  const { id } = await context.params;
  const room = isAwsBackendConfigured
    ? (await updateAwsArenaPhase(id, session.userId, parsed.data.arenaPhase)).room
    : updateArenaPhase(id, session.userId, parsed.data.arenaPhase);
  return room ? NextResponse.json({ room }) : NextResponse.json({ error: "Arena not found" }, { status: 404 });
}
