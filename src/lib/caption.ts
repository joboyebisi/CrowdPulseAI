import { env } from "@/lib/env";

export async function generateCaption(input: {
  creatorName: string;
  hypeVotes: number;
  chatContext: string[];
}) {
  const fallback = {
    title: `${input.creatorName}'s crowd just found a moment`,
    caption: `${input.hypeVotes} fans hit !hype at once. The crowd called it before the replay did.`,
  };

  if (!env.OPENAI_API_KEY) return fallback;

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: env.OPENAI_MODEL,
      input: [
        {
          role: "system",
          content:
            "Write a safe sports-stream moment title and caption. Use only supplied facts. Do not infer teams, scores, players, or match events. Return strict JSON with title and caption strings. Title <= 70 chars, caption <= 180 chars.",
        },
        {
          role: "user",
          content: JSON.stringify(input),
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "moment_caption",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              title: { type: "string" },
              caption: { type: "string" },
            },
            required: ["title", "caption"],
          },
        },
      },
    }),
  });

  if (!response.ok) return fallback;
  const payload = (await response.json()) as { output_text?: string };
  if (!payload.output_text) return fallback;
  try {
    return JSON.parse(payload.output_text) as typeof fallback;
  } catch {
    return fallback;
  }
}
