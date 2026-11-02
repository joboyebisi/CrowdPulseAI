import type { MatchRoomSummary } from "@/lib/types";

export const CLASICO_DEMO_ROOM_ID = "clasico-2026-crowd-room";

export const CLASICO_DEMO_ROOM: MatchRoomSummary = {
  id: CLASICO_DEMO_ROOM_ID,
  creatorId: "judge-demo",
  creatorName: "El Clásico Control Room",
  title: "Barcelona 1–2 Real Madrid · Crowd Replay",
  homeTeam: "Barcelona",
  awayTeam: "Real Madrid",
  kickoffAt: "2026-10-25T19:00:00.000Z",
  pollQuestion: "Who delivers the decisive Clásico moment?",
  pollOptions: ["Mbappé", "Bellingham", "Lamine Yamal"],
  status: "live",
  createdAt: "2026-10-25T17:00:00.000Z",
  updatedAt: "2026-10-25T20:50:00.000Z",
  supporterCount: 128,
  predictionCount: 94,
  pollCounts: { "Mbappé": 69, "Bellingham": 34, "Lamine Yamal": 25 },
  banterCount: 4,
  recentBanter: [
    { id: "banter-1", roomId: CLASICO_DEMO_ROOM_ID, authorId: "fan-1", displayName: "Madridista Maya", team: "Real Madrid", message: "One chance is all Mbappé needs. Madrid DNA. 🤍", createdAt: "2026-10-25T20:48:00.000Z" },
    { id: "banter-2", roomId: CLASICO_DEMO_ROOM_ID, authorId: "fan-2", displayName: "Culer Scope", team: "Barcelona", message: "We equalised once. There is still time for one more attack! 🔵🔴", createdAt: "2026-10-25T20:46:00.000Z" },
  ],
};
