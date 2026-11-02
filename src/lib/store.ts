import { randomUUID } from "node:crypto";
import { generateCaption } from "@/lib/caption";
import { env } from "@/lib/env";
import { parseEventSubChat } from "@/lib/eventsub-message";
import { CLASICO_DEMO_MOMENT_ID, createHarnessPackage, lastMinuteSurgeFixture } from "@/lib/harness-fixtures";
import { isHypeCommand } from "@/lib/hype";
import { createAgentRuns, orchestrateMoment } from "@/lib/orchestrator";
import { createClip, waitForClip } from "@/lib/twitch";
import type { ChatSignal, Moment, RuntimeState, TwitchSession } from "@/lib/types";

type InternalStore = {
  state: RuntimeState;
  voters: Map<string, { name: string; at: number }>;
  captureInFlight: boolean;
  processedMessages: Set<string>;
  session?: TwitchSession;
};

const globalRuntime = globalThis as typeof globalThis & {
  crowdPulseStore?: InternalStore;
};

function createStore(): InternalStore {
  return {
    state: {
      connected: false,
      connecting: false,
      hypeThreshold: env.HYPE_THRESHOLD,
      hypeWindowSeconds: env.HYPE_WINDOW_SECONDS,
      cooldownSeconds: env.HYPE_COOLDOWN_SECONDS,
      currentVotes: 0,
      recentChat: [],
      moments: [],
    },
    voters: new Map(),
    captureInFlight: false,
    processedMessages: new Set(),
  };
}

export const runtime = globalRuntime.crowdPulseStore ?? createStore();
globalRuntime.crowdPulseStore = runtime;

export function snapshot(): RuntimeState {
  pruneVotes();
  return structuredClone(runtime.state);
}

export function setConnection(update: Partial<Pick<RuntimeState,
  "connected" | "connecting" | "listenerError" | "broadcasterId" | "broadcasterName"
>>) {
  Object.assign(runtime.state, update);
}

export function setRuntimeSession(session?: TwitchSession) {
  runtime.session = session;
}

function pruneVotes(now = Date.now()) {
  const cutoff = now - env.HYPE_WINDOW_SECONDS * 1000;
  for (const [userId, vote] of runtime.voters) {
    if (vote.at < cutoff) runtime.voters.delete(userId);
  }
  runtime.state.currentVotes = runtime.voters.size;
}

export function ingestChat(signal: ChatSignal): Promise<Moment> | null {
  if (runtime.processedMessages.has(signal.id)) return null;
  runtime.processedMessages.add(signal.id);
  if (runtime.processedMessages.size > 500) {
    const oldest = runtime.processedMessages.values().next().value;
    if (oldest) runtime.processedMessages.delete(oldest);
  }
  runtime.state.recentChat = [signal, ...runtime.state.recentChat].slice(0, 24);
  const isHype = isHypeCommand(signal.message);
  if (!isHype) return null;

  const now = Date.now();
  pruneVotes(now);
  if (!runtime.voters.has(signal.userId)) {
    runtime.voters.set(signal.userId, { name: signal.userName, at: now });
  }
  runtime.state.currentVotes = runtime.voters.size;

  const cooldownActive = runtime.state.cooldownUntil
    ? new Date(runtime.state.cooldownUntil).getTime() > now
    : false;
  if (
    runtime.voters.size >= env.HYPE_THRESHOLD &&
    !cooldownActive &&
    !runtime.captureInFlight
  ) {
    const simulated = Boolean(signal.simulated);
    return captureCandidate(simulated);
  }
  return null;
}

