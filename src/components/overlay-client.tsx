"use client";

import { Flame, Sparkles, Users } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { RuntimeState } from "@/lib/types";

export function OverlayClient() {
  const [state, setState] = useState<RuntimeState | null>(null);
  const spokenMoment = useRef<string | null>(null);
  useEffect(() => {
    const load = async () => setState(await (await fetch("/api/state", { cache: "no-store" })).json());
    void load();
    const timer = window.setInterval(load, 1200);
    return () => window.clearInterval(timer);
  }, []);

  const latest = state?.moments.find((moment) => moment.status !== "rejected");
  useEffect(() => {
    if (!latest || !["pending", "approved"].includes(latest.status)) return;
    if (spokenMoment.current === latest.id) return;
    if (new URLSearchParams(window.location.search).get("voice") !== "1") return;
    spokenMoment.current = latest.id;
    window.speechSynthesis.cancel();
    const voice = new SpeechSynthesisUtterance(latest.punditLine || latest.caption);
    voice.rate = 1.04;
    voice.pitch = 0.92;
    window.speechSynthesis.speak(voice);
  }, [latest]);
  if (!latest) {
    return <div className="overlay-idle"><span><i /><i /><i /></span> CROWD PULSE READY</div>;
  }
  return (
    <div className={`overlay-moment ${latest.status}`}>
      <div className="overlay-accent"><Sparkles /></div>
      <div className="overlay-copy"><small>CLIP CAPTURED BY CHAT · {latest.simulated ? "SANDBOX" : "LIVE TWITCH"}</small><strong>{latest.punditLine || latest.title}</strong><span><Users size={15} /> {latest.hypeVotes} fans <Flame size={15} /> Hype detected</span></div>
      <div className="overlay-score">{Math.min(99, 70 + latest.hypeVotes * 3)}<small>% HYPE</small></div>
    </div>
  );
}
