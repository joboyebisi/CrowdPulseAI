import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { loadApprovedMoment } from "@/lib/moment-loader";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const moment = await loadApprovedMoment(id);
  if (!moment) return Response.json({ error: "Moment not found" }, { status: 404 });

  const imageUrl = moment.simulated
    ? `data:image/png;base64,${(await readFile(join(process.cwd(), "public", "media", "demo-streamer-reaction.png"))).toString("base64")}`
    : moment.thumbnailUrl;
  const hype = Math.min(99, 70 + moment.hypeVotes * 3);

  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", background: "#121212", color: "white", fontFamily: "Arial, sans-serif" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {imageUrl && <img src={imageUrl} alt="" width="1200" height="630" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />}
      <div style={{ position: "absolute", inset: 0, display: "flex", background: "linear-gradient(90deg, rgba(13,9,20,.96) 0%, rgba(13,9,20,.86) 43%, rgba(13,9,20,.12) 78%)" }} />
      <div style={{ position: "absolute", top: 44, left: 54, display: "flex", alignItems: "center", gap: 14, fontWeight: 800, fontSize: 25 }}>
        <span style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 30 }}><i style={{ width: 6, height: 13, background: "#c9ff57" }} /><i style={{ width: 6, height: 27, background: "#c9ff57" }} /><i style={{ width: 6, height: 20, background: "#c9ff57" }} /></span>
        CROWD<span style={{ color: "#9a70ff" }}>PULSE</span>
      </div>
      <div style={{ position: "absolute", top: 112, left: 54, display: "flex", padding: "10px 14px", background: "#ff5c35", fontSize: 18, fontWeight: 800 }}>{hype}% CROWD HYPE</div>
      <div style={{ position: "absolute", left: 54, bottom: 58, width: 650, display: "flex", flexDirection: "column" }}>
        <span style={{ color: "#c9ff57", fontSize: 17, fontWeight: 800, letterSpacing: 2 }}>{moment.simulated ? "LIVE EXPERIENCE PREVIEW · AI-DESIGNED REACTION VISUAL" : "TWITCH CLIP · CREATOR APPROVED"}</span>
        <div style={{ fontSize: 58, lineHeight: 1.02, fontWeight: 900, marginTop: 18, letterSpacing: -2 }}>{moment.title}</div>
        <div style={{ display: "flex", gap: 22, marginTop: 22, color: "#d3ccd9", fontSize: 19 }}>
          <span>{moment.hypeVotes} hype votes</span><span>•</span><span>{moment.contributors.length} discoverers</span>
        </div>
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
      headers: { "Cache-Control": "public, max-age=300, s-maxage=3600" },
    },
  );
}
