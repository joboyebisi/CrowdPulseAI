"use client";

import Link from "next/link";
import {
  Activity, ArrowUpRight, Bot, Check, CircleAlert, Copy, Flame, Loader2,
  LogOut, Megaphone, Play, Radio, Sparkles, Square, Twitch, Volume2, X,
} from "lucide-react";
import { Fragment, useCallback, useEffect, useState } from "react";
import type { Moment, MomentAgentName, RuntimeState } from "@/lib/types";

type SessionState = {
  configured: boolean;
  agentProvider: string;
  authenticated: boolean;
  user: { id: string; login: string; displayName: string } | null;
};

const emptyState: RuntimeState = {
  connected: false,
  connecting: false,
  hypeThreshold: 5,
  hypeWindowSeconds: 20,
  cooldownSeconds: 90,
  currentVotes: 0,
  recentChat: [],
  moments: [],
};

const pipelineAgents: Array<{
  name: MomentAgentName;
  label: string;
  description: string;
  icon: typeof Bot;
}> = [
  { name: "signal-scout", label: "01 Signal Scout", description: "Unique chat commands detect intent", icon: Bot },
  { name: "clip-director", label: "02 Clip Director", description: "Twitch captures the live window", icon: Flame },
  { name: "pundit", label: "03 Pundit", description: "Grounded commentary packages the story", icon: Volume2 },
  { name: "growth-producer", label: "04 Growth Producer", description: "Creator-review social drafts", icon: Megaphone },
];

