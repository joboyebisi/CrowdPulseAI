import { randomUUID } from "node:crypto";
import type { BanterMessage, MatchRoom, MatchRoomResponse, MatchRoomSummary } from "@/lib/types";

type MatchRoomInput = Pick<
  MatchRoom,
  "creatorId" | "creatorName" | "title" | "homeTeam" | "awayTeam" | "kickoffAt" | "pollQuestion" | "pollOptions" | "arenaTitle" | "arenaPhase"
>;

type ParticipationInput = Pick<MatchRoomResponse, "participantId" | "displayName" | "scorePrediction" | "pollChoice">;

const globalRooms = globalThis as typeof globalThis & {
  crowdPulseMatchRooms?: Map<string, MatchRoom>;
};

const rooms = globalRooms.crowdPulseMatchRooms ?? new Map<string, MatchRoom>();
globalRooms.crowdPulseMatchRooms = rooms;

const globalBanter = globalThis as typeof globalThis & {
  crowdPulseBanter?: Map<string, BanterMessage[]>;
};
const banter = globalBanter.crowdPulseBanter ?? new Map<string, BanterMessage[]>();
globalBanter.crowdPulseBanter = banter;

function summarize(room: MatchRoom): MatchRoomSummary {
  const pollCounts = Object.fromEntries(room.pollOptions.map((option) => [option, 0]));
  for (const response of room.responses) {
    if (response.pollChoice && response.pollChoice in pollCounts) pollCounts[response.pollChoice] += 1;
  }
  const { responses, ...rest } = room;
  return {
    ...rest,
    supporterCount: responses.filter((response) => response.checkedIn).length,
    predictionCount: responses.filter((response) => Boolean(response.scorePrediction)).length,
    pollCounts,
    banterCount: banter.get(room.id)?.length ?? 0,
    recentBanter: (banter.get(room.id) ?? []).slice(0, 12),
  };
}

export function createMatchRoom(input: MatchRoomInput): MatchRoomSummary {
  const now = new Date().toISOString();
  const room: MatchRoom = {
    ...input,
    id: randomUUID(),
    status: "open",
    createdAt: now,
    updatedAt: now,
    responses: [],
  };
  rooms.set(room.id, room);
  return summarize(room);
}

export function listCreatorMatchRooms(creatorId: string): MatchRoomSummary[] {
  return [...rooms.values()]
    .filter((room) => room.creatorId === creatorId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map(summarize);
}

export function findMatchRoom(id: string): MatchRoomSummary | null {
  const room = rooms.get(id);
  return room ? summarize(room) : null;
}

export function joinMatchRoom(id: string, input: ParticipationInput): MatchRoomSummary | null {
  const room = rooms.get(id);
  if (!room || room.status !== "open") return null;
  if (input.pollChoice && !room.pollOptions.includes(input.pollChoice)) return null;

  const now = new Date().toISOString();
  const existing = room.responses.find((response) => response.participantId === input.participantId);
  if (existing) {
    Object.assign(existing, input, { checkedIn: true, updatedAt: now });
  } else {
    room.responses.push({ ...input, checkedIn: true, createdAt: now, updatedAt: now });
  }
  room.updatedAt = now;
  return summarize(room);
}

export function createOpeningBrief(id: string): string[] {
  const room = rooms.get(id);
  if (!room) return [];
  const summary = summarize(room);
  const leadingPoll = Object.entries(summary.pollCounts).sort((a, b) => b[1] - a[1])[0];
  const predictions = room.responses.map((response) => response.scorePrediction).filter(Boolean);
  return [
    `${summary.supporterCount} supporters checked in before kickoff.`,
    leadingPoll && leadingPoll[1] > 0
      ? `The crowd's leading call: ${leadingPoll[0]} (${leadingPoll[1]} votes).`
      : "The pre-match poll is still wide open.",
    predictions.length > 0
      ? `${predictions.length} score predictions are ready to react to on stream.`
      : "Ask chat for the first score prediction.",
  ];
}

export function listBanter(id: string): BanterMessage[] | null {
  if (!rooms.has(id)) return null;
  return [...(banter.get(id) ?? [])].slice(0, 30);
}

export function addBanter(id: string, input: Omit<BanterMessage, "id" | "roomId" | "createdAt">): BanterMessage | null {
  if (!rooms.has(id)) return null;
  const item: BanterMessage = { ...input, id: randomUUID(), roomId: id, createdAt: new Date().toISOString() };
  banter.set(id, [item, ...(banter.get(id) ?? [])].slice(0, 100));
  return item;
}

export function reactToBanter(roomId: string, messageId: string, reaction: "fire" | "laugh" | "clap"): BanterMessage | null {
  const item = banter.get(roomId)?.find((message) => message.id === messageId);
  if (!item) return null;
  item.reactionCounts = { fire: 0, laugh: 0, clap: 0, ...item.reactionCounts, [reaction]: (item.reactionCounts?.[reaction] ?? 0) + 1 };
  return item;
}

export function updateArenaPhase(id: string, creatorId: string, arenaPhase: "prematch" | "live" | "postmatch"): MatchRoomSummary | null {
  const room = rooms.get(id);
  if (!room || room.creatorId !== creatorId) return null;
  room.arenaPhase = arenaPhase;
  room.updatedAt = new Date().toISOString();
  return summarize(room);
}

export function spotlightBanter(roomId: string, messageId: string, creatorId: string, spotlight: "live" | "postmatch" | null): BanterMessage | null {
  const room = rooms.get(roomId);
  const item = banter.get(roomId)?.find((message) => message.id === messageId);
  if (!room || room.creatorId !== creatorId || !item) return null;
  if (spotlight) item.spotlight = spotlight;
  else delete item.spotlight;
  return item;
}
