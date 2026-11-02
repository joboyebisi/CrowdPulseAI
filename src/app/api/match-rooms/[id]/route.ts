import { NextResponse } from "next/server";
import { findMatchRoom } from "@/lib/match-room-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const room = findMatchRoom(id);
  if (!room) return NextResponse.json({ error: "Match Room not found" }, { status: 404 });
  return NextResponse.json({ room }, { headers: { "Cache-Control": "no-store" } });
}
