import { NextResponse } from "next/server";
import { runDemoSequence, snapshot } from "@/lib/store";

export const runtime = "nodejs";

export async function POST() {
  await runDemoSequence();
  return NextResponse.json(snapshot());
}
