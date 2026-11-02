# CrowdPulse AI — Product Requirements Document

Version 0.2 · October 31, 2026

## Product summary

CrowdPulse is the audience-intelligence layer for sports creators. It helps a creator gather a crowd before a stream, convert live audience energy into creator-approved Twitch moments, and bring the community back to relive what happened.

The product creates one continuous participation loop:

1. **Before kickoff:** fans join a Match Room, make predictions, vote, and shape the creator's opening conversation.
2. **During the stream:** unique crowd signals identify moments worth capturing.
3. **After the moment:** AI helps package context, while the creator decides what becomes public.

The crowd provides the signal, AI assists with context, and the creator retains final editorial control.

## Research rationale

- Twitch schedules surface on Following and search pages, and scheduled streams may expose reminders. CrowdPulse should complement these native discovery paths.
- Twitch supports polls, predictions, schedules, and EventSub, but Channel Points predictions are limited to Affiliates and Partners. Core participation must work without Channel Points.
- Football-fandom research links digital participation—polls, quizzes, and voting—to ownership and emotional attachment.
- Large sports-fan research shows demand for real-time updates, personalized content, summaries, social content, and multi-device experiences.

Sources and product implications are recorded in [Pre-stream engagement research](../research/prestream-engagement.md).

## Target users

- **Primary:** football watch-along hosts, sports reaction streamers, esports commentators, and sports-gaming creators.
- **Secondary:** participating viewers and channel moderators.
- **Boundary:** CrowdPulse handles creator commentary, community activity, and Twitch-authorised clips. It does not assume rights to third-party match footage, logos, or data.

## Core creator journey

1. Connect Twitch and create an upcoming Match Room.
2. Add the match, start time, discussion prompt, and optional participation modules.
3. Share the room while CrowdPulse links or syncs to the Twitch schedule.
4. Watch fans check in, predict, vote, and build the hype meter.
5. Go live with an opening brief built from audience responses.
6. Receive real chat signals through EventSub.
7. Review the clip and grounded copy produced after a qualifying hype spike.
8. Approve or reject the moment.
9. Share the approved moment and later bring fans back for a recap.

## Core viewer journey

1. Open a shared Match Room before the stream.
2. See the creator, match context, local start time, countdown, and prompts.
3. Check in and make one response per prompt.
4. See aggregate community sentiment without exposing personal information.
5. Set a Twitch reminder or open the creator's channel.
6. Join live chat and use `!hype` when a moment matters.
7. Return to approved moments after the stream.

## Epic 1 — Creator onboarding and live connection

**Story:** As a creator, I want clear Twitch permissions so CrowdPulse can listen to chat and create clips safely.

Acceptance criteria:

- The requested scopes are shown before authorization.
- A successful connection displays the Twitch identity and listener state.
- Missing, expired, or revoked authorization produces a reconnect action.
- The listener subscribes to the creator's `channel.chat.message` events.
- Demo activity is visually distinct from real Twitch activity.

## Epic 2 — Pre-Match Hype Room

**Story:** As a creator, I want a shareable lobby for an upcoming match so fans have a reason to arrive before I go live.

Acceptance criteria:

- The creator can create, edit, publish, unpublish, and cancel a Match Room.
- A room requires a title, scheduled start, and creator; teams, competition, art, and talking points are optional.
- The public room shows a timezone-aware countdown and scheduled/live/ended/cancelled state.
- The creator can copy a stable URL and link viewers to Twitch.
- Schedule-sync status and recovery actions are visible when integration is enabled.
- A late stream shows “waiting for creator,” never a false live state.

## Epic 3 — Fan participation before kickoff

**Story:** As a fan, I want lightweight ways to express my expectations so I feel part of the show before it begins.

Acceptance criteria:

- A creator can enable up to three modules: score prediction, poll/trivia, and supporter check-in.
- A viewer can submit once per prompt and edit until the lock time.
- Predictions are community entertainment, never betting advice.
- Aggregate results update without revealing personal data.
- The hype meter explains which verified actions contribute to its score.
- Core participation works for signed-out viewers and creators without Affiliate status.
- Closed prompts reject late submissions visibly.

## Epic 4 — Creator opening brief

**Story:** As a creator, I want a concise room summary so I can start with topics my audience already cares about.

Acceptance criteria:

- The brief shows participation totals, leading prediction, closest poll, recurring audience question, and an opening prompt.
- Factual match claims come only from creator-entered or approved data.
- AI suggestions are labelled and editable.
- Abusive or irrelevant content can be removed before appearing.
- Low-participation rooms provide starter prompts without pretending they came from fans.

