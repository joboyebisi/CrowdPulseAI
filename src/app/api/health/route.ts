import { NextResponse } from "next/server";
import { agentProvider, env, isTwitchConfigured } from "@/lib/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const serverless = Boolean(process.env.VERCEL);
  return NextResponse.json({
    status: "ok",
    orchestration: {
      version: "moment-pipeline-v1",
      agents: ["signal-scout", "clip-director", "pundit", "growth-producer"],
      provider: agentProvider,
      model: env.GEMINI_API_KEY ? env.GEMINI_MODEL : env.OPENAI_API_KEY ? env.OPENAI_MODEL : null,
    },
    integrations: {
      twitchOAuth: isTwitchConfigured,
      gemini: Boolean(env.GEMINI_API_KEY),
      openaiFallback: Boolean(env.OPENAI_API_KEY),
    },
    realtime: {
      transport: "eventsub-websocket",
      durableInCurrentRuntime: !serverless,
      note: serverless
        ? "Use an always-on worker or a signed EventSub webhook plus durable storage for production listeners."
        : "The persistent Node.js process can own the EventSub WebSocket.",
    },
  }, { headers: { "Cache-Control": "no-store" } });
}
