import Link from "next/link";
import { ArrowLeft, Check, ShieldCheck, Sparkles, Twitch } from "lucide-react";
import { Logo } from "@/components/logo";

const errorMessages: Record<string, string> = {
  twitch_not_configured: "Twitch login is temporarily unavailable. The creator app needs configuration.",
  oauth_failed: "Twitch sign-in was cancelled or could not be verified. Please try again.",
  token_exchange_failed: "Twitch approved access, but the secure session could not be created. Please try again.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="login-page">
      <nav className="site-nav page-width">
        <Logo />
        <Link href="/"><ArrowLeft size={16} /> Back to home</Link>
      </nav>
      <section className="login-wrap page-width">
        <div className="login-story">
          <div className="eyebrow"><Sparkles size={14} /> Creator entrance</div>
          <h1>Your match-day<br /><em>control room.</em></h1>
          <p>Use your Twitch account as your CrowdPulse login. We identify your channel, connect live chat, and take you straight to your private creator dashboard.</p>
          <div className="login-benefits">
            <span><Check size={16} /> Open and share Match Rooms</span>
            <span><Check size={16} /> Capture crowd-triggered Twitch moments</span>
            <span><Check size={16} /> Review every clip before it is shared</span>
          </div>
        </div>
        <div className="login-card">
          <span className="login-icon"><Twitch size={30} /></span>
          <small>STREAMER LOGIN</small>
          <h2>Continue with Twitch</h2>
          <p>Twitch handles your identity. CrowdPulse never receives your Twitch password and never publishes without your approval.</p>
          {error && <div className="login-error">{errorMessages[error] ?? "Twitch sign-in did not complete. Please try again."}</div>}
          <a className="button button-primary button-large full" href="/api/auth/twitch"><Twitch size={18} /> Connect with Twitch</a>
          <Link className="button button-secondary full login-demo-link" href="/demo"><Sparkles size={17} /> Explore the live experience first</Link>
          <div className="login-trust"><ShieldCheck size={16} /> Secure OAuth · encrypted session · creator controlled</div>
        </div>
      </section>
    </main>
  );
}
