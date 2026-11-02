import type { MatchRoomSummary } from "@/lib/types";

export const CLASICO_DEMO_ROOM_ID = "clasico-2026-crowd-room";

export const CLASICO_DEMO_ROOM: MatchRoomSummary = {
  id: CLASICO_DEMO_ROOM_ID,
  creatorId: "experience-preview",
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
  arenaTitle: "El Clásico Extra-Time Arena",
  arenaPhase: "postmatch",
  banterCount: 4,
  recentBanter: [
    { id: "banter-1", roomId: CLASICO_DEMO_ROOM_ID, authorId: "fan-1", displayName: "Madridista Maya", team: "Real Madrid", message: "Barcelona brought the possession. Madrid brought the receipt. Mbappé signed it in the 88th. 🤍", reactionCounts: { fire: 28, laugh: 17, clap: 12 }, spotlight: "live", createdAt: "2026-10-25T20:48:00.000Z" },
    { id: "banter-2", roomId: CLASICO_DEMO_ROOM_ID, authorId: "fan-2", displayName: "Culer Scope", team: "Barcelona", message: "Madrid fans celebrating one counter like they invented running. Keep the ball; we'll invoice you for the cardio. 🔵🔴", reactionCounts: { fire: 19, laugh: 31, clap: 9 }, spotlight: "postmatch", createdAt: "2026-10-25T20:46:00.000Z" },
    { id: "banter-3", roomId: CLASICO_DEMO_ROOM_ID, authorId: "fan-3", displayName: "Bernabéu Ben", team: "Real Madrid", message: "Your press had more steps than a tactics thread and still ended at the same scoreboard.", reactionCounts: { fire: 22, laugh: 14, clap: 8 }, createdAt: "2026-10-25T20:44:00.000Z" },
    { id: "banter-4", roomId: CLASICO_DEMO_ROOM_ID, authorId: "fan-4", displayName: "Blaugrana Bea", team: "Barcelona", message: "Enjoy the result. We had the ball so long it qualifies for residency in Catalonia.", reactionCounts: { fire: 16, laugh: 26, clap: 11 }, imageUrl: "/media/demo-streamer-reaction.png", createdAt: "2026-10-25T20:42:00.000Z" },
  ],
};
