"use client";

import { Check, Copy, Download, Loader2, Share2 } from "lucide-react";
import { useState } from "react";

export function MomentShareActions({ id, title }: { id: string; title: string }) {
  const [status, setStatus] = useState<"idle" | "copying" | "copied" | "sharing" | "downloading">("idle");

  function momentUrl() {
    return `${window.location.origin}/moments/${id}`;
  }

  async function copyLink() {
    setStatus("copying");
    await navigator.clipboard.writeText(momentUrl());
    setStatus("copied");
    window.setTimeout(() => setStatus("idle"), 1800);
  }

  async function shareMoment() {
    if (!navigator.share) return copyLink();
    setStatus("sharing");
    try {
      await navigator.share({ title, text: "The crowd called this moment live.", url: momentUrl() });
    } catch (error) {
      if (!(error instanceof DOMException && error.name === "AbortError")) await copyLink();
    } finally {
      setStatus((current) => current === "sharing" ? "idle" : current);
    }
  }

  async function downloadPoster() {
    setStatus("downloading");
    try {
      const response = await fetch(`/api/moments/${id}/poster`, { cache: "no-store" });
      if (!response.ok) throw new Error("Poster generation failed");
      const href = URL.createObjectURL(await response.blob());
      const anchor = document.createElement("a");
      anchor.href = href;
      anchor.download = `crowdpulse-${id}.png`;
      anchor.click();
      URL.revokeObjectURL(href);
    } finally {
      setStatus("idle");
    }
  }

  return (
    <div className="moment-share-actions" aria-label="Share this moment">
      <button className="button button-primary" onClick={shareMoment} disabled={status === "sharing"}>
        {status === "sharing" ? <Loader2 className="spin" size={17} /> : <Share2 size={17} />} Share moment
      </button>
      <button className="button button-secondary" onClick={downloadPoster} disabled={status === "downloading"}>
        {status === "downloading" ? <Loader2 className="spin" size={17} /> : <Download size={17} />} Download social card
      </button>
      <button className="icon-button" title="Copy moment link" onClick={copyLink}>
        {status === "copied" ? <Check size={18} /> : <Copy size={18} />}
      </button>
    </div>
  );
}
