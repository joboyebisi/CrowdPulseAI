import assert from "node:assert/strict";
import test from "node:test";
import { parseEventSubChat } from "../src/lib/eventsub-message";
import { lastMinuteSurgeFixture } from "../src/lib/harness-fixtures";
import { orchestrateMoment } from "../src/lib/orchestrator";
import type { MomentPackage } from "../src/lib/caption";

const momentPackage: MomentPackage = {
  title: "The crowd called it",
  caption: "Five viewers found this moment live.",
  punditLine: "The crowd has spoken!",
  socialDrafts: [
    { platform: "TikTok", copy: "TikTok draft", hashtags: ["#Twitch"] },
    { platform: "YouTube Shorts", copy: "Shorts draft", hashtags: ["#Shorts"] },
    { platform: "X", copy: "X draft", hashtags: ["#CrowdPulse"] },
  ],
  agentProvider: "Harness fixture",
};

test("parses the official EventSub chat envelope shape", () => {
  const signal = parseEventSubChat(lastMinuteSurgeFixture[1], { simulated: true, timestamp: "2026-10-31T19:45:00.000Z" });
  assert.ok(signal);
  assert.equal(signal.message, "!hype");
  assert.equal(signal.userId, "viewer-02");
  assert.equal(signal.simulated, true);
});

test("runs the complete simulated agent pipeline without calling Twitch", async () => {
  let twitchCalled = false;
  const result = await orchestrateMoment({
    creatorName: "CrowdPulse FC",
    hypeVotes: 5,
    chatContext: ["viewer: !hype"],
    simulated: true,
  }, {
    generatePackage: async () => momentPackage,
    captureClip: async () => {
      twitchCalled = true;
      throw new Error("Unexpected Twitch call");
    },
  });

  assert.equal(twitchCalled, false);
  assert.deepEqual(result.agentRuns.map((run) => run.status), ["completed", "skipped", "completed", "completed"]);
  assert.equal(result.socialDrafts.length, 3);
});

test("runs live clip capture before the packaging agents complete", async () => {
  const result = await orchestrateMoment({
    creatorName: "Live Creator",
    hypeVotes: 5,
    chatContext: ["viewer: !clip"],
    simulated: false,
    session: {
      accessToken: "test-access",
      refreshToken: "test-refresh",
      expiresAt: Date.now() + 60_000,
      scopes: ["user:read:chat", "clips:edit"],
      userId: "broadcaster-1",
      login: "livecreator",
      displayName: "Live Creator",
    },
  }, {
    generatePackage: async () => momentPackage,
    captureClip: async () => ({ clipId: "clip-1", clipUrl: "https://clips.twitch.tv/example" }),
  });

  assert.equal(result.clipId, "clip-1");
  assert.deepEqual(result.agentRuns.map((run) => run.status), ["completed", "completed", "completed", "completed"]);
});

test("exposes a failed Clip Director run and stops downstream agents", async () => {
  let finalRuns = [] as Array<{ status: string }>;
  await assert.rejects(() => orchestrateMoment({
    creatorName: "Offline Creator",
    hypeVotes: 5,
    chatContext: ["viewer: !hype"],
    simulated: false,
    session: {
      accessToken: "test-access",
      refreshToken: "test-refresh",
      expiresAt: Date.now() + 60_000,
      scopes: ["user:read:chat", "clips:edit"],
      userId: "broadcaster-1",
      login: "offlinecreator",
      displayName: "Offline Creator",
    },
  }, {
    generatePackage: async () => momentPackage,
    captureClip: async () => { throw new Error("Broadcaster is not live"); },
    onProgress: (runs) => { finalRuns = runs; },
  }), /Broadcaster is not live/);

  assert.deepEqual(finalRuns.map((run) => run.status), ["completed", "failed", "queued", "queued"]);
});
