import { z } from "zod";

const serverSchema = z.object({
  TWITCH_CLIENT_ID: z.string().min(1).optional(),
  TWITCH_CLIENT_SECRET: z.string().min(1).optional(),
  TWITCH_REDIRECT_URI: z.string().url().default("http://localhost:3000/api/auth/twitch/callback"),
  SESSION_SECRET: z.string().min(32).optional(),
  OPENAI_API_KEY: z.string().min(1).optional(),
  OPENAI_MODEL: z.string().default("gpt-5-mini"),
  GEMINI_API_KEY: z.string().min(1).optional(),
  GEMINI_MODEL: z.string().default("gemini-3.8-flash"),
  HYPE_THRESHOLD: z.coerce.number().int().min(2).max(100).default(5),
  HYPE_WINDOW_SECONDS: z.coerce.number().int().min(5).max(300).default(20),
  HYPE_COOLDOWN_SECONDS: z.coerce.number().int().min(10).max(3600).default(90),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  AWS_BACKEND_URL: z.string().url().optional(),
  AWS_INTERNAL_API_SECRET: z.string().min(32).optional(),
});

export const env = serverSchema.parse({
  TWITCH_CLIENT_ID: process.env.TWITCH_CLIENT_ID,
  TWITCH_CLIENT_SECRET: process.env.TWITCH_CLIENT_SECRET,
  TWITCH_REDIRECT_URI: process.env.TWITCH_REDIRECT_URI,
  SESSION_SECRET: process.env.SESSION_SECRET,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  OPENAI_MODEL: process.env.OPENAI_MODEL,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  GEMINI_MODEL: process.env.GEMINI_MODEL,
  HYPE_THRESHOLD: process.env.HYPE_THRESHOLD,
  HYPE_WINDOW_SECONDS: process.env.HYPE_WINDOW_SECONDS,
  HYPE_COOLDOWN_SECONDS: process.env.HYPE_COOLDOWN_SECONDS,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  AWS_BACKEND_URL: process.env.AWS_BACKEND_URL,
  AWS_INTERNAL_API_SECRET: process.env.AWS_INTERNAL_API_SECRET,
});

export const isTwitchConfigured = Boolean(
  env.TWITCH_CLIENT_ID && env.TWITCH_CLIENT_SECRET && env.SESSION_SECRET,
);

export const agentProvider = env.GEMINI_API_KEY
  ? "Gemini 3.8"
  : env.OPENAI_API_KEY
    ? "OpenAI"
    : "Grounded fallback";
