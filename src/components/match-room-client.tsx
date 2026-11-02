"use client";

import Link from "next/link";
import { CheckCircle2, Flame, MessageCircle, Radio, Send, Sparkles, Trophy, Users } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { Logo } from "@/components/logo";
import type { MatchRoomSummary } from "@/lib/types";

function countdown(kickoffAt: string) {
  const difference = Math.max(0, new Date(kickoffAt).getTime() - Date.now());
  const days = Math.floor(difference / 86_400_000);
  const hours = Math.floor((difference / 3_600_000) % 24);
  const minutes = Math.floor((difference / 60_000) % 60);
  const seconds = Math.floor((difference / 1000) % 60);
  return { days, hours, minutes, seconds };
}

export function MatchRoomClient({ initialRoom }: { initialRoom: MatchRoomSummary }) {
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

  useEffect(() => {
    const timer = window.setInterval(() => setClock(countdown(room.kickoffAt)), 1000);
    return () => window.clearInterval(timer);
  }, [room.kickoffAt]);

  useEffect(() => {
    let active = true;
    async function refreshBanter() {
      const response = await fetch(`/api/match-rooms/${room.id}/banter`, { cache: "no-store" });
      if (!active || !response.ok) return;
      const payload = await response.json();
      setRoom((current) => ({ ...current, banterCount: payload.messages.length, recentBanter: payload.messages.slice(0, 12) }));
    }
    const timer = window.setInterval(refreshBanter, 5_000);
    return () => { active = false; window.clearInterval(timer); };
  }, [room.id]);

  const totalPollVotes = useMemo(
    () => Object.values(room.pollCounts).reduce((total, count) => total + count, 0),
    [room.pollCounts],
  );

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setNotice(null);
    try {
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
        <div className="match-room-live"><Radio size={15} /> PRE-MATCH HQ · OPEN</div>
        <p className="match-host">Hosted by {room.creatorName}</p>
        <h1>{room.title}</h1>
        <div className="fixture-board">
          <strong>{room.homeTeam}</strong><span>VS</span><strong>{room.awayTeam}</strong>
        </div>
        <div className="countdown-board" aria-label="Countdown to kickoff">
          {Object.entries(clock).map(([label, value]) => <div key={label}><b>{String(value).padStart(2, "0")}</b><small>{label}</small></div>)}
        </div>
        <div className="room-crowd"><Users size={18} /><b>{room.supporterCount}</b> supporters checked in <Flame size={18} /><b>{room.predictionCount}</b> predictions</div>
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

      <section className="banter-room page-width">
        <div className="banter-heading"><div><small>📣 THE DIGITAL TERRACE</small><h2>Banter Room</h2><p>Match-day takes, rival replies, and the lines worth putting on stream.</p></div><span>{room.banterCount ?? 0} shouts</span></div>
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
              <article key={item.id}><div><b>{item.displayName}</b><span>{item.team}</span></div><p>{item.message}</p><small>{new Date(item.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</small></article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
