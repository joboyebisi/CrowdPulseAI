import "server-only";
import { env } from "@/lib/env";
import type { SocialDraft } from "@/lib/types";

export type MomentPackage = {
  title: string;
  caption: string;
  punditLine: string;
  socialDrafts: SocialDraft[];
  agentProvider: string;
};

type MomentInput = {
  creatorName: string;
  hypeVotes: number;
  chatContext: string[];
};

const schema = {
  type: "object",
  additionalProperties: false,
  properties: {
    title: { type: "string" },
    caption: { type: "string" },
    punditLine: { type: "string" },
    socialDrafts: {
      type: "array",
      minItems: 3,
      maxItems: 3,
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          platform: { type: "string", enum: ["TikTok", "YouTube Shorts", "X"] },
          copy: { type: "string" },
          hashtags: { type: "array", items: { type: "string" }, maxItems: 5 },
        },
        required: ["platform", "copy", "hashtags"],
      },
    },
  },
  required: ["title", "caption", "punditLine", "socialDrafts"],
} as const;

function fallback(input: MomentInput): MomentPackage {
  const title = `${input.creatorName}'s crowd just found a moment`;
  return {
    title,
    caption: `${input.hypeVotes} fans hit !hype together. The crowd called the moment before the replay did.`,
    punditLine: `The crowd has spoken! ${input.hypeVotes} fans just called that moment.`,
    socialDrafts: [
      { platform: "TikTok", copy: `Chat knew this was a moment. ${input.hypeVotes} fans hit !hype.`, hashtags: ["#Twitch", "#LiveSports", "#CrowdPulse"] },
      { platform: "YouTube Shorts", copy: `${title} — discovered live by the community.`, hashtags: ["#Shorts", "#TwitchClips", "#Sports"] },
      { platform: "X", copy: `The crowd called it live: ${input.hypeVotes} unique !hype votes. Creator review complete.`, hashtags: ["#Twitch", "#CrowdPulse"] },
    ],
    agentProvider: "Grounded fallback",
  };
}

const systemPrompt = [
  "You are the CrowdPulse agent team packaging a live sports-stream moment.",
  "Use only supplied facts. Never infer a team, player, score, competition, result, or play.",
  "Write an energetic but non-abusive pundit line suitable for text-to-speech.",
  "Create distinct drafts for TikTok, YouTube Shorts, and X. Do not claim the clip is vertically edited or posted.",
  "Title <= 70 chars, caption <= 180 chars, pundit line <= 180 chars.",
  "Return only JSON matching the schema.",
].join(" ");

async function withGemini(input: MomentInput): Promise<MomentPackage | null> {
  if (!env.GEMINI_API_KEY) return null;
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${env.GEMINI_MODEL}:generateContent`,
    {
      method: "POST",
      headers: {
        "x-goog-api-key": env.GEMINI_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: `${systemPrompt}\n\nINPUT:\n${JSON.stringify(input)}` }] }],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: schema,
          temperature: 0.7,
        },
      }),
    },
  );
  if (!response.ok) return null;
  const payload = await response.json() as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  const text = payload.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) return null;
  return { ...(JSON.parse(text) as Omit<MomentPackage, "agentProvider">), agentProvider: "Gemini 3.8" };
}

async function withOpenAI(input: MomentInput): Promise<MomentPackage | null> {
  if (!env.OPENAI_API_KEY) return null;
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: env.OPENAI_MODEL,
      input: [{ role: "system", content: systemPrompt }, { role: "user", content: JSON.stringify(input) }],
      text: { format: { type: "json_schema", name: "moment_package", strict: true, schema } },
    }),
  });
  if (!response.ok) return null;
  const payload = await response.json() as { output_text?: string };
  if (!payload.output_text) return null;
  return { ...(JSON.parse(payload.output_text) as Omit<MomentPackage, "agentProvider">), agentProvider: "OpenAI" };
}

export async function generateMomentPackage(input: MomentInput): Promise<MomentPackage> {
  try {
    return await withGemini(input) ?? await withOpenAI(input) ?? fallback(input);
  } catch {
    return fallback(input);
  }
}

export const generateCaption = generateMomentPackage;