## Epic 5 — Pre-match to live handoff

**Story:** As a creator, I want pre-match energy to carry into the stream so going live feels like a continuation, not a reset.

Acceptance criteria:

- Going live updates the existing Match Room without changing its URL.
- The OBS overlay can show the final prediction, check-in count, or hype level.
- Pre-match context remains visible beside incoming chat.
- Twitch-native polls or predictions appear only for eligible accounts with granted permissions.
- Failure of an optional native poll never interrupts chat listening.

## Epic 6 — Crowd-directed live moments

**Story:** As a viewer, I want my `!hype` signal to combine with unique viewers so the community identifies memorable moments.

Acceptance criteria:

- Duplicate votes do not increase the active score.
- The dashboard explains threshold, window, and cooldown.
- A qualifying spike creates at most one candidate during cooldown.
- Create Clip returns a clip ID or actionable failure.
- Get Clips polling stops within Twitch's documented readiness window.
- Failed clips never become misleading public moments.

## Epic 7 — Moment Agent and creator review

**Story:** As a creator, I want a grounded draft and final approval so AI saves time without speaking for me.

Acceptance criteria:

- The draft uses only available chat and approved context.
- It cannot invent teams, players, scores, injuries, or events.
- AI text is labelled and editable.
- Only approved moments receive public share pages.
- Rejected moments remain private.

## Epic 8 — OBS and sharing

**Story:** As a creator, I want participation and approved moments visible without obstructing the stream.

Acceptance criteria:

- The browser source has a transparent, readable 1280×720 default.
- The creator chooses which pre-match or live module is visible.
- Overlays never expose private viewer data.
- Moment pages have stable URLs, attribution, and share-ready metadata.

## Epic 9 — Agent-orchestrated growth package

**Story:** As a creator, I want one crowd-selected moment turned into a review-ready campaign so I can act while the stream is still relevant.

Acceptance criteria:

- Signal Scout, Clip Director, Pundit, and Growth Producer states are visible in the dashboard.
- The Pundit produces a short call grounded only in supplied chat and creator context.
- The Growth Producer creates distinct drafts for TikTok, YouTube Shorts, and X.
- The streamer can edit every generated field before approval or copying.
- Provider failure falls back transparently without blocking clip review.
- No agent claims a vertical edit or social post happened when it did not.

## Epic 10 — Moment Cards and collections

**Story:** As a creator, I want approved moments to become durable community objects so viewers can relive a season and see how the crowd helped make it.

Acceptance criteria:

- Every card records creator, Twitch clip provenance, timestamp, trigger window, hype score, and approved copy.
- Cards can be grouped by match, season, rivalry, or creator-defined collection.
- Contributor recognition is non-monetary and privacy-aware.
- Rights and licensing are explicit; a card never implies ownership of third-party match footage.
- Wallets, resale, artificial scarcity, and NFTs are excluded from the initial release.

## Edge cases

- **No audience:** show creator prompts and sharing actions, not fabricated activity.
- **Kickoff changes:** update the countdown and preserve responses unless reset.
- **Duplicate or automated activity:** rate-limit and deduplicate.
- **Postponement/cancellation:** freeze entries, preserve history, and show a clear status.
- **Early/late stream:** prefer Twitch live state while retaining scheduled context.
- **EventSub disconnect:** show stale/offline state and reconnect without claiming completeness.
- **Clip restrictions:** explain live, clip-setting, follower, or subscriber restrictions.
- **Prediction eligibility:** fall back to CrowdPulse's non-monetary module.
- **Ties:** display tied choices and use a neutral opening prompt.
- **Abuse/spoilers:** support moderation, prompt closure, and removal from the brief.
- **Timezones:** store canonical time and show local time plus timezone.
- **Rights:** never use unlicensed crests, footage, lineups, or statistics by default.

## What we are building

### P0 — Working live-moment MVP

- Twitch OAuth, EventSub chat, hype detection, clips, Gemini 3.8 pundit copy, platform-specific social drafts, approval, sharing, and an optional speaking OBS overlay

### P1 — Pre-Match Hype MVP

- Creator-created Match Rooms and countdown pages
- Score prediction, one poll/trivia prompt, and supporter check-in
- Explainable pre-match hype meter
- Creator opening brief
- Scheduled-to-live transition
- Pre-match result card for OBS

### P1 — Production foundation

