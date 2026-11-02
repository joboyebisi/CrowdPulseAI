import { notFound } from "next/navigation";
import { findMatchRoom } from "@/lib/match-room-store";
import { MatchRoomClient } from "@/components/match-room-client";

export const dynamic = "force-dynamic";

export default async function MatchRoomPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const room = findMatchRoom(id);
  if (!room) notFound();
  return <MatchRoomClient initialRoom={room} />;
}
