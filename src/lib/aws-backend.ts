import "server-only";
import { env } from "@/lib/env";
import type { MatchRoomSummary, Moment, RuntimeState, TwitchSession } from "@/lib/types";

export const isAwsBackendConfigured = Boolean(env.AWS_BACKEND_URL && env.AWS_INTERNAL_API_SECRET);

async function request<T>(path: string, init: RequestInit = {}, internal = false): Promise<T> {
  if (!env.AWS_BACKEND_URL) throw new Error("AWS_BACKEND_URL is not configured");
  const headers = new Headers(init.headers);
  if (init.body) headers.set("Content-Type", "application/json");
  if (internal) {
    if (!env.AWS_INTERNAL_API_SECRET) throw new Error("AWS_INTERNAL_API_SECRET is not configured");
    headers.set("X-CrowdPulse-Secret", env.AWS_INTERNAL_API_SECRET);
  }
  const response = await fetch(new URL(path, env.AWS_BACKEND_URL), { ...init, headers, cache: "no-store" });
  const payload = await response.json() as T & { error?: string };
  if (!response.ok) throw new Error(payload.error ?? `AWS backend failed (${response.status})`);
  return payload;
}

export async function registerCreator(session: TwitchSession) {
  if (!isAwsBackendConfigured) return null;
  return request<{ creator: { id: string }; subscription: { status: string } }>("/internal/creators", {
    method: "POST",
    body: JSON.stringify(session),
  }, true);
}

export async function listAwsMatchRooms(creatorId: string) {
  return request<{ rooms: MatchRoomSummary[] }>(`/internal/rooms?creatorId=${encodeURIComponent(creatorId)}`, {}, true);
}

export async function createAwsMatchRoom(input: object) {
  return request<{ room: MatchRoomSummary }>("/internal/rooms", { method: "POST", body: JSON.stringify(input) }, true);
}

export async function getAwsMatchRoom(id: string) {
  return request<{ room: MatchRoomSummary }>(`/rooms/${encodeURIComponent(id)}`);
}

export async function joinAwsMatchRoom(id: string, input: object) {
  return request<{ room: MatchRoomSummary }>(`/rooms/${encodeURIComponent(id)}/join`, { method: "POST", body: JSON.stringify(input) });
}

export async function getAwsOpeningBrief(id: string, creatorId: string) {
  return request<{ brief: string[] }>(`/internal/rooms/${encodeURIComponent(id)}/brief?creatorId=${encodeURIComponent(creatorId)}`, {}, true);
}

export async function getAwsState(creatorId: string) {
  return request<RuntimeState>(`/internal/state?creatorId=${encodeURIComponent(creatorId)}`, {}, true);
}

export async function reviewAwsMoment(id: string, creatorId: string, status: "approved" | "rejected") {
  return request<{ moment: Moment }>(`/internal/moments/${encodeURIComponent(id)}/review`, {
    method: "POST",
    body: JSON.stringify({ creatorId, status }),
  }, true);
}

export async function getAwsMoment(id: string) {
  return request<{ moment: Moment }>(`/moments/${encodeURIComponent(id)}`);
}
