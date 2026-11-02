import { notFound } from "next/navigation";
import { findMatchRoom } from "@/lib/match-room-store";
import { MatchRoomClient } from "@/components/match-room-client";
import { getAwsMatchRoom, isAwsBackendConfigured } from "@/lib/aws-backend";

export const dynamic = "force-dynamic";

export default async function MatchRoomPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let room = null;
  try {
    room = isAwsBackendConfigured ? (await getAwsMatchRoom(id)).room : findMatchRoom(id);
  } catch {
    room = null;
  }
  if (!room) notFound();
  return <MatchRoomClient initialRoom={room} />;
}
