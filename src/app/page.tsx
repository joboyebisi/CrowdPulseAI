import Link from "next/link";
import { ArrowRight, Bot, CalendarClock, CheckCircle2, CircleDot, Flame, Layers3, Mic2, Radio, Share2, Trophy, Twitch, Users } from "lucide-react";
import { LandingDemo } from "@/components/landing-demo";
import { Logo } from "@/components/logo";

export default function Home() {
  return (
    <main className="landing-page">
      <nav className="site-nav page-width">
        <Logo />
        <div className="nav-actions">
          <a href="#how">Match-day flow</a>
          <Link className="button button-ghost" href="/overlay">OBS overlay</Link>
          <Link className="button button-primary" href="/login"><Twitch size={17} /> Sign in with Twitch</Link>
        </div>
      </nav>

      <section className="hero page-width">
        <div className="hero-copy">
          <div className="eyebrow"><CircleDot size={14} /> The match-day control room for Twitch</div>
          <h1>Warm up the crowd.<br /><em>Capture the roar.</em></h1>
          <p className="hero-lede">
            Open a Match Room before kickoff, turn real Twitch chat into creator-approved clips during the chaos, and give every great moment an afterlife.
          </p>
          <div className="hero-actions">
            <Link className="button button-primary button-large" href="/login"><Twitch size={18} /> Connect Twitch &amp; enter</Link>
            <span className="microcopy"><CheckCircle2 size={16} /> Twitch login · fan-powered · creator approved</span>
          </div>
        </div>
        <LandingDemo />
      </section>

      <section className="proof-band">
        <div className="page-width proof-grid">
          <div><CalendarClock /><strong>Pre-match Match Rooms</strong><span>New</span></div>
          <div><Flame /><strong>Audience-triggered clips</strong><span>Implemented</span></div>
          <div><Mic2 /><strong>Pundit voice overlay</strong><span>Implemented</span></div>
          <div><Twitch /><strong>Twitch creator login</strong><span>Implemented</span></div>
        </div>
      </section>

      <section className="signal-strip">
        <div className="page-width signal-grid">
          <span><b>01</b> Fans predict</span>
          <ArrowRight />
          <span><b>02</b> Chat erupts</span>
          <ArrowRight />
          <span><b>03</b> Agents capture</span>
          <ArrowRight />
          <span><b>04</b> Creator amplifies</span>
        </div>
      </section>

      <section className="how page-width" id="how">
        <div className="section-heading">
          <div className="eyebrow">Before kickoff · during chaos · after history</div>
          <h2>One connected<br />match-day experience.</h2>
          <p>Not another clipping bot. CrowdPulse gives creators a pre-match ritual, a live crowd signal, and a reviewable growth package.</p>
        </div>
        <div className="feature-grid">
          <article>
            <span><Trophy /></span>
            <small>PRE-MATCH HQ</small>
            <h3>Open the stadium early.</h3>
            <p>Share a countdown room for score predictions, a bold-call poll, and supporter check-ins before you go live.</p>
          </article>
          <article>
            <span><Users /></span>
            <small>LIVE CROWD SIGNAL</small>
            <h3>The crowd knows first.</h3>
            <p>Unique <code>!hype</code> votes combine in a live window, turning terrace energy into an explainable moment trigger.</p>
          </article>
          <article>
            <span><Share2 /></span>
            <small>FULL-TIME AFTERLIFE</small>
            <h3>Approve, then amplify.</h3>
            <p>Grounded commentary and platform-ready drafts wait for creator review before the moment leaves the control room.</p>
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
          <Link className="button button-light button-large" href="/login">Sign in with Twitch <ArrowRight size={18} /></Link>
        </div>
      </section>
    </main>
  );
}
