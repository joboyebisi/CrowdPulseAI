import { NextResponse } from "next/server";
import { currentTwitchSession } from "@/lib/current-session";
import { createMatchRoomSchema } from "@/lib/match-room-schema";
import { createMatchRoom, listCreatorMatchRooms } from "@/lib/match-room-store";
import { createAwsMatchRoom, isAwsBackendConfigured, listAwsMatchRooms } from "@/lib/aws-backend";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const session = await currentTwitchSession();
  if (!session) return NextResponse.json({ error: "Connect Twitch to manage Match Rooms" }, { status: 401 });
  if (isAwsBackendConfigured) return NextResponse.json(await listAwsMatchRooms(session.userId));
  return NextResponse.json({ rooms: listCreatorMatchRooms(session.userId) });
}

export async function POST(request: Request) {
  const session = await currentTwitchSession();
  if (!session) return NextResponse.json({ error: "Connect Twitch to create a Match Room" }, { status: 401 });
  const parsed = createMatchRoomSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Check the teams, kickoff, and poll details" }, { status: 400 });
  }
  const input = {
    ...parsed.data,
    creatorId: session.userId,
    creatorName: session.displayName,
  };
  const room = isAwsBackendConfigured ? (await createAwsMatchRoom(input)).room : createMatchRoom(input);
  return NextResponse.json({ room }, { status: 201 });
}
