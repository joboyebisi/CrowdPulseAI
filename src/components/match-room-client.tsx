"use client";

import Link from "next/link";
import { Bot, Camera, CheckCircle2, Crown, Flame, ImagePlus, Laugh, MessageCircle, Mic2, Radio, Send, Sparkles, ThumbsUp, Trophy, Users, Zap } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { Logo } from "@/components/logo";
import type { BanterReaction, MatchRoomSummary } from "@/lib/types";
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

const phaseCopy = {
  prematch: { label: "BEFORE KICKOFF", title: "Light the fuse", cue: "Call for bold predictions. Give each side 30 seconds to land its opening line.", prompts: ["Drop your boldest score call — receipts stay open.", "Which star is about to go missing? Keep it clever."] },
  live: { label: "LIVE WATCHALONG", title: "Protect the stream", cue: "Keep the Arena visible, but bring only standout safe shouts into the live show.", prompts: ["Describe that miss without using the word terrible.", "One touch, one sentence: what just happened?"] },
  postmatch: { label: "EXTRA TIME", title: "Settle the score", cue: "Put the best shout from each side head-to-head and invite a post-match panel.", prompts: ["Closing argument: who owned the night?", "Write tomorrow's headline in one ruthless line."] },
} as const;

export function MatchRoomClient({ initialRoom, demoMode = false, creatorMode = false }: { initialRoom: MatchRoomSummary; demoMode?: boolean; creatorMode?: boolean }) {
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
  const [banterImage, setBanterImage] = useState<File | null>(null);

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
  const stageNominee = banterMessages.find((message) => message.id === stageNomineeId) ?? banterMessages.find((message) => message.spotlight) ?? null;
  const phase = room.arenaPhase ?? "prematch";
  const phaseInfo = phaseCopy[phase];

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
      let imageUrl: string | undefined;
      if (banterImage) {
        if (demoMode) imageUrl = URL.createObjectURL(banterImage);
        else {
          const media = new FormData(); media.set("image", banterImage);
          const upload = await fetch(`/api/match-rooms/${room.id}/media`, { method: "POST", body: media });
          const uploaded = await upload.json();
          if (!upload.ok) throw new Error(uploaded.error ?? "Unable to upload image");
          imageUrl = uploaded.imageUrl;
        }
      }
      if (demoMode) {
        const message = { id: `demo-banter-${Date.now()}`, roomId: CLASICO_DEMO_ROOM_ID, authorId: "demo-supporter", displayName, message: banterMessage, team: banterTeam, imageUrl, reactionCounts: { fire: 0, laugh: 0, clap: 0 }, createdAt: new Date().toISOString() };
        setRoom((current) => ({ ...current, banterCount: (current.banterCount ?? 0) + 1, recentBanter: [message, ...(current.recentBanter ?? [])].slice(0, 12) }));
        setBanterMessage("");
        setBanterImage(null);
        setBanterNotice("Your preview shout is on the terrace — no production data was written. 📣");
        return;
      }
      const response = await fetch(`/api/match-rooms/${room.id}/banter`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName, message: banterMessage, team: banterTeam, imageUrl }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Unable to post banter");
      setRoom((current) => ({
        ...current,
        banterCount: (current.banterCount ?? 0) + 1,
        recentBanter: [payload.message, ...(current.recentBanter ?? [])].slice(0, 12),
      }));
      setBanterMessage("");
      setBanterImage(null);
      setBanterNotice("Your shout is on the terrace. Keep it clever, not cruel. 📣");
    } catch (error) {
      setBanterNotice(error instanceof Error ? error.message : "Unable to post banter");
    } finally {
      setBanterBusy(false);
    }
  }

  async function react(messageId: string, reaction: BanterReaction) {
    if (demoMode) {
      setRoom((current) => ({ ...current, recentBanter: current.recentBanter?.map((item) => item.id === messageId ? { ...item, reactionCounts: { fire: 0, laugh: 0, clap: 0, ...item.reactionCounts, [reaction]: (item.reactionCounts?.[reaction] ?? 0) + 1 } } : item) }));
      return;
    }
    const response = await fetch(`/api/match-rooms/${room.id}/banter/${messageId}/react`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ reaction }) });
    const payload = await response.json();
    if (!response.ok) { setBanterNotice(payload.error ?? "Unable to react"); return; }
    setRoom((current) => ({ ...current, recentBanter: current.recentBanter?.map((item) => item.id === messageId ? payload.message : item) }));
  }

  async function spotlight(messageId: string, value: "live" | "postmatch" | null) {
    if (demoMode) {
      setRoom((current) => ({ ...current, recentBanter: current.recentBanter?.map((item) => item.id === messageId ? { ...item, spotlight: value ?? undefined } : item) }));
      if (value) setStageNomineeId(messageId);
      return;
    }
    const response = await fetch(`/api/match-rooms/${room.id}/banter/${messageId}/spotlight`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ spotlight: value }) });
    const payload = await response.json();
    if (!response.ok) { setBanterNotice(payload.error ?? "Unable to spotlight shout"); return; }
    setRoom((current) => ({ ...current, recentBanter: current.recentBanter?.map((item) => item.id === messageId ? payload.message : item) }));
  }

  async function changePhase(value: "prematch" | "live" | "postmatch") {
    if (demoMode) { setRoom((current) => ({ ...current, arenaPhase: value })); return; }
    const response = await fetch(`/api/match-rooms/${room.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ arenaPhase: value }) });
    const payload = await response.json();
    if (response.ok) setRoom(payload.room); else setBanterNotice(payload.error ?? "Unable to change Arena phase");
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
        <div className="banter-heading"><div><small>🏆 {phaseInfo.label} · CREATOR ARENA</small><h2>{room.arenaTitle ?? "Banter Arena"}</h2><p>A live supporter feed for pictures, reactions, rival replies, and the shouts worth bringing on air.</p></div><span>{room.banterCount ?? 0} shouts</span></div>
        <div className="arena-phases">
          {(Object.keys(phaseCopy) as Array<keyof typeof phaseCopy>).map((item) => <button type="button" disabled={!creatorMode} className={phase === item ? "active" : ""} key={item} onClick={() => changePhase(item)}><small>{phaseCopy[item].label}</small><b>{phaseCopy[item].title}</b></button>)}
        </div>
        <div className="banter-scoreboard" aria-label="Live banter standings">
          {banterStandings.map((standing, index) => <article key={standing.team} className={index === 1 ? "away" : "home"}><small>{index === 0 ? "HOME END" : "AWAY END"}</small><strong>{standing.team}</strong><b>{standing.points} pts</b><span>{standing.shouts} shouts · {standing.average || "—"} avg</span></article>)}
          <div className="banter-ref"><Bot /><small>BANTER REF</small><strong>{banterStandings[0].points === banterStandings[1].points ? "Dead level" : `${[...banterStandings].sort((a, b) => b.points - a.points)[0].team} lead`}</strong><span>Live scoring · safe shouts only</span></div>
        </div>
        <div className="banter-director">
          <div><Zap /><span><small>HEAT DIRECTOR · {phaseInfo.label}</small><b>{banterLeader ? `${phaseInfo.cue} Current leader: @${banterLeader.message.displayName}.` : phaseInfo.cue}</b></span></div>
          <div><Mic2 /><span><small>STAGE NOMINATION</small><b>{stageNominee ? `@${stageNominee.displayName} is ready for creator approval.` : "The creator chooses who gets invited on stream."}</b></span></div>
          {stageNominee && <button className="button button-secondary" onClick={() => setStageNomineeId(null)}>Clear nomination</button>}
        </div>
        <div className="banter-layout">
          <form className="banter-form" onSubmit={submitBanter}>
            <div className="wide heat-prompts"><small><Bot size={13} /> HEAT DIRECTOR PROMPTS</small>{phaseInfo.prompts.map((prompt) => <button type="button" key={prompt} onClick={() => setBanterMessage(prompt)}>{prompt}</button>)}</div>
            <label>Supporter name<input required maxLength={30} value={displayName} onChange={(event) => setDisplayName(event.target.value)} placeholder="Your terrace name" /></label>
            <label>Your colours<select value={banterTeam} onChange={(event) => setBanterTeam(event.target.value)}><option>{room.homeTeam}</option><option>{room.awayTeam}</option><option>Neutral</option></select></label>
            <label className="wide">Your shout<textarea required minLength={2} maxLength={180} value={banterMessage} onChange={(event) => setBanterMessage(event.target.value)} placeholder="Bring a punchline, not an insult. Keep it football." /></label>
            <label className="wide banter-image-input"><ImagePlus size={18} /><span><b>Add a match-day picture</b><small>JPG, PNG, WebP, or GIF · max 1 MB</small></span><input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(event) => setBanterImage(event.target.files?.[0] ?? null)} /></label>
            {banterImage && <div className="wide media-ready"><Camera size={15} /> {banterImage.name}<button type="button" onClick={() => setBanterImage(null)}>Remove</button></div>}
            <button className="button button-primary" disabled={banterBusy}><MessageCircle size={17} /> {banterBusy ? "Posting…" : "Post to the terrace"}</button>
            {banterNotice && <p className="room-notice">{banterNotice}</p>}
          </form>
          <div className="banter-feed">
            {(room.recentBanter ?? []).length === 0 ? <div className="banter-empty"><MessageCircle /><h3>First whistle, first shout.</h3><p>Start the friendly rivalry before kickoff.</p></div> : room.recentBanter?.map((item) => (
              <article key={item.id} className={stageNomineeId === item.id ? "nominated" : ""}>
                <div><b>{item.displayName}</b><span>{item.team ?? "Neutral"}</span></div>
                {item.spotlight && <strong className={`spotlight-badge ${item.spotlight}`}><Mic2 size={12} /> {item.spotlight === "live" ? "LIVE CALL-UP" : "POST-MATCH PANEL"}</strong>}
                <p>{item.message}</p>
                {item.imageUrl && <div className="banter-media" role="img" aria-label={`Match-day post by ${item.displayName}`} style={{ backgroundImage: `url(${item.imageUrl})` }} />}
                <div className="banter-verdict"><span><Sparkles size={12} /> {scoreBanter(item).verdict}</span><b>{scoreBanter(item).total}/100</b></div>
                <div className="reaction-row" aria-label={`React to ${item.displayName}`}><button type="button" onClick={() => react(item.id, "fire")}><Flame size={14} /> {item.reactionCounts?.fire ?? 0}</button><button type="button" onClick={() => react(item.id, "laugh")}><Laugh size={14} /> {item.reactionCounts?.laugh ?? 0}</button><button type="button" onClick={() => react(item.id, "clap")}><ThumbsUp size={14} /> {item.reactionCounts?.clap ?? 0}</button></div>
                <footer><small>{new Date(item.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</small>{creatorMode && scoreBanter(item).safe && <span className="creator-callups"><button type="button" onClick={() => spotlight(item.id, "live")}><Crown size={13} /> Invite live</button><button type="button" onClick={() => spotlight(item.id, "postmatch")}><Mic2 size={13} /> Post-match</button></span>}</footer>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
