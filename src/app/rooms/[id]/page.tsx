import { notFound } from "next/navigation";
import { findMatchRoom } from "@/lib/match-room-store";
import { MatchRoomClient } from "@/components/match-room-client";
import { getAwsMatchRoom, isAwsBackendConfigured } from "@/lib/aws-backend";
import { CLASICO_DEMO_ROOM, CLASICO_DEMO_ROOM_ID } from "@/lib/demo-match";

export const dynamic = "force-dynamic";

export default async function MatchRoomPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let room = id === CLASICO_DEMO_ROOM_ID ? CLASICO_DEMO_ROOM : null;
  try {
    if (!room) room = isAwsBackendConfigured ? (await getAwsMatchRoom(id)).room : findMatchRoom(id);
  } catch {
    room = null;
  }
  if (!room) notFound();
  return <MatchRoomClient initialRoom={room} demoMode={id === CLASICO_DEMO_ROOM_ID} />;
}
