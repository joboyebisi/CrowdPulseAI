import { NextResponse } from "next/server";
import { currentTwitchSession } from "@/lib/current-session";
import { isAwsBackendConfigured, spotlightAwsBanter } from "@/lib/aws-backend";
import { banterSpotlightSchema } from "@/lib/match-room-schema";
import { spotlightBanter } from "@/lib/match-room-store";

export async function POST(request: Request, context: { params: Promise<{ id: string; messageId: string }> }) {
  const session = await currentTwitchSession();
  if (!session) return NextResponse.json({ error: "Creator login required" }, { status: 401 });
  const parsed = banterSpotlightSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Choose a valid spotlight" }, { status: 400 });
  const { id, messageId } = await context.params;
  const message = isAwsBackendConfigured
    ? (await spotlightAwsBanter(id, messageId, session.userId, parsed.data.spotlight)).message
    : spotlightBanter(id, messageId, session.userId, parsed.data.spotlight);
  return message ? NextResponse.json({ message }) : NextResponse.json({ error: "Banter not found" }, { status: 404 });
}
