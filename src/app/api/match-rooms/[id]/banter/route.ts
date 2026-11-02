import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { addAwsBanter, isAwsBackendConfigured, listAwsBanter } from "@/lib/aws-backend";
import { banterMessageSchema } from "@/lib/match-room-schema";
import { addBanter, listBanter } from "@/lib/match-room-store";

const PARTICIPANT_COOKIE = "crowdpulse_supporter";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  if (isAwsBackendConfigured) return NextResponse.json(await listAwsBanter(id), { headers: { "Cache-Control": "no-store" } });
  const messages = listBanter(id);
  return messages ? NextResponse.json({ messages }) : NextResponse.json({ error: "Match Room not found" }, { status: 404 });
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const parsed = banterMessageSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Keep banter friendly and under 180 characters" }, { status: 400 });
  const cookieStore = await cookies();
  const authorId = cookieStore.get(PARTICIPANT_COOKIE)?.value ?? randomUUID();
  const input = { authorId, ...parsed.data };
  const message = isAwsBackendConfigured ? (await addAwsBanter(id, input)).message : addBanter(id, input);
  if (!message) return NextResponse.json({ error: "Match Room not found" }, { status: 404 });
  const response = NextResponse.json({ message }, { status: 201 });
  response.cookies.set(PARTICIPANT_COOKIE, authorId, {
    httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 180, path: "/",
  });
  return response;
}
