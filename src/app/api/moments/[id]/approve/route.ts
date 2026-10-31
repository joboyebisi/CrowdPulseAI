import { NextResponse } from "next/server";
import { reviewMoment } from "@/lib/store";

export async function POST(_: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const moment = reviewMoment(id, "approved");
  if (!moment) return NextResponse.json({ error: "Moment not found" }, { status: 404 });
  return NextResponse.json(moment);
}
