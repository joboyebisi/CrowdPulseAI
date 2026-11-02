import { NextResponse } from "next/server";
import { currentTwitchSession } from "@/lib/current-session";
import { findMoment, reviewMoment } from "@/lib/store";
import { isAwsBackendConfigured, reviewAwsMoment } from "@/lib/aws-backend";
import { CLASICO_DEMO_MOMENT_ID, createApprovedClasicoMoment } from "@/lib/harness-fixtures";

export async function POST(_: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  if (id === CLASICO_DEMO_MOMENT_ID) return NextResponse.json({ ...createApprovedClasicoMoment(), status: "rejected" });
  const existing = findMoment(id);
  const session = await currentTwitchSession();
  if (!existing && isAwsBackendConfigured && session) {
    return NextResponse.json((await reviewAwsMoment(id, session.userId, "rejected")).moment);
  }
  if (existing && !existing.simulated && existing.creatorId !== session?.userId) {
    return NextResponse.json({ error: "This moment belongs to another creator" }, { status: 403 });
  }
  const moment = reviewMoment(id, "rejected");
  if (!moment) return NextResponse.json({ error: "Moment not found" }, { status: 404 });
  return NextResponse.json(moment);
}