async function captureCandidate(simulated: boolean): Promise<Moment> {
  runtime.captureInFlight = true;
  const session = runtime.session;
  const contributors = [...runtime.voters.values()].map((vote) => vote.name);
  const context = runtime.state.recentChat.slice(0, 10).map((chat) => `${chat.userName}: ${chat.message}`);
  const now = new Date();
  const moment: Moment = {
    id: randomUUID(),
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    creatorId: session?.userId ?? "demo-creator",
    creatorName: session?.displayName ?? (simulated ? "El Clásico Control Room" : "CrowdPulse FC"),
    title: "Capturing the crowd's moment…",
    caption: "The Moment Agent is preparing context for creator review.",
    punditLine: "The crowd is calling a moment.",
    socialDrafts: [],
    agentProvider: "Pending",
    agentRuns: createAgentRuns(now),
    status: simulated ? "pending" : "capturing",
    hypeVotes: contributors.length,
    contributors,
    chatContext: context,
    aiGenerated: false,
    simulated,
  };
  runtime.state.moments = [moment, ...runtime.state.moments];
  runtime.state.cooldownUntil = new Date(now.getTime() + env.HYPE_COOLDOWN_SECONDS * 1000).toISOString();
  runtime.voters.clear();
  runtime.state.currentVotes = 0;

  try {
    const result = await orchestrateMoment({
      creatorName: moment.creatorName,
      hypeVotes: moment.hypeVotes,
      chatContext: moment.chatContext,
      simulated,
      session,
    }, {
      generatePackage: simulated ? async (input) => createHarnessPackage(input) : generateCaption,
      captureClip: async (activeSession) => {
        const pendingClip = await createClip(activeSession);
        const clip = await waitForClip(pendingClip.id, activeSession.accessToken);
        return { clipId: clip.id, clipUrl: clip.url, thumbnailUrl: clip.thumbnail_url };
      },
      onProgress: (agentRuns) => {
        moment.agentRuns = agentRuns;
        moment.updatedAt = new Date().toISOString();
      },
    });
    Object.assign(moment, result, { aiGenerated: !simulated, updatedAt: new Date().toISOString() });
    moment.status = "pending";
  } catch (error) {
    moment.status = "failed";
    moment.failureReason = error instanceof Error ? error.message : "Moment capture failed";
  } finally {
    moment.updatedAt = new Date().toISOString();
    runtime.captureInFlight = false;
  }
  return moment;
}

export function reviewMoment(id: string, status: "approved" | "rejected") {
  const moment = runtime.state.moments.find((item) => item.id === id);
  if (!moment) return null;
  if (moment.status !== "pending") return moment;
  moment.status = status;
  moment.updatedAt = new Date().toISOString();
  return moment;
}

export function findMoment(id: string) {
  return runtime.state.moments.find((item) => item.id === id) ?? null;
}

export async function runDemoSequence() {
  if (runtime.captureInFlight) return;
  runtime.state.moments = runtime.state.moments.filter((moment) => !moment.simulated);
  runtime.state.recentChat = runtime.state.recentChat.filter((chat) => !chat.simulated);
  runtime.state.cooldownUntil = undefined;
  runtime.voters.clear();
  runtime.processedMessages.clear();
  let capture: Promise<Moment> | null = null;
  for (const envelope of lastMinuteSurgeFixture) {
    const signal = parseEventSubChat(envelope, { simulated: true });
    if (!signal) continue;
    capture = ingestChat(signal) ?? capture;
  }
  const moment = await capture;
  if (moment) moment.id = CLASICO_DEMO_MOMENT_ID;
}

/** @deprecated Kept only for backwards-compatible local rehearsal imports. */
export async function runLegacyDemoSequence() {
  if (runtime.captureInFlight) return;
  runtime.state.cooldownUntil = undefined;
  runtime.voters.clear();
  const lines = [
    ["awaydaysamy", "That reaction 😭"],
    ["northbanklee", "!hype"],
    ["tacticaltoni", "THE TIMING"],
    ["goalpostguru", "!hype"],
    ["matchdaymaya", "!hype"],
    ["pressboxpat", "!hype"],
    ["ultrasunited", "!hype"],
  ];
  for (const [index, [name, message]] of lines.entries()) {
    ingestChat({
      id: `demo-${Date.now()}-${index}`,
      userId: `demo-${name}`,
      userName: name,
      message,
      timestamp: new Date().toISOString(),
      simulated: true,
    });
  }
}
