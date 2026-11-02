import type { EventSubChatEnvelope } from "@/lib/eventsub-message";
import type { MomentPackage } from "@/lib/caption";
import type { Moment } from "@/lib/types";

export const CLASICO_DEMO_MOMENT_ID = "clasico-2026-mbappe-88";

const messages = [
  ["viewer-01", "culerscope", "Barça were level — this Clásico is chaos"],
  ["viewer-02", "madridistamaya", "!hype"],
  ["viewer-03", "tacticaltoni", "MBAPPÉ IN THE 88TH — Bellingham started that move!"],
  ["viewer-04", "bernabeubites", "!clip"],
  ["viewer-05", "clasico_central", "!moment"],
  ["viewer-06", "pressboxpat", "!hype"],
  ["viewer-07", "eurofootyfan", "!hype"],
] as const;

export const lastMinuteSurgeFixture: EventSubChatEnvelope[] = messages.map(([userId, userName, text], index) => ({
  subscription: { type: "channel.chat.message" },
  event: {
    message_id: `harness-message-${index + 1}`,
    broadcaster_user_id: "harness-broadcaster",
    broadcaster_user_name: "El Clásico Control Room",
    chatter_user_id: userId,
    chatter_user_name: userName,
    message: { text },
  },
}));

export function createHarnessPackage(input: {
  creatorName: string;
  hypeVotes: number;
}): MomentPackage {
  return {
    title: "Mbappé wins El Clásico in the 88th minute",
    caption: `${input.hypeVotes} unique viewers called the decisive moment in Real Madrid's 2–1 win at Barcelona.`,
    punditLine: "Mbappé at the double! Madrid strike in the 88th minute and the Clásico swings white!",
    socialDrafts: [
      { platform: "TikTok", copy: "The 88th-minute strike that decided El Clásico — called live by chat.", hashtags: ["#ElClasico", "#RealMadrid", "#CrowdPulse"] },
      { platform: "YouTube Shorts", copy: "Mbappé's late winner, discovered by the crowd in real time.", hashtags: ["#Shorts", "#ElClasico", "#Football"] },
      { platform: "X", copy: `${input.hypeVotes} unique viewers called Mbappé's 88th-minute Clásico winner live.`, hashtags: ["#ElClasico", "#CrowdPulse"] },
    ],
    agentProvider: "Harness fixture",
  };
}

export function createApprovedClasicoMoment(): Moment {
  const completedAt = "2026-10-25T20:50:00.000Z";
  const packageData = createHarnessPackage({ creatorName: "El Clásico Control Room", hypeVotes: 5 });
  return {
    id: CLASICO_DEMO_MOMENT_ID,
    creatorId: "experience-preview",
    creatorName: "El Clásico Control Room",
    createdAt: completedAt,
    updatedAt: completedAt,
    ...packageData,
    status: "approved",
    hypeVotes: 5,
    contributors: ["madridistamaya", "bernabeubites", "clasico_central", "pressboxpat", "eurofootyfan"],
    chatContext: messages.map(([, userName, text]) => `${userName}: ${text}`),
    aiGenerated: false,
    simulated: true,
    thumbnailUrl: "/media/demo-streamer-reaction.png",
    agentRuns: [
      { agent: "signal-scout", label: "Signal Scout", status: "completed", completedAt, detail: "Five unique supporters crossed the hype threshold." },
      { agent: "clip-director", label: "Clip Director", status: "skipped", completedAt, detail: "Experience preview: no Twitch clip was requested." },
      { agent: "pundit", label: "Pundit", status: "completed", completedAt, detail: "Fixture-grounded Clásico commentary prepared." },
      { agent: "growth-producer", label: "Growth Producer", status: "completed", completedAt, detail: "Three creator-review social drafts prepared." },
    ],
  };
}
