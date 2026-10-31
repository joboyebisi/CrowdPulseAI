"use client";

import { Flame, Sparkles, Users } from "lucide-react";
import { useEffect, useState } from "react";
import type { RuntimeState } from "@/lib/types";

export function OverlayClient() {
  const [state, setState] = useState<RuntimeState | null>(null);
  useEffect(() => {
    const load = async () => setState(await (await fetch("/api/state", { cache: "no-store" })).json());
    void load();
    const timer = window.setInterval(load, 1200);
    return () => window.clearInterval(timer);
  }, []);

  const latest = state?.moments.find((moment) => moment.status !== "rejected");
  if (!latest) {
    return <div className="overlay-idle"><span><i /><i /><i /></span> CROWD PULSE READY</div>;
  }
  return (
    <div className={`overlay-moment ${latest.status}`}>
      <div className="overlay-accent"><Sparkles /></div>
      <div className="overlay-copy"><small>CROWD MOMENT · {latest.simulated ? "DEMO" : "LIVE"}</small><strong>{latest.title}</strong><span><Users size={15} /> {latest.hypeVotes} fans <Flame size={15} /> Hype detected</span></div>
      <div className="overlay-score">{Math.min(99, 70 + latest.hypeVotes * 3)}<small>% HYPE</small></div>
    </div>
  );
}
