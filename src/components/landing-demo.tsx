"use client";

import { ArrowUpRight, Flame, Sparkles, Users } from "lucide-react";
import { useState } from "react";

export function LandingDemo() {
  const [votes, setVotes] = useState(73);
  const [voted, setVoted] = useState(false);

  return (
    <div className="demo-shell">
      <div className="demo-topline">
        <span><b className="live-dot" /> LIVE · Football reaction</span>
        <span className="hype-chip"><Flame size={14} /> HYPE 94%</span>
      </div>
      <div className="video-panel">
        <div className="stadium-glow" />
        <div className="streamer-silhouette">
          <span className="head" />
          <span className="body" />
        </div>
        <div className="video-label">
          <span>OBS CAMERA</span>
          <strong>Streamer reacts to a last-minute moment</strong>
        </div>
        <div className="chat-burst"><Flame size={16} /> CHAT IS GOING WILD</div>
      </div>
      <div className="moment-card-preview">
        <div className="moment-icon"><Sparkles size={20} /></div>
        <div>
          <small>CROWD MOMENT DETECTED</small>
          <strong>“I cannot believe that just happened!”</strong>
          <p><Users size={15} /> 86 fans reacting</p>
        </div>
        <button
          className={voted ? "vote-button voted" : "vote-button"}
          onClick={() => {
            if (!voted) setVotes((value) => value + 1);
            setVoted(true);
          }}
          type="button"
        >
          <Flame size={16} /> {voted ? "Hyped" : `${votes} hype votes`}
        </button>
      </div>
      <div className="demo-footer">
        <span><Sparkles size={15} /> AI recap ready</span>
        <span>Creator approval required</span>
        <ArrowUpRight size={16} />
      </div>
    </div>
  );
}
