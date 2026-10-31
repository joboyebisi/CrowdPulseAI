import Link from "next/link";
import { ArrowRight, Bot, CheckCircle2, CircleDot, Radio, Share2, Users } from "lucide-react";
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
            CrowdPulse turns live audience energy into creator-approved, AI-powered moments—captured, celebrated, and ready to share.
          </p>
          <div className="hero-actions">
            <Link className="button button-primary button-large" href="/dashboard">Connect your channel <ArrowRight size={18} /></Link>
            <span className="microcopy"><CheckCircle2 size={16} /> Creator stays in control</span>
          </div>
        </div>
        <LandingDemo />
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

      <section className="cta-band">
        <div className="page-width cta-inner">
          <div>
            <Radio size={28} />
            <h2>Your next iconic moment is already live.</h2>
          </div>
          <Link className="button button-light button-large" href="/dashboard">Start CrowdPulse <ArrowRight size={18} /></Link>
        </div>
      </section>
    </main>
  );
}
