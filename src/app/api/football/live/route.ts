import { NextResponse } from "next/server";
import { env } from "@/lib/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type SportmonksFixture = {
  id: number;
  name: string;
  result_info?: string;
  state?: { short_name?: string; name?: string };
  scores?: Array<{ score?: { goals?: number } }>;
};

export async function GET() {
  if (!env.SPORTMONKS_API_TOKEN) {
    return NextResponse.json({
      configured: false,
      provider: "Historical replay",
      matches: [{ id: "clasico-2026", name: "Barcelona 1–2 Real Madrid", state: "FT · 25 Oct 2026", detail: "Mbappé 88' winner" }],
    }, { headers: { "Cache-Control": "no-store" } });
  }

  try {
    const response = await fetch("https://api.sportmonks.com/v3/football/livescores/inplay?include=state;scores", {
      headers: { Authorization: env.SPORTMONKS_API_TOKEN },
      cache: "no-store",
    });
    if (!response.ok) throw new Error(`Sportmonks returned ${response.status}`);
    const payload = await response.json() as { data?: SportmonksFixture[] };
    const matches = (payload.data ?? []).slice(0, 6).map((fixture) => ({
      id: String(fixture.id),
      name: fixture.name,
      state: fixture.state?.short_name ?? fixture.state?.name ?? "LIVE",
      detail: fixture.result_info ?? fixture.scores?.map((score) => score.score?.goals).filter((score) => score != null).join("–") ?? "Live update",
    }));
    return NextResponse.json({ configured: true, provider: "Sportmonks live", matches }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return NextResponse.json({ configured: true, provider: "Sportmonks live", matches: [], error: error instanceof Error ? error.message : "Live football feed unavailable" }, { status: 502 });
  }
}
