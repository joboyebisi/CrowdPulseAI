# CrowdPulse end-to-end demo script

Target: 4 minutes. Use `https://crowd-pulse-ai-delta.vercel.app`. Open `/dashboard`, `/demo`, and the Banter Arena in separate tabs before recording.

## Story: from cold start to crowd-powered show

### 0:00–0:25 — The problem

**On screen:** Landing page.

**Say:**

> A football creator has to host the match, read thousands of reactions, find the moment, make the clip, and keep rival supporters involved. CrowdPulse is the match-day operating system that turns those reactions into a show—while the creator keeps the final whistle.

Select **Connect with Twitch**, then show the authenticated dashboard.

### 0:25–1:00 — Live Launchpad

**On screen:** Creator Live Launchpad.

> I am signed in as the broadcaster. CrowdPulse checks the real Twitch channel state and prepares the audience experience. Twitch still receives video from OBS or another encoder, so we never expose or store the stream key. I open Twitch Stream Manager here, start my test scene, and CrowdPulse detects when the channel is live.

Point to the three steps: Warm up, Broadcast, Kick off. Select **Open live experience preview**.

### 1:00–1:45 — Banter Arena

**On screen:** Barcelona versus Real Madrid replay, then **Enter Banter Arena**.

> Before kickoff, the creator opens a Match Room. Supporters check in, predict the score, and choose their colours. Banter is now a first-class show surface, not disposable chat.

Post: **One chance, one winner. That is Madrid DNA!**

> The Banter Ref scores every shout on wit, football relevance, energy, and sportsmanship. Unsafe shouts are booked and cannot be promoted. Club scores update as the rivalry develops, and the host receives a short cue for who should answer next.

Select **Nominate to stage** on the leading safe shout.

> The agent recommends; the creator decides. A stage nomination becomes a host-approved handoff. CrowdPulse does not pretend that a viewer has joined Twitch video—the creator completes the guest invitation in Twitch's own tools.

### 1:45–2:30 — The crowd calls the moment

Return to `/demo` and select **Replay the 88th-minute winner**.

> Five unique supporters cross the hype threshold inside twenty seconds. Signal Scout deduplicates identities. Clip Director requests Twitch's native clip in a live session. Pundit packages only the supplied context, and Growth Producer drafts platform-specific copy. This replay clearly labels fixture data and skips live clip capture rather than faking it.

Point across the agent rail and execution trace.

### 2:30–3:10 — Creator approval and media

Select **Approve**, then **Open** on the approved moment.

> Automation stops at review. The creator sees provenance, contributors, the pundit line, and social drafts before anything is shared. Approval creates a durable Moment page with a poster and a link that supporters can share. On a real live channel, the Moment links to the Twitch clip.

### 3:10–3:40 — What is real

> Twitch OAuth, channel status, EventSub chat, AWS ingestion, unique-voter hype detection, review, Match Rooms, Banter posting, and moment sharing are working paths. The historical replay is deterministic so the experience can be judged without waiting for a live Clásico. Live football data is optional and visibly identified by its provider.

### 3:40–4:00 — Close

**On screen:** Banter scoreboard, then approved Moment.

> CrowdPulse connects the full match-day arc: warm up the crowd, run the rivalry, catch the moment, and grow the story after the whistle. The audience brings the energy. The creator stays in control.

## Presenter checklist

- Use only the `crowd-pulse-ai-delta.vercel.app` deployment.
- Log in before recording; keep `/demo` open as the deterministic fallback.
- Use an original OBS test scene if showing a real Twitch broadcast.
- Never claim the Twitch API itself starts the video stream.
- Never claim a stage nomination completed a Twitch guest invite.
- Keep the replay disclosure visible once.
- Show the Banter Ref score, club standings, host cue, and stage nomination.
- Show one approved Moment and its public link.

## Recovery lines

- **Twitch is offline:** "The Launchpad is correctly reading the channel as ready; I can continue with the deterministic rehearsal."
- **Sports feed unavailable:** "The replay is intentionally self-contained and does not fabricate a live provider response."
- **No audience accounts:** "The private rehearsal supplies labelled fixture chat; production requires unique real chatters."
- **Guest handoff unavailable:** "The winner is nominated, not auto-admitted; creator approval and Twitch's guest controls remain the boundary."
