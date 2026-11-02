import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { isAwsBackendConfigured, reactAwsBanter } from "@/lib/aws-backend";
import { banterReactionSchema } from "@/lib/match-room-schema";
import { reactToBanter } from "@/lib/match-room-store";

const PARTICIPANT_COOKIE = "crowdpulse_supporter";

export async function POST(request: Request, context: { params: Promise<{ id: string; messageId: string }> }) {
  const parsed = banterReactionSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Choose a valid reaction" }, { status: 400 });
  const { id, messageId } = await context.params;
  const participantId = (await cookies()).get(PARTICIPANT_COOKIE)?.value ?? randomUUID();
  try {
    const message = isAwsBackendConfigured
      ? (await reactAwsBanter(id, messageId, { participantId, reaction: parsed.data.reaction })).message
      : reactToBanter(id, messageId, parsed.data.reaction);
    if (!message) return NextResponse.json({ error: "Banter not found" }, { status: 404 });
    const response = NextResponse.json({ message });
    response.cookies.set(PARTICIPANT_COOKIE, participantId, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 60 * 60 * 24 * 180, path: "/" });
    return response;
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Unable to react";
    return NextResponse.json({ error: detail }, { status: detail.includes("already reacted") ? 409 : 502 });
  }
}
