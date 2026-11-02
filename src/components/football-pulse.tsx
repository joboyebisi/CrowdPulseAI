"use client";

import { Radio, RefreshCw, Trophy } from "lucide-react";
import { useEffect, useState } from "react";

type MatchFeed = {
  configured: boolean;
  provider: string;
  matches: Array<{ id: string; name: string; state: string; detail: string }>;
};

export function FootballPulse() {
  const [feed, setFeed] = useState<MatchFeed | null>(null);

  useEffect(() => {
    let active = true;
    async function refresh() {
      const response = await fetch("/api/football/live", { cache: "no-store" });
      if (!active || !response.ok) return;
      setFeed(await response.json());
    }
    void refresh();
    const timer = window.setInterval(refresh, 30_000);
    return () => { active = false; window.clearInterval(timer); };
  }, []);

  if (!feed) return null;
  return (
    <section className="football-pulse" aria-label="Football match feed">
      <div><span><Radio size={14} /> {feed.configured ? "LIVE FOOTBALL API" : "VERIFIED MATCH REPLAY"}</span><b>{feed.provider}</b></div>
      <div className="football-fixtures">
        {feed.matches.length === 0 ? <p>No match is in play right now.</p> : feed.matches.map((match) => <article key={match.id}><Trophy size={17} /><strong>{match.name}</strong><span>{match.state}</span><small>{match.detail}</small></article>)}
      </div>
      <RefreshCw size={14} />
    </section>
  );
}
