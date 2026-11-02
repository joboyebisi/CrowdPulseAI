import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { uploadAwsBanterMedia, isAwsBackendConfigured } from "@/lib/aws-backend";

const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const MAX_IMAGE_BYTES = 1_000_000;
const PARTICIPANT_COOKIE = "crowdpulse_supporter";

export const runtime = "nodejs";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const form = await request.formData();
  const file = form.get("image");
  if (!(file instanceof File) || !allowedTypes.has(file.type) || file.size > MAX_IMAGE_BYTES) {
    return NextResponse.json({ error: "Choose a JPG, PNG, WebP, or GIF under 1 MB" }, { status: 400 });
  }
  const participantId = (await cookies()).get(PARTICIPANT_COOKIE)?.value ?? randomUUID();
  if (!isAwsBackendConfigured) return NextResponse.json({ imageUrl: `data:${file.type};base64,${Buffer.from(await file.arrayBuffer()).toString("base64")}` });
  const { id } = await context.params;
  try {
    const payload = await uploadAwsBanterMedia(id, { contentType: file.type, data: Buffer.from(await file.arrayBuffer()).toString("base64"), participantId });
    const response = NextResponse.json(payload, { status: 201 });
    response.cookies.set(PARTICIPANT_COOKIE, participantId, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 60 * 60 * 24 * 180, path: "/" });
    return response;
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to upload image" }, { status: 502 });
  }
}
