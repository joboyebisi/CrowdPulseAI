import { NextRequest, NextResponse } from "next/server";
import { env } from "@/lib/env";
import { syncAwsIntegrations } from "@/lib/aws-backend";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const supplied = request.headers.get("x-crowdpulse-secret");
  if (!env.AWS_INTERNAL_API_SECRET || supplied !== env.AWS_INTERNAL_API_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    return NextResponse.json(await syncAwsIntegrations());
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Integration sync failed" }, { status: 500 });
  }
}
