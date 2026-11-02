import Link from "next/link";
import { ArrowLeft, ExternalLink, Flame, Megaphone, Sparkles, Users, Volume2 } from "lucide-react";
import { notFound } from "next/navigation";
import { Logo } from "@/components/logo";
import { findMoment } from "@/lib/store";
import { getAwsMoment, isAwsBackendConfigured } from "@/lib/aws-backend";

export const dynamic = "force-dynamic";

export default async function MomentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let moment = findMoment(id);
  if (!moment && isAwsBackendConfigured) {
    try { moment = (await getAwsMoment(id)).moment; } catch { moment = null; }
  }
  if (!moment || moment.status !== "approved") notFound();
  return (
    <main className="share-page">
      <nav className="site-nav page-width"><Logo /><Link href="/dashboard"><ArrowLeft size={17} /> Creator dashboard</Link></nav>
      <section className="share-wrap">
        <div className="share-kicker"><Sparkles size={15} /> COMMUNITY-DISCOVERED MOMENT</div>
        <div className="share-card">
          <div className="share-media">
            {moment.thumbnailUrl ? <div className="moment-thumbnail" style={{ backgroundImage: `url(${moment.thumbnailUrl})` }} /> : <div className="moment-thumbnail placeholder"><span><i /><i /><i /></span><strong>CROWD MOMENT</strong></div>}
            <div className="share-hype"><Flame size={18} /> {Math.min(99, 70 + moment.hypeVotes * 3)}% HYPE</div>
          </div>
          <div className="share-copy">
            <small>FROM {moment.creatorName.toUpperCase()}’S COMMUNITY</small>
            <h1>{moment.title}</h1>
            <p>{moment.caption}</p>
            <div className="share-pundit"><Volume2 size={17} /><span><small>PUNDIT CALL</small>{moment.punditLine}</span></div>
            <div className="share-stats"><span><Flame /> {moment.hypeVotes} hype votes</span><span><Users /> {moment.contributors.length} discoverers</span></div>
            {moment.simulated && <div className="demo-disclosure">Demonstration moment — no Twitch clip was created.</div>}
            {moment.clipUrl && <a className="button button-primary button-large" href={moment.clipUrl} target="_blank" rel="noreferrer">Watch on Twitch <ExternalLink size={17} /></a>}
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
