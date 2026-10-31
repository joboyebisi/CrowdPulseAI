import type { EventSubChatEnvelope } from "@/lib/eventsub-message";
import type { MomentPackage } from "@/lib/caption";

const messages = [
  ["viewer-01", "awaydaysamy", "That reaction was everything"],
  ["viewer-02", "northbanklee", "!hype"],
  ["viewer-03", "tacticaltoni", "THE TIMING"],
  ["viewer-04", "goalpostguru", "!clip"],
  ["viewer-05", "matchdaymaya", "!moment"],
  ["viewer-06", "pressboxpat", "!hype"],
  ["viewer-07", "ultrasunited", "!hype"],
] as const;

export const lastMinuteSurgeFixture: EventSubChatEnvelope[] = messages.map(([userId, userName, text], index) => ({
  subscription: { type: "channel.chat.message" },
  event: {
    message_id: `harness-message-${index + 1}`,
    broadcaster_user_id: "harness-broadcaster",
    broadcaster_user_name: "CrowdPulse FC",
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
    title: `${input.creatorName}'s crowd called the moment`,
    caption: `${input.hypeVotes} unique viewers triggered this review-ready moment.`,
    punditLine: "The crowd called it together—and the control room has the package ready!",
    socialDrafts: [
      { platform: "TikTok", copy: "Chat called this live.", hashtags: ["#Twitch", "#CrowdPulse"] },
      { platform: "YouTube Shorts", copy: "A moment discovered by the crowd.", hashtags: ["#Shorts", "#Twitch"] },
      { platform: "X", copy: `${input.hypeVotes} unique viewers called the moment live.`, hashtags: ["#CrowdPulse"] },
    ],
    agentProvider: "Harness fixture",
  };
}
