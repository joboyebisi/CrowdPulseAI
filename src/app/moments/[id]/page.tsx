import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Flame, Megaphone, Play, Sparkles, Users, Volume2 } from "lucide-react";
import { notFound } from "next/navigation";
import { Logo } from "@/components/logo";
import { MomentShareActions } from "@/components/moment-share-actions";
import { env } from "@/lib/env";
import { loadApprovedMoment, twitchClipSlug } from "@/lib/moment-loader";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const moment = await loadApprovedMoment(id);
  if (!moment) return { title: "Moment not found · CrowdPulse" };
  const canonical = new URL(`/moments/${id}`, env.NEXT_PUBLIC_APP_URL);
  const poster = new URL(`/api/moments/${id}/poster`, env.NEXT_PUBLIC_APP_URL);
  return {
    title: `${moment.title} · CrowdPulse`,
    description: moment.caption,
    alternates: { canonical },
    openGraph: {
      title: moment.title,
      description: moment.caption,
      url: canonical,
      type: "video.other",
      images: [{ url: poster, width: 1200, height: 630, alt: moment.title }],
    },
    twitter: { card: "summary_large_image", title: moment.title, description: moment.caption, images: [poster] },
  };
}

export default async function MomentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const moment = await loadApprovedMoment(id);
  if (!moment) notFound();
  const clipSlug = twitchClipSlug(moment.clipUrl);
  const embedParent = new URL(env.NEXT_PUBLIC_APP_URL).hostname;

  return (
    <main className="share-page">
      <nav className="site-nav page-width"><Logo /><Link href="/dashboard"><ArrowLeft size={17} /> Creator dashboard</Link></nav>
      <section className="share-wrap">
        <div className="share-kicker"><Sparkles size={15} /> COMMUNITY-DISCOVERED MOMENT</div>
        <div className="share-card">
          <div className="share-media">
            {clipSlug ? (
              <iframe
                className="moment-clip"
                src={`https://clips.twitch.tv/embed?clip=${encodeURIComponent(clipSlug)}&parent=${encodeURIComponent(embedParent)}&autoplay=false&muted=false`}
                title={`Twitch clip: ${moment.title}`}
                allowFullScreen
                loading="lazy"
              />
            ) : moment.thumbnailUrl ? (
              <div className="moment-thumbnail" style={{ backgroundImage: `url(${moment.thumbnailUrl})` }} />
            ) : (
              <div className="moment-thumbnail placeholder"><span><i /><i /><i /></span><strong>CROWD MOMENT</strong></div>
            )}
            <div className="share-hype"><Flame size={18} /> {Math.min(99, 70 + moment.hypeVotes * 3)}% HYPE</div>
            {moment.simulated && <div className="media-provenance"><Sparkles size={14} /> AI-DESIGNED CREATOR REACTION · PREVIEW</div>}
          </div>
          <div className="share-copy">
            <small>FROM {moment.creatorName.toUpperCase()}’S COMMUNITY</small>
            <h1>{moment.title}</h1>
            <p>{moment.caption}</p>
            <div className="share-pundit"><Volume2 size={17} /><span><small>PUNDIT CALL</small>{moment.punditLine}</span></div>
            <div className="share-stats"><span><Flame /> {moment.hypeVotes} hype votes</span><span><Users /> {moment.contributors.length} discoverers</span></div>
            {moment.simulated && <div className="demo-disclosure">Live experience preview — the crowd activity is fictional and the reaction visual is AI-designed. No Twitch clip or match footage is claimed.</div>}
            <MomentShareActions id={moment.id} title={moment.title} />
            {moment.clipUrl && <a className="watch-twitch" href={moment.clipUrl} target="_blank" rel="noreferrer"><Play size={16} /> Watch the source clip on Twitch <ExternalLink size={15} /></a>}
          </div>
        </div>
        {moment.socialDrafts.length > 0 && (
          <div className="share-social">
            <div className="share-kicker"><Megaphone size={15} /> CREATOR-APPROVED GROWTH PACKAGE</div>
            <div>{moment.socialDrafts.map((draft) => <article key={draft.platform}><small>{draft.platform}</small><p>{draft.copy}</p><em>{draft.hashtags.join(" ")}</em></article>)}</div>
          </div>
        )}
        <p className="ai-label">{moment.agentProvider} copy · Creator approved · Built with community signals</p>
      </section>
    </main>
  );
}
