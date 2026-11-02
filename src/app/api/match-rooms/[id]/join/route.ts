import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { joinMatchRoomSchema } from "@/lib/match-room-schema";
import { joinMatchRoom } from "@/lib/match-room-store";

const PARTICIPANT_COOKIE = "crowdpulse_supporter";

export const runtime = "nodejs";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const parsed = joinMatchRoomSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Add a supporter name and valid choices" }, { status: 400 });

  const cookieStore = await cookies();
  const participantId = cookieStore.get(PARTICIPANT_COOKIE)?.value ?? randomUUID();
  const room = joinMatchRoom(id, { participantId, ...parsed.data });
  if (!room) return NextResponse.json({ error: "This Match Room is unavailable" }, { status: 404 });

  const response = NextResponse.json({ room });
  response.cookies.set(PARTICIPANT_COOKIE, participantId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 180,
    path: "/",
  });
  return response;
}
