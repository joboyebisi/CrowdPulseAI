# CrowdPulse demo runbook

## Safety gate

Use newly rotated Twitch, Gemini, and session secrets. Never place populated values in `.env.example`, source control, screenshots, or a demo recording.

## Proof 1 — Deterministic agent harness

```bash
npm run harness
npm test
```

Expected result:

- seven Twitch EventSub-shaped messages are parsed;
- five unique viewers cross the hype threshold;
- Signal Scout completes;
- Clip Director is visibly skipped because the harness cannot claim a real clip;
- Pundit and Growth Producer complete;
- TikTok, YouTube Shorts, and X drafts are returned.

Open `/dashboard`, select **Run sandbox rehearsal**, and show the execution trace. Every fixture-derived surface remains labelled as sandbox activity.

## Proof 2 — Real Twitch smoke test

Prerequisites:

- a newly rotated Twitch client secret;
- `GEMINI_MODEL=gemini-3.8-flash`;
- a newly generated session secret;
- a live Twitch channel with clipping enabled;
- five distinct Twitch accounts for the threshold, or a temporary lower threshold for a private test;
- a persistent Node.js runtime for the EventSub WebSocket.

Steps:

1. Open `/api/health` and confirm Twitch OAuth and Gemini are configured.
2. Sign in with the broadcaster through `/login`; Twitch returns the creator to `/dashboard`.
3. Start the listener and confirm **Listening live**.
4. Send ordinary chat plus `!hype`, `!clip`, or `!moment` from unique accounts.
5. Confirm Signal Scout reaches the threshold once and duplicate viewers do not add votes.
6. Confirm Twitch returns the clip before Pundit and Growth Producer finish.
7. Review the grounded copy, approve the moment, open its public page, and show `/overlay?voice=1` in OBS.
8. Confirm no unapproved moment appears as public content.

## Vercel boundary

Vercel is suitable for the web dashboard, OAuth callback, review pages, and API requests. The current EventSub listener uses a long-lived WebSocket, which must run in an always-on worker. Do not describe a Vercel serverless invocation as a durable listener. The production topology is Vercel web + PostgreSQL/Redis + an always-on EventSub worker.

## Demo evidence to capture

- `/api/health` without revealing secrets;
- the real Twitch connection identity;
- five unique commands arriving in the dashboard;
- the four-stage execution trace;
- the Twitch clip URL;
- the editable Pundit and social drafts;
- approval followed by the public Moment page and OBS alert.
