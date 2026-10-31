import { parseEventSubChat } from "../src/lib/eventsub-message";
import { lastMinuteSurgeFixture } from "../src/lib/harness-fixtures";
import { isHypeCommand } from "../src/lib/hype";
import { orchestrateMoment } from "../src/lib/orchestrator";

const signals = lastMinuteSurgeFixture
  .map((event) => parseEventSubChat(event, { simulated: true, timestamp: "2026-10-31T19:45:00.000Z" }))
  .filter((signal) => signal !== null);
const voters = new Set(signals.filter((signal) => isHypeCommand(signal.message)).map((signal) => signal.userId));

async function main() {
const output = await orchestrateMoment({
  creatorName: "CrowdPulse FC",
  hypeVotes: voters.size,
  chatContext: signals.slice(-10).map((signal) => `${signal.userName}: ${signal.message}`),
  simulated: true,
}, {
  captureClip: async () => {
    throw new Error("The harness must never call Twitch");
  },
  generatePackage: async (input) => ({
    title: `${input.creatorName}'s crowd called the moment`,
    caption: `${input.hypeVotes} unique viewers triggered this review-ready moment.`,
    punditLine: "The crowd called it together—and the control room has the package ready!",
    socialDrafts: [
      { platform: "TikTok", copy: "Chat called this live.", hashtags: ["#Twitch", "#CrowdPulse"] },
      { platform: "YouTube Shorts", copy: "A moment discovered by the crowd.", hashtags: ["#Shorts", "#Twitch"] },
      { platform: "X", copy: "Five unique viewers called the moment live.", hashtags: ["#CrowdPulse"] },
    ],
    agentProvider: "Harness fixture",
  }),
});

console.log(JSON.stringify({
  scenario: "last-minute-surge",
  eventSubMessages: signals.length,
  uniqueHypeVoters: voters.size,
  title: output.title,
  agentRuns: output.agentRuns.map(({ label, status, detail }) => ({ label, status, detail })),
  socialDrafts: output.socialDrafts.map((draft) => draft.platform),
}, null, 2));
}

void main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
