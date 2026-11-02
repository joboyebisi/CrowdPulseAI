import { NextResponse } from "next/server";
import { currentTwitchSession } from "@/lib/current-session";
import { createMatchRoomSchema } from "@/lib/match-room-schema";
import { createMatchRoom, listCreatorMatchRooms } from "@/lib/match-room-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const session = await currentTwitchSession();
  if (!session) return NextResponse.json({ error: "Connect Twitch to manage Match Rooms" }, { status: 401 });
  return NextResponse.json({ rooms: listCreatorMatchRooms(session.userId) });
}

export async function POST(request: Request) {
  const session = await currentTwitchSession();
  if (!session) return NextResponse.json({ error: "Connect Twitch to create a Match Room" }, { status: 401 });
  const parsed = createMatchRoomSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Check the teams, kickoff, and poll details" }, { status: 400 });
  }
  const room = createMatchRoom({
    ...parsed.data,
    creatorId: session.userId,
    creatorName: session.displayName,
  });
  return NextResponse.json({ room }, { status: 201 });
}
