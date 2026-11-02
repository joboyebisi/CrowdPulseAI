"use client";

import Link from "next/link";
import { ArrowUpRight, CalendarClock, Copy, Flame, Loader2, Plus, Sparkles, Users } from "lucide-react";
import { FormEvent, useCallback, useEffect, useState } from "react";
import type { MatchRoomSummary } from "@/lib/types";

function defaultKickoff() {
  const date = new Date(Date.now() + 24 * 60 * 60 * 1000);
  date.setMinutes(0, 0, 0);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
}

export function MatchRoomManager({ authenticated }: { authenticated: boolean }) {
  const [rooms, setRooms] = useState<MatchRoomSummary[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [briefs, setBriefs] = useState<Record<string, string[]>>({});

  const refresh = useCallback(async () => {
    if (!authenticated) return;
    const response = await fetch("/api/match-rooms", { cache: "no-store" });
    if (response.ok) setRooms((await response.json()).rooms);
  }, [authenticated]);

  useEffect(() => {
    const timer = window.setTimeout(() => void refresh(), 0);
    return () => window.clearTimeout(timer);
  }, [refresh]);

  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setNotice(null);
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/match-rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.get("title"),
          homeTeam: form.get("homeTeam"),
          awayTeam: form.get("awayTeam"),
          kickoffAt: new Date(String(form.get("kickoffAt"))).toISOString(),
          pollQuestion: form.get("pollQuestion"),
          pollOptions: [form.get("pollOne"), form.get("pollTwo"), form.get("pollThree")].filter(Boolean),
        }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Unable to create Match Room");
      setShowForm(false);
      setNotice("Match Room is open. Share the link and get the crowd warmed up! 🔥");
      await refresh();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Unable to create Match Room");
    } finally {
      setBusy(false);
    }
  }

  async function loadBrief(roomId: string) {
    const response = await fetch(`/api/match-rooms/${roomId}/brief`, { cache: "no-store" });
    if (!response.ok) return;
    const payload = await response.json();
    setBriefs((current) => ({ ...current, [roomId]: payload.brief }));
  }

  return (
    <section className="match-manager" id="match-rooms">
      <div className="panel-title">
        <div><p>⚽ BEFORE KICKOFF</p><h2>Match Rooms</h2></div>
        <button className="button button-primary" disabled={!authenticated} onClick={() => setShowForm((value) => !value)}><Plus size={17} /> New Match Room</button>
      </div>
      {!authenticated && <div className="match-manager-empty"><CalendarClock /><div><h3>Connect Twitch to open the stadium.</h3><p>Your channel identity becomes the host of every Match Room.</p></div></div>}
      {notice && <p className="manager-notice">{notice}</p>}
      {showForm && (
        <form className="match-create-form" onSubmit={create}>
          <label>Room title<input name="title" required defaultValue="The Big Match Warm-Up" /></label>
          <label>Home team<input name="homeTeam" required placeholder="Home team" /></label>
          <label>Away team<input name="awayTeam" required placeholder="Away team" /></label>
          <label>Kickoff<input name="kickoffAt" type="datetime-local" required defaultValue={defaultKickoff()} /></label>
          <label className="wide">Crowd question<input name="pollQuestion" required defaultValue="What's your bold call for the match?" /></label>
          <label>Poll option 1<input name="pollOne" required defaultValue="Home win" /></label>
          <label>Poll option 2<input name="pollTwo" required defaultValue="Away win" /></label>
          <label>Poll option 3<input name="pollThree" defaultValue="Draw" /></label>
          <div className="wide form-actions"><button type="button" className="button button-ghost" onClick={() => setShowForm(false)}>Cancel</button><button className="button button-primary" disabled={busy}>{busy ? <Loader2 className="spin" size={17} /> : <Sparkles size={17} />} Open the room</button></div>
        </form>
      )}
      {authenticated && rooms.length === 0 && !showForm && <div className="match-manager-empty"><Flame /><div><h3>No fixture on the board yet.</h3><p>Create a room for predictions, polls, and supporter check-ins.</p></div></div>}
      <div className="match-room-list">
        {rooms.map((room) => {
          const shareUrl = typeof window === "undefined" ? `/rooms/${room.id}` : `${window.location.origin}/rooms/${room.id}`;
          return (
            <article key={room.id}>
              <div><small>{room.status.toUpperCase()} · {new Date(room.kickoffAt).toLocaleString()}</small><h3>{room.homeTeam} <em>vs</em> {room.awayTeam}</h3><p><Users size={15} /> {room.supporterCount} checked in · {room.predictionCount} predictions</p></div>
              <div className="button-row"><button className="button button-ghost" onClick={() => loadBrief(room.id)}><Sparkles size={16} /> Opening brief</button><button className="icon-button" title="Copy supporter link" onClick={() => navigator.clipboard.writeText(shareUrl)}><Copy size={17} /></button><Link className="button button-secondary" href={`/rooms/${room.id}`}>Open <ArrowUpRight size={16} /></Link></div>
              {briefs[room.id] && <div className="opening-brief"><small>🎙️ YOUR OPENING TALKING POINTS</small>{briefs[room.id].map((line) => <p key={line}>{line}</p>)}</div>}
            </article>
          );
        })}
      </div>
    </section>
  );
}
