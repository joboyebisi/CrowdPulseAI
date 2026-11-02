# CrowdPulse demo script

Target length: 3 minutes 30 seconds. Use the production URL and keep `/demo` open in a second tab before recording.

## 0:00-0:20 — The hook

**On screen:** CrowdPulse landing page.

**Say:**

> Football streams have thousands of reactions, but the creator still has to guess which moment mattered, find the clip, write the commentary, and decide what to share. CrowdPulse turns the audience into a live editorial team—without taking control away from the creator.

Select **Try the sandbox**.

## 0:20-0:50 — Before kickoff

**On screen:** Judge Sandbox, verified match-replay strip, and the Barcelona 1–2 Real Madrid Match Room.

**Say:**

> This is a transparent historical replay of the October 2026 Clásico. The result is real; the crowd activity is labelled fixture data. Before kickoff, the streamer opens a Match Room where supporters check in, predict the score, vote on the decisive player, and build the opening talking points.

Select **Opening brief**.

> Instead of starting with a cold chat, the creator arrives with a live read on the crowd: 128 supporters, 94 predictions, and Mbappé as the leading call.

Select **Open** on the Match Room, then scroll to the Banter Room.

> The new Banter Room turns friendly rivalry into a visible content surface. A supporter can post a shout, see it appear immediately, and the best terrace lines return to the creator dashboard—so audience personality becomes part of the show, not a disposable chat scroll.

Post a short line such as **“One chance is all Mbappé needs. Madrid DNA.”**, then return to `/demo`.

## 0:50-1:35 — The crowd calls the moment

Select **Replay the 88th-minute winner**.

**Say:**

> Now Mbappé scores in the 88th minute. Seven chat messages arrive, but Signal Scout counts identities, not spam. Five unique supporters use the configured moment commands, crossing the threshold inside a twenty-second window.

Point across the four-agent rail.

> Signal Scout explains why the trigger fired. Clip Director requests Twitch's native clip in a live session. Pundit turns the surrounding chat into grounded football commentary. Growth Producer creates distinct drafts for TikTok, Shorts, and X. In this sandbox, clip capture is visibly skipped—no fake Twitch clip is claimed—but the same orchestration code runs end to end.

## 1:35-2:15 — Creator control and the durable Moment

Scroll to the review card.

**Say:**

> Automation stops here. The creator sees the contributors, the execution trace, the pundit call, and every social draft before anything leaves the control room.

Select **Approve**, then select **Open**.

> Approval creates a durable, shareable Moment page: provenance, crowd discoverers, hype score, commentary, and a creator-approved growth package. The audience found the moment; the creator still owns the decision.

## 2:15-2:50 — What is genuinely live

**On screen:** Moment page, then return to the dashboard match-feed strip.

**Say:**

> The replay is intentionally deterministic so judges can experience it without waiting for a match. The production path is live: Twitch OAuth authenticates the broadcaster, EventSub delivers chat through a signed AWS webhook, SQS absorbs the burst, DynamoDB enforces unique votes and cooldowns, Twitch creates the clip, and Gemini packages the football context. The match strip can poll Sportmonks every thirty seconds when a live-data token is configured; otherwise it identifies itself as a verified historical replay.

## 2:50-3:20 — Connected match-day experience

**On screen:** Match Room and Banter Room.

**Say:**

> CrowdPulse is not just a clipping bot. It connects the full match-day arc: predictions and banter before kickoff, explainable crowd signals during the match, and approved Moments after the whistle. Every surface feeds the next one.

## 3:20-3:30 — Close

**On screen:** Landing-page hero or approved Moment.

**Say:**

> The audience already knows when football becomes unforgettable. CrowdPulse gives that instinct a workflow—and gives the creator the final whistle.

## Recording checklist

- Use only `https://crowd-pulse-ai-delta.vercel.app`; the shorter hostname is not this deployment.
- Start at `/demo`, select **Opening brief**, then **Replay the 88th-minute winner**.
- Wait for the review card before approving it.
- Open the approved Moment in the same browser.
- Keep the sandbox disclosure visible at least once.
- If demonstrating live Twitch separately, use an original OBS test scene, enable clips, and have five distinct accounts send exact commands such as `!hype`.
- Never claim the historical replay called Twitch or a live-score provider unless the UI explicitly says the live provider is connected.