export function DashboardClient() {
  const [session, setSession] = useState<SessionState | null>(null);
  const [state, setState] = useState<RuntimeState>(emptyState);
  const [busy, setBusy] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const [sessionResponse, stateResponse] = await Promise.all([
      fetch("/api/auth/session", { cache: "no-store" }),
      fetch("/api/state", { cache: "no-store" }),
    ]);
    setSession(await sessionResponse.json());
    setState(await stateResponse.json());
  }, []);

  useEffect(() => {
    const initial = window.setTimeout(() => void refresh(), 0);
    const timer = window.setInterval(refresh, 1500);
    return () => {
      window.clearTimeout(initial);
      window.clearInterval(timer);
    };
  }, [refresh]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const params = new URLSearchParams(window.location.search);
      const error = params.get("error");
      if (error === "twitch_not_configured") setNotice("Add Twitch credentials to .env.local before connecting.");
      if (error === "oauth_failed") setNotice("Twitch authorization did not complete. Please try again.");
      if (error === "token_exchange_failed") setNotice("Twitch returned an authorization code, but token exchange failed.");
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  async function action(key: string, url: string, method = "POST") {
    setBusy(key);
    setNotice(null);
    try {
      const response = await fetch(url, { method });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Action failed");
      await refresh();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Action failed");
    } finally {
      setBusy(null);
    }
  }

  const pending = state.moments.filter((moment) => ["capturing", "pending", "failed"].includes(moment.status));
  const approved = state.moments.filter((moment) => moment.status === "approved");
  const signalStrength = Math.min(100, Math.round((state.currentVotes / state.hypeThreshold) * 100));
  const latestRuns = state.moments[0]?.agentRuns ?? [];

  return (
    <div className="dashboard-layout">
      <aside className="dashboard-sidebar">
        <div className="dash-brand"><span className="mini-mark">▥</span> CROWD<span>PULSE</span></div>
        <nav>
          <a className="active" href="#live"><Activity size={18} /> Live control</a>
          <a href="#moments"><Sparkles size={18} /> Moments <b>{pending.length}</b></a>
          <Link href="/overlay"><Radio size={18} /> OBS overlay <ArrowUpRight size={15} /></Link>
        </nav>
        <div className="sidebar-foot">
          <div className="user-avatar">{session?.user?.displayName?.slice(0, 2).toUpperCase() ?? "CP"}</div>
          <div><strong>{session?.user?.displayName ?? "Demo creator"}</strong><small>{session?.authenticated ? `@${session.user?.login}` : "Not connected"}</small></div>
        </div>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-header" id="live">
          <div>
            <p>CROWDPULSE AGENT CONTROL ROOM</p>
            <h1>Turn crowd energy into growth.</h1>
          </div>
          <div className={`connection-pill ${state.connected ? "online" : ""}`}>
            <i /> {state.connected ? "Listening live" : state.connecting ? "Connecting…" : "Listener offline"}
          </div>
        </header>

        {notice && <div className="notice"><CircleAlert size={18} /> {notice}<button onClick={() => setNotice(null)}><X size={16} /></button></div>}

        <section className="agent-rail" aria-label="Moment agent pipeline">
          {pipelineAgents.map((agent, index) => {
            const run = latestRuns.find((item) => item.agent === agent.name);
            const Icon = agent.icon;
            return (
              <Fragment key={agent.name}>
                <div className={run?.status ?? "idle"} title={run?.detail}>
                  <Icon size={18} />
                  <span><b>{agent.label}</b><small>{run ? `${run.status} · ${run.detail}` : agent.description}</small></span>
                </div>
                {index < pipelineAgents.length - 1 && <i />}
              </Fragment>
            );
          })}
        </section>

        <section className="control-grid">
          <article className="control-card twitch-card">
            <div className="card-heading"><span><Twitch size={20} /></span><div><small>TWITCH CHANNEL</small><h2>{session?.authenticated ? session.user?.displayName : "Connect your channel"}</h2></div></div>
            {!session?.authenticated ? (
              <>
                <p>Authorize chat reading and clip creation. CrowdPulse never posts without your approval.</p>
                <a className={`button button-primary full ${session && !session.configured ? "disabled" : ""}`} href="/api/auth/twitch">
                  <Twitch size={17} /> Connect with Twitch
                </a>
                {session && !session.configured && <small className="config-hint">Twitch credentials are not configured yet.</small>}
              </>
            ) : (
              <>
                <div className="scope-row"><Check size={15} /> Chat read <Check size={15} /> Create clips</div>
                <div className="button-row">
                  {!state.connected ? (
                    <button className="button button-primary" disabled={busy === "listener"} onClick={() => action("listener", "/api/twitch/listener")}>
                      {busy === "listener" ? <Loader2 className="spin" size={17} /> : <Play size={17} />} Start listener
                    </button>
                  ) : (
                    <button className="button button-danger" onClick={() => action("listener", "/api/twitch/listener", "DELETE")}><Square size={15} /> Stop</button>
                  )}
                  <button className="icon-button" title="Disconnect Twitch" onClick={() => action("logout", "/api/auth/session", "DELETE")}><LogOut size={18} /></button>
                </div>
              </>
            )}
          </article>

          <article className="control-card pulse-card">
            <div className="card-heading"><span className="orange"><Flame size={20} /></span><div><small>CROWD SIGNAL</small><h2>{state.currentVotes} / {state.hypeThreshold} hype votes</h2></div></div>
            <div className="meter"><i style={{ width: `${signalStrength}%` }} /></div>
            <div className="metric-row"><span><b>{state.hypeWindowSeconds}s</b> voting window</span><span><b>{state.cooldownSeconds}s</b> cooldown</span></div>
            <button className="button button-secondary full" disabled={busy === "demo"} onClick={() => action("demo", "/api/demo/trigger")}>
              {busy === "demo" ? <Loader2 className="spin" size={17} /> : <Play size={17} />} Run sandbox rehearsal
            </button>
          </article>

          <article className="control-card stats-card">
            <div><small>SESSION MOMENTS</small><strong>{state.moments.length}</strong></div>
            <div><small>APPROVED</small><strong>{approved.length}</strong></div>
            <div><small>RECENT CHAT</small><strong>{state.recentChat.length}</strong></div>
          </article>
        </section>

        <section className="workspace-grid" id="moments">
          <div className="moments-panel">
            <div className="panel-title"><div><p>MOMENT AGENT</p><h2>Review queue</h2></div><span>{pending.length} pending</span></div>
            {pending.length === 0 ? (
              <div className="empty-state"><Sparkles size={28} /><h3>The crowd is warming up.</h3><p>Live candidates will appear here when unique <code>!hype</code> votes cross the threshold.</p></div>
            ) : pending.map((moment) => (
              <MomentReview key={moment.id} moment={moment} busy={busy} action={action} />
            ))}

            {approved.length > 0 && <div className="approved-heading">APPROVED MOMENTS</div>}
            {approved.map((moment) => <ApprovedMoment key={moment.id} moment={moment} />)}
          </div>

          <aside className="chat-panel">
            <div className="panel-title"><div><p>EVENTSUB</p><h2>Live chat signals</h2></div><i className={state.connected ? "blinking" : ""} /></div>
            <div className="chat-list">
              {state.recentChat.length === 0 ? <p className="chat-empty">No chat events yet.</p> : state.recentChat.map((chat) => (
                <div className={chat.message.toLowerCase() === "!hype" ? "chat-line hype" : "chat-line"} key={chat.id}>
                  <span>{chat.userName.slice(0, 2).toUpperCase()}</span>
                  <p><b>{chat.userName}</b>{chat.message}{chat.simulated && <em>DEMO</em>}</p>
                </div>
              ))}
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
}

function MomentReview({ moment, busy, action }: { moment: Moment; busy: string | null; action: (key: string, url: string, method?: string) => Promise<void> }) {
  const status = moment.status === "capturing" ? "Capturing Twitch clip…" : moment.status === "failed" ? "Capture needs attention" : "Ready for review";
  return (
    <article className={`review-card ${moment.status}`}>
      <div className="review-meta"><span><Flame size={15} /> {moment.hypeVotes} hype votes</span><span>{moment.simulated ? "SIMULATED DEMO" : "LIVE TWITCH"}</span></div>
      <h3>{moment.title}</h3>
      <p>{moment.caption}</p>
      <div className="pundit-line"><Volume2 size={16} /><span><small>PUNDIT VOICE</small>{moment.punditLine}</span></div>
      {moment.socialDrafts.length > 0 && (
        <div className="social-drafts">
          {moment.socialDrafts.map((draft) => (
            <div key={draft.platform}><small>{draft.platform}</small><p>{draft.copy}</p><em>{draft.hashtags.join(" ")}</em></div>
          ))}
        </div>
      )}
      <div className="agent-run-list" aria-label="Agent execution trace">
        {moment.agentRuns.map((run) => (
          <div className={run.status} key={run.agent}>
            <i />
            <span><b>{run.label}</b><small>{run.status} · {run.detail}</small></span>
          </div>
        ))}
      </div>
      {moment.failureReason && <div className="failure"><CircleAlert size={15} /> {moment.failureReason}</div>}
      <div className="context-chips">{moment.contributors.slice(0, 4).map((name) => <span key={name}>@{name}</span>)}</div>
      <div className="review-footer">
        <small>{moment.aiGenerated ? `${moment.agentProvider.toUpperCase()} · ` : ""}{status}</small>
        {moment.status === "pending" && <div className="button-row">
          <button className="button button-secondary" disabled={busy === moment.id} onClick={() => action(moment.id, `/api/moments/${moment.id}/reject`)}><X size={16} /> Reject</button>
          <button className="button button-primary" disabled={busy === moment.id} onClick={() => action(moment.id, `/api/moments/${moment.id}/approve`)}><Check size={16} /> Approve</button>
        </div>}
      </div>
    </article>
  );
}

function ApprovedMoment({ moment }: { moment: Moment }) {
  const shareUrl = typeof window === "undefined" ? `/moments/${moment.id}` : `${window.location.origin}/moments/${moment.id}`;
  const [copied, setCopied] = useState(false);
  return (
    <article className="approved-card">
      <div><small>{moment.simulated ? "DEMO MOMENT" : "TWITCH MOMENT"}</small><h3>{moment.title}</h3><p>{moment.hypeVotes} fans discovered this</p></div>
      <div className="button-row">
        <button className="icon-button" title="Copy share link" onClick={async () => { await navigator.clipboard.writeText(shareUrl); setCopied(true); }}>
          {copied ? <Check size={18} /> : <Copy size={18} />}
        </button>
        <Link className="button button-secondary" href={`/moments/${moment.id}`}>Open <ArrowUpRight size={16} /></Link>
      </div>
    </article>
  );
}
