import { z } from "zod";

const serverSchema = z.object({
  TWITCH_CLIENT_ID: z.string().min(1).optional(),
  TWITCH_CLIENT_SECRET: z.string().min(1).optional(),
  TWITCH_REDIRECT_URI: z.string().url().default("http://localhost:3000/api/auth/twitch/callback"),
  SESSION_SECRET: z.string().min(32).optional(),
  OPENAI_API_KEY: z.string().min(1).optional(),
  OPENAI_MODEL: z.string().default("gpt-5-mini"),
  HYPE_THRESHOLD: z.coerce.number().int().min(2).max(100).default(5),
  HYPE_WINDOW_SECONDS: z.coerce.number().int().min(5).max(300).default(20),
  HYPE_COOLDOWN_SECONDS: z.coerce.number().int().min(10).max(3600).default(90),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
});

export const env = serverSchema.parse({
  TWITCH_CLIENT_ID: process.env.TWITCH_CLIENT_ID,
  TWITCH_CLIENT_SECRET: process.env.TWITCH_CLIENT_SECRET,
  TWITCH_REDIRECT_URI: process.env.TWITCH_REDIRECT_URI,
  SESSION_SECRET: process.env.SESSION_SECRET,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  OPENAI_MODEL: process.env.OPENAI_MODEL,
  HYPE_THRESHOLD: process.env.HYPE_THRESHOLD,
  HYPE_WINDOW_SECONDS: process.env.HYPE_WINDOW_SECONDS,
  HYPE_COOLDOWN_SECONDS: process.env.HYPE_COOLDOWN_SECONDS,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
});

export const isTwitchConfigured = Boolean(
  env.TWITCH_CLIENT_ID && env.TWITCH_CLIENT_SECRET && env.SESSION_SECRET,
);
