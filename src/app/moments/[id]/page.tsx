import Link from "next/link";
import { ArrowLeft, ExternalLink, Flame, Sparkles, Users } from "lucide-react";
import { notFound } from "next/navigation";
import { Logo } from "@/components/logo";
import { findMoment } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function MomentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const moment = findMoment(id);
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
            <div className="share-stats"><span><Flame /> {moment.hypeVotes} hype votes</span><span><Users /> {moment.contributors.length} discoverers</span></div>
            {moment.simulated && <div className="demo-disclosure">Demonstration moment — no Twitch clip was created.</div>}
            {moment.clipUrl && <a className="button button-primary button-large" href={moment.clipUrl} target="_blank" rel="noreferrer">Watch on Twitch <ExternalLink size={17} /></a>}
          </div>
        </div>
        <p className="ai-label">AI-generated copy · Creator approved · Built with community signals</p>
      </section>
    </main>
  );
}