- PostgreSQL persistence and Redis real-time state
- Durable OAuth storage, refresh, and hourly validation
- Always-on EventSub worker with monitoring and recovery
- Creator and moderator authorization

## What we would add with more time

- Twitch Schedule create/update integration with `channel:manage:schedule`
- Twitch-native polls and Channel Points predictions for eligible channels
- Licensed sports-data integrations with source attribution
- Multi-match seasons, fan streaks, and non-monetary leaderboards
- Discord and social reminders with creator confirmation
- Post-match recap rooms and longitudinal community insights
- Multi-stream rivalry rooms and sponsor-safe activations
- A Render Agent integration for vertical reframing, subtitles, and approved export
- Moment Card collections, contributor quests, and creator-owned season recaps

## Non-goals

- Betting, odds, wagers, or cash-value rewards
- Automatic publishing without creator review
- Republishing unauthorised sports footage
- Presenting AI analysis as verified reporting
- Requiring Affiliate or Partner status
- Building a sports-data platform before proving the community loop

## Success metrics

- Connected creators who publish a Match Room
- Time from connection to first shared room
- Unique pre-stream participants and completion rate
- Percentage of participants who return during the first ten live minutes
- Unique chatters and `!hype` voters
- Candidate approval rate and time from threshold to candidate
- Creators who run another Match Room within 30 days
- Incorrect or ungrounded copy reports
- Listener uptime and reconnection success

## End-to-end proof

1. Publish a football Match Room.
2. Receive real predictions and check-ins.
3. Show the opening brief and transition live.
4. Receive five unique real `!hype` messages.
5. Create and verify a Twitch clip.
6. Generate grounded copy and approve it.
7. Show the moment in OBS and open its public page.

## Epic 11 — Creator Live Launchpad

**Story:** As a connected streamer, I want one truthful preflight surface that gets my audience experience ready and hands video broadcasting to Twitch safely.

Acceptance criteria:

- The dashboard reads the authenticated channel's current live/offline state from Twitch.
- The creator can open Twitch Stream Manager from CrowdPulse.
- The product explains that OBS or another encoder sends video; CrowdPulse does not claim to start RTMP video through the Twitch API.
- The app never renders, logs, or stores the broadcaster's stream key.
- The launch sequence connects Match Room warm-up, Twitch broadcast, EventSub listening, and moment detection.
- A deterministic live-experience preview is available from every authenticated dashboard, including an empty account.

## Epic 12 — AI Banter Arena

**Story:** As a football creator, I want rival supporters to compete in a visible, moderated banter match so I can turn the best audience personality into live-show material.

Acceptance criteria:

- Every Match Room exposes a clearly labelled Banter Arena.
- Supporters choose the home team, away team, or neutral position and post short text shouts.
- The Banter Ref produces an explainable 0–100 score from wit, football relevance, energy, and sportsmanship.
- Unsafe messages receive a booking, add no team points, and cannot be nominated to stage.
- Home and away standings show points, shout count, and average score.
- The host receives a concise next-response cue based on the leading safe shout.
- The creator can nominate or clear one supporter for a stage handoff.
- Nomination never claims the supporter has joined the video call; admission remains a creator action in Twitch's guest tooling.
- The first release uses deterministic transparent scoring so the demo remains reliable. A provider-backed judge may later add nuance behind the same schema, with the deterministic scorer retained as fallback.

## Banter Arena orchestration

1. **Intake:** validate length, reject links/control characters, rate-limit, and attach team identity.
2. **Banter Ref:** score the four published dimensions and issue a safe/booking verdict.
3. **Versus engine:** aggregate only safe scores into home and away totals.
4. **Host coach:** turn the leading shout into a short, time-boxed response cue.
5. **Stage selector:** rank safe shouts and let the creator nominate a winner.
6. **Twitch handoff:** open or guide the creator to Twitch's native guest controls; never auto-admit.

## Live Launchpad research decision

Twitch's broadcast documentation requires an encoder and RTMP ingest for video. The API can read stream state and manage supported channel properties, while EventSub can report `stream.online` and `stream.offline`. Therefore CrowdPulse owns preparation, detection, interaction, and orchestration—not video transport. This keeps the product useful without handling the creator's stream key.

## Additional success metrics

- Launchpad-to-live conversion and median preflight time
- Banter contributors per Match Room and home/away participation balance
- Percentage of shouts that remain stage-eligible
- Creator stage-nomination rate and nomination-to-handoff time
- Banter participants who return during the live broadcast
- Host-cue usage and creator override rate
