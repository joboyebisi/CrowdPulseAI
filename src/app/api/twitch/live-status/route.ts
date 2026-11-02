import { NextResponse } from "next/server";
import { currentTwitchSession } from "@/lib/current-session";
import { twitchFetch } from "@/lib/twitch";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const session = await currentTwitchSession();
  if (!session) return NextResponse.json({ error: "Connect Twitch first" }, { status: 401 });

  try {
    const url = new URL("https://api.twitch.tv/helix/streams");
    url.searchParams.set("user_id", session.userId);
    const response = await twitchFetch(url.toString(), session.accessToken);
    const payload = await response.json() as { data: Array<{ id: string; title: string; game_name: string; viewer_count: number; started_at: string; thumbnail_url: string }> };
    const stream = payload.data[0] ?? null;
    return NextResponse.json({
      live: Boolean(stream),
      checkedAt: new Date().toISOString(),
      stream,
      channelUrl: `https://www.twitch.tv/${session.login}`,
      streamManagerUrl: "https://dashboard.twitch.tv/u/" + encodeURIComponent(session.login) + "/stream-manager",
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to read Twitch live status" }, { status: 502 });
  }
}
