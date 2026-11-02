"use client";

import Link from "next/link";
import { Bot, CheckCircle2, Crown, Flame, Gauge, MessageCircle, Mic2, Radio, Send, Sparkles, Trophy, Users } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { Logo } from "@/components/logo";
import type { MatchRoomSummary } from "@/lib/types";
import { CLASICO_DEMO_ROOM_ID } from "@/lib/demo-match";
import { buildBanterStandings, scoreBanter, topBanter } from "@/lib/banter-agent";

function countdown(kickoffAt: string) {
  const difference = Math.max(0, new Date(kickoffAt).getTime() - Date.now());
  const days = Math.floor(difference / 86_400_000);
  const hours = Math.floor((difference / 3_600_000) % 24);
  const minutes = Math.floor((difference / 60_000) % 60);
  const seconds = Math.floor((difference / 1000) % 60);
  return { days, hours, minutes, seconds };
}

export function MatchRoomClient({ initialRoom, demoMode = false }: { initialRoom: MatchRoomSummary; demoMode?: boolean }) {
  const [room, setRoom] = useState(initialRoom);
  const [clock, setClock] = useState(() => countdown(room.kickoffAt));
  const [displayName, setDisplayName] = useState("");
  const [scorePrediction, setScorePrediction] = useState("");
  const [pollChoice, setPollChoice] = useState(room.pollOptions[0] ?? "");
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [banterMessage, setBanterMessage] = useState("");
  const [banterTeam, setBanterTeam] = useState(room.homeTeam);
  const [banterBusy, setBanterBusy] = useState(false);
  const [banterNotice, setBanterNotice] = useState<string | null>(null);
  const [stageNomineeId, setStageNomineeId] = useState<string | null>(null);

  useEffect(() => {
    if (demoMode) return;
    const timer = window.setInterval(() => setClock(countdown(room.kickoffAt)), 1000);
    return () => window.clearInterval(timer);
  }, [demoMode, room.kickoffAt]);

  useEffect(() => {
    if (demoMode) return;
    let active = true;
    async function refreshBanter() {
      const response = await fetch(`/api/match-rooms/${room.id}/banter`, { cache: "no-store" });
      if (!active || !response.ok) return;
      const payload = await response.json();
      setRoom((current) => ({ ...current, banterCount: payload.messages.length, recentBanter: payload.messages.slice(0, 12) }));
    }
    const timer = window.setInterval(refreshBanter, 5_000);
    return () => { active = false; window.clearInterval(timer); };
  }, [demoMode, room.id]);

  const totalPollVotes = useMemo(
    () => Object.values(room.pollCounts).reduce((total, count) => total + count, 0),
    [room.pollCounts],
  );
  const banterMessages = useMemo(() => room.recentBanter ?? [], [room.recentBanter]);
  const banterStandings = useMemo(() => buildBanterStandings(banterMessages, room.homeTeam, room.awayTeam), [banterMessages, room.homeTeam, room.awayTeam]);
  const banterLeader = useMemo(() => topBanter(banterMessages), [banterMessages]);
  const stageNominee = banterMessages.find((message) => message.id === stageNomineeId) ?? null;

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setNotice(null);
    try {
      if (demoMode) {
        setRoom((current) => ({
          ...current,
          supporterCount: current.supporterCount + 1,
          predictionCount: current.predictionCount + (scorePrediction ? 1 : 0),
          pollCounts: { ...current.pollCounts, [pollChoice]: (current.pollCounts[pollChoice] ?? 0) + 1 },
        }));
        setNotice("You're on the preview team sheet — no production data was written. ⚽");
        return;
      }
      const response = await fetch(`/api/match-rooms/${room.id}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName, scorePrediction: scorePrediction || undefined, pollChoice }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Unable to join the Match Room");
      setRoom(payload.room);
      setNotice("You're on the team sheet! Your match-day call is locked in. ⚽");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Unable to join the Match Room");
    } finally {
      setBusy(false);
    }
  }

  async function submitBanter(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBanterBusy(true);
    setBanterNotice(null);
    try {
      if (demoMode) {
        const message = { id: `demo-banter-${Date.now()}`, roomId: CLASICO_DEMO_ROOM_ID, authorId: "demo-supporter", displayName, message: banterMessage, team: banterTeam, createdAt: new Date().toISOString() };
        setRoom((current) => ({ ...current, banterCount: (current.banterCount ?? 0) + 1, recentBanter: [message, ...(current.recentBanter ?? [])].slice(0, 12) }));
        setBanterMessage("");
        setBanterNotice("Your preview shout is on the terrace — no production data was written. 📣");
        return;
      }
      const response = await fetch(`/api/match-rooms/${room.id}/banter`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName, message: banterMessage, team: banterTeam }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Unable to post banter");
      setRoom((current) => ({
        ...current,
        banterCount: (current.banterCount ?? 0) + 1,
        recentBanter: [payload.message, ...(current.recentBanter ?? [])].slice(0, 12),
      }));
      setBanterMessage("");
      setBanterNotice("Your shout is on the terrace. Keep it clever, not cruel. 📣");
    } catch (error) {
      setBanterNotice(error instanceof Error ? error.message : "Unable to post banter");
    } finally {
      setBanterBusy(false);
    }
  }

  return (
    <main className="match-room-page">
      <nav className="site-nav page-width"><Logo /><Link href="/">What is CrowdPulse?</Link></nav>
      <section className="match-room-hero page-width">
        <div className="match-room-live"><Radio size={15} /> {demoMode ? "LIVE EXPERIENCE PREVIEW · HISTORICAL REPLAY" : "PRE-MATCH HQ · OPEN"}</div>
        <p className="match-host">Hosted by {room.creatorName}</p>
        <h1>{room.title}</h1>
        <div className="fixture-board">
          <strong>{room.homeTeam}</strong><span>VS</span><strong>{room.awayTeam}</strong>
        </div>
        <div className="countdown-board" aria-label="Countdown to kickoff">
          {Object.entries(clock).map(([label, value]) => <div key={label}><b>{String(value).padStart(2, "0")}</b><small>{label}</small></div>)}
        </div>
        <div className="room-crowd"><Users size={18} /><b>{room.supporterCount}</b> supporters checked in <Flame size={18} /><b>{room.predictionCount}</b> predictions</div>
        <a className="button button-secondary room-banter-jump" href="#banter-room"><MessageCircle size={17} /> Enter the Banter Arena · {room.banterCount ?? 0} shouts</a>
      </section>

      <section className="match-room-grid page-width">
        <form className="supporter-card" onSubmit={submit}>
          <div className="room-card-heading"><Trophy /><div><small>YOUR MATCH-DAY CALL</small><h2>Get on the team sheet</h2></div></div>
          <label>Supporter name<input required maxLength={30} value={displayName} onChange={(event) => setDisplayName(event.target.value)} placeholder="e.g. NorthBankLee" /></label>
          <label>Score prediction<input maxLength={20} value={scorePrediction} onChange={(event) => setScorePrediction(event.target.value)} placeholder={`${room.homeTeam} 2–1 ${room.awayTeam}`} /></label>
          <fieldset>
            <legend>{room.pollQuestion}</legend>
            {room.pollOptions.map((option) => (
              <label className="poll-option" key={option}>
                <input type="radio" name="poll" value={option} checked={pollChoice === option} onChange={() => setPollChoice(option)} />
                <span>{option}</span>
              </label>
            ))}
          </fieldset>
          <button className="button button-primary button-large full" disabled={busy}><Send size={18} /> {busy ? "Sending your call…" : "Join the crowd"}</button>
          {notice && <p className="room-notice"><CheckCircle2 size={17} /> {notice}</p>}
        </form>

        <aside className="crowd-card">
          <div className="room-card-heading"><Sparkles /><div><small>LIVE CROWD INTELLIGENCE</small><h2>Terrace pulse</h2></div></div>
          <h3>{room.pollQuestion}</h3>
          <div className="poll-results">
            {room.pollOptions.map((option) => {
              const votes = room.pollCounts[option] ?? 0;
              const percentage = totalPollVotes ? Math.round((votes / totalPollVotes) * 100) : 0;
              return <div key={option}><span><b>{option}</b><em>{percentage}%</em></span><i><b style={{ width: `${percentage}%` }} /></i></div>;
            })}
          </div>
          <div className="hype-callout"><Flame /><div><small>COMMUNITY HYPE</small><strong>{Math.min(99, 30 + room.supporterCount * 7)}%</strong></div><p>Every check-in turns up the atmosphere before the stream goes live.</p></div>
        </aside>
      </section>

      <section className="banter-room page-width" id="banter-room">
        <div className="banter-heading"><div><small>🏆 AI-ORCHESTRATED MATCH-UP</small><h2>Banter Arena</h2><p>Two clubs go head-to-head. The Banter Ref scores wit, relevance, energy, and sportsmanship.</p></div><span>{room.banterCount ?? 0} shouts</span></div>
        <div className="banter-scoreboard" aria-label="Live banter standings">
          {banterStandings.map((standing, index) => <article key={standing.team} className={index === 1 ? "away" : "home"}><small>{index === 0 ? "HOME END" : "AWAY END"}</small><strong>{standing.team}</strong><b>{standing.points} pts</b><span>{standing.shouts} shouts · {standing.average || "—"} avg</span></article>)}
          <div className="banter-ref"><Bot /><small>BANTER REF</small><strong>{banterStandings[0].points === banterStandings[1].points ? "Dead level" : `${[...banterStandings].sort((a, b) => b.points - a.points)[0].team} lead`}</strong><span>Live scoring · safe shouts only</span></div>
        </div>
        <div className="banter-director">
          <div><Gauge /><span><small>HOST CUE</small><b>{banterLeader ? `${banterLeader.message.team}: defend this take in 20 seconds.` : "Call for the opening shout from both ends."}</b></span></div>
          <div><Mic2 /><span><small>STAGE NOMINATION</small><b>{stageNominee ? `@${stageNominee.displayName} is ready for creator approval.` : "The creator chooses who gets invited on stream."}</b></span></div>
          {stageNominee && <button className="button button-secondary" onClick={() => setStageNomineeId(null)}>Clear nomination</button>}
        </div>
        <div className="banter-layout">
          <form className="banter-form" onSubmit={submitBanter}>
            <label>Supporter name<input required maxLength={30} value={displayName} onChange={(event) => setDisplayName(event.target.value)} placeholder="Your terrace name" /></label>
            <label>Your colours<select value={banterTeam} onChange={(event) => setBanterTeam(event.target.value)}><option>{room.homeTeam}</option><option>{room.awayTeam}</option><option>Neutral</option></select></label>
            <label className="wide">Your shout<textarea required minLength={2} maxLength={180} value={banterMessage} onChange={(event) => setBanterMessage(event.target.value)} placeholder="Keep it witty. Keep it football." /></label>
            <button className="button button-primary" disabled={banterBusy}><MessageCircle size={17} /> {banterBusy ? "Posting…" : "Post to the terrace"}</button>
            {banterNotice && <p className="room-notice">{banterNotice}</p>}
          </form>
          <div className="banter-feed">
            {(room.recentBanter ?? []).length === 0 ? <div className="banter-empty"><MessageCircle /><h3>First whistle, first shout.</h3><p>Start the friendly rivalry before kickoff.</p></div> : room.recentBanter?.map((item) => (
              <article key={item.id} className={stageNomineeId === item.id ? "nominated" : ""}><div><b>{item.displayName}</b><span>{item.team}</span></div><p>{item.message}</p><div className="banter-verdict"><span><Sparkles size={12} /> {scoreBanter(item).verdict}</span><b>{scoreBanter(item).total}/100</b></div><footer><small>{new Date(item.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</small>{scoreBanter(item).safe && <button type="button" onClick={() => setStageNomineeId(item.id)}><Crown size={13} /> Nominate to stage</button>}</footer></article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
