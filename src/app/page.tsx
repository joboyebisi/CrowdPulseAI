import Link from "next/link";
import { ArrowRight, Bot, CheckCircle2, CircleDot, Flame, Layers3, Megaphone, Mic2, Radio, Share2, Twitch, Users } from "lucide-react";
import { LandingDemo } from "@/components/landing-demo";
import { Logo } from "@/components/logo";

export default function Home() {
  return (
    <main className="landing-page">
      <nav className="site-nav page-width">
        <Logo />
        <div className="nav-actions">
          <a href="#how">How it works</a>
          <Link className="button button-ghost" href="/overlay">OBS overlay</Link>
          <Link className="button button-primary" href="/dashboard">Open dashboard <ArrowRight size={17} /></Link>
        </div>
      </nav>

      <section className="hero page-width">
        <div className="hero-copy">
          <div className="eyebrow"><CircleDot size={14} /> Built for Twitch communities</div>
          <h1>Every moment has a crowd.<br /><em>Let the crowd make it legendary.</em></h1>
          <p className="hero-lede">
            CrowdPulse turns real Twitch chat into creator-approved clips, an AI pundit reaction, and platform-ready social drafts—while the moment is still alive.
          </p>
          <div className="hero-actions">
            <Link className="button button-primary button-large" href="/dashboard">Launch your agent team <ArrowRight size={18} /></Link>
            <span className="microcopy"><CheckCircle2 size={16} /> Real Twitch integration · creator approved</span>
          </div>
        </div>
        <LandingDemo />
      </section>

      <section className="proof-band">
        <div className="page-width proof-grid">
          <div><Twitch /><strong>EventSub live chat</strong><span>Implemented</span></div>
          <div><Flame /><strong>Audience-triggered clips</strong><span>Implemented</span></div>
          <div><Mic2 /><strong>Pundit voice overlay</strong><span>Implemented</span></div>
          <div><Megaphone /><strong>Social draft package</strong><span>Implemented</span></div>
        </div>
      </section>

      <section className="signal-strip">
        <div className="page-width signal-grid">
          <span><b>01</b> Chat reacts</span>
          <ArrowRight />
          <span><b>02</b> Agent captures</span>
          <ArrowRight />
          <span><b>03</b> Creator approves</span>
          <ArrowRight />
          <span><b>04</b> Fans amplify</span>
        </div>
      </section>

      <section className="how page-width" id="how">
        <div className="section-heading">
          <div className="eyebrow">One exceptional interaction</div>
          <h2>Collective intelligence,<br />built into the stream.</h2>
          <p>Not another clipping bot. CrowdPulse lets the community help decide what becomes part of the channel’s history.</p>
        </div>
        <div className="feature-grid">
          <article>
            <span><Users /></span>
            <small>COMMUNITY SIGNAL</small>
            <h3>The crowd knows first.</h3>
            <p>Unique <code>!hype</code> votes combine in a live window, turning audience energy into an explainable moment trigger.</p>
          </article>
          <article>
            <span><Bot /></span>
            <small>MOMENT AGENT</small>
            <h3>Context, not invention.</h3>
            <p>AI writes a title and social-ready caption grounded only in chat and available stream context.</p>
          </article>
          <article>
            <span><Share2 /></span>
            <small>CREATOR CONTROL</small>
            <h3>Approve, then amplify.</h3>
            <p>Every candidate waits for creator review before it becomes a branded, shareable CrowdPulse moment.</p>
          </article>
        </div>
      </section>

      <section className="agent-story">
        <div className="page-width">
          <div className="section-heading agent-heading">
            <div className="eyebrow">One signal. Four coordinated agents.</div>
            <h2>Not silent automation.<br />A live crowd event.</h2>
            <p>CrowdPulse does not replace the creator or process six-hour VODs in the background. It turns audience intent into an explainable, reviewable growth package in real time.</p>
          </div>
          <div className="agent-grid">
            <article><b>01</b><Users /><h3>Signal Scout</h3><p>Deduplicates <code>!hype</code>, <code>!clip</code>, and <code>!moment</code> across a live voting window.</p></article>
            <article><b>02</b><Radio /><h3>Clip Director</h3><p>Calls Twitch’s native Clips API, avoiding a costly live computer-vision pipeline.</p></article>
            <article><b>03</b><Bot /><h3>Pundit Agent</h3><p>Gemini 3.8 creates a grounded title, caption, and energetic spoken reaction from chat context.</p></article>
            <article><b>04</b><Share2 /><h3>Growth Producer</h3><p>Drafts distinct TikTok, YouTube Shorts, and X copy, then waits for creator approval.</p></article>
          </div>
        </div>
      </section>

      <section className="moment-economy page-width">
        <div>
          <div className="eyebrow">The creator-owned moment graph</div>
          <h2>A Top Shot-like memory layer—without pretending rights or scarcity exist.</h2>
        </div>
        <div className="moment-economy-card">
          <Layers3 size={26} />
          <small>CROWDPULSE MOMENT CARD · PRODUCT DIRECTION</small>
          <h3>Every approved clip gains provenance.</h3>
          <p>Creator, timestamp, crowd contributors, hype score, AI copy, and collection history form a durable Moment Card. Collections and fan quests come before wallets, trading, or NFTs.</p>
        </div>
      </section>

      <section className="cta-band">
        <div className="page-width cta-inner">
          <div>
            <Radio size={28} />
            <h2>Your audience already knows what matters.</h2>
          </div>
          <Link className="button button-light button-large" href="/dashboard">Start CrowdPulse <ArrowRight size={18} /></Link>
        </div>
      </section>
    </main>
  );
}
