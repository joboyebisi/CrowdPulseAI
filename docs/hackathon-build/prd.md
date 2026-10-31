# CrowdPulse AI — Product Requirements Document

Version 0.1 · October 31, 2026 · Codex x TwitchCon Hackathon

## Product summary

CrowdPulse is a sports-first, creator-led community engagement platform that turns spikes in live audience reaction into creator-approved, AI-captioned Twitch moments. Its differentiation is community-directed AI: fans and deterministic event processing identify what matters, AI helps tell the story, and the creator retains final control.

## Target users

- Primary: sports reaction streamers, football watch-along hosts, esports commentators, and sports gaming creators.
- Secondary: participating viewers and channel moderators.
- Boundary: the MVP captures creator commentary and Twitch-authorised clips. It does not assume permission to reproduce third-party sports broadcasts.

## Core journey

1. A creator connects Twitch and adds the browser overlay to OBS.
2. The EventSub listener receives real chat messages.
3. Unique viewers send `!hype` inside a short voting window.
4. The threshold creates one candidate and starts a cooldown.
5. Twitch creates the clip and CrowdPulse verifies readiness.
6. The Moment Agent proposes grounded, explicitly AI-generated copy.
7. The creator approves or rejects the moment.
8. An approved moment gets a shareable page.

## P0 acceptance criteria

- Twitch OAuth connects a creator using the minimum required scopes.
- Real `channel.chat.message` events enter the application.
- Duplicate votes from one viewer do not increase the active score.
- A qualifying spike creates at most one candidate during the cooldown.
- Create Clip returns a clip ID or a visible, actionable failure.
- Get Clips is polled for no longer than Twitch's documented 15-second readiness window.
- AI copy cannot invent teams, players, scores, or match facts absent from the provided context.
- The OBS overlay shows newly created moments.
- Only approved moments have public share pages.
- Demo data is always clearly labelled as simulated.

## Non-goals for the hackathon MVP

- Automatic social posting, because creator review is a core safety boundary.
- NFT, wallet, marketplace, or speculative ownership mechanics.
- Multi-stream collaboration and cross-channel collections.
- Production analytics, billing, and durable fan profiles.
- Republishing unauthorised professional sports footage.

## Success proof

The submission succeeds when a real Twitch channel completes the flow from five unique `!hype` messages to a verified Twitch clip, grounded caption, creator approval, live overlay, and working share link.
