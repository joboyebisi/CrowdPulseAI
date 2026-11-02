# CrowdPulse — provisional Devpost application

> Draft only. The repository does not yet contain a registered Devpost hackathon state, so event-specific fields and rule claims must be completed after the official hackathon workflow is initialized.

## Project name

CrowdPulse — the AI match-day operating system for sports creators

## Tagline

Warm up the rivalry, catch the crowd's moment, and turn it into creator-approved media.

## Inspiration

Sports streams already contain an editorial signal: thousands of supporters react at once when something becomes unforgettable. Yet the streamer still has to host, monitor chat, identify the moment, make the clip, write the post, and keep the community involved. We built CrowdPulse to turn that energy into a connected match-day workflow without taking control away from the creator.

## What it does

CrowdPulse connects the full creator journey:

- Twitch OAuth gives each streamer a private creator dashboard.
- The Live Launchpad reads real Twitch channel status and hands video broadcasting safely to Twitch Stream Manager and OBS.
- Match Rooms collect check-ins, predictions, polls, and pre-match talking points.
- The AI Banter Arena scores club-versus-club shouts for wit, relevance, energy, and sportsmanship, builds live team standings, coaches the host, and lets the creator nominate a safe winner for a guest-stage handoff.
- EventSub chat signals feed a unique-viewer hype detector.
- A four-agent pipeline discovers the moment, requests a Twitch clip, writes grounded commentary, and prepares channel-specific social drafts.
- The creator approves every Moment before it becomes a durable, shareable page and OBS overlay.

## How we built it

The web experience uses Next.js 16, React 19, and TypeScript. Twitch OAuth and Helix provide creator identity, stream status, and live clip creation. Twitch EventSub feeds an AWS serverless path using API Gateway, Lambda, SQS, and DynamoDB for burst-tolerant chat processing, deduplication, cooldowns, Match Rooms, and Banter messages. Gemini is used for grounded media packaging when configured, with labelled deterministic fallbacks for reliable rehearsal. The Banter Ref is an explainable deterministic scoring agent in the current build, designed so a model-backed judge can be added without changing the audience contract.

## Challenges we ran into

The hardest product problem was honesty at system boundaries. The Twitch API does not replace an encoder, a stage nomination does not mean a guest has joined video, and a historical replay must not look like a live provider call. We designed explicit handoffs and provenance into the UI instead of hiding those constraints. We also had to make bursty audience signals idempotent so one viewer cannot manufacture a moment by spamming.

## Accomplishments that we're proud of

- A working creator login and real Twitch status check
- One coherent flow from pre-match room to live reaction to approved share page
- Explainable multi-agent execution traces and human approval
- A Banter Arena that rewards cleverness while refusing to promote abusive shouts
- A deterministic live-experience preview that is useful to creators and reproducible for judges
- AWS-backed, rate-limited audience participation rather than a front-end-only mock

## What we learned

Creator tools become more trustworthy when automation exposes its reasoning and stops at meaningful approval points. We also learned that the audience experience cannot be an afterthought: predictions, banter, moment discovery, and sharing are stronger when they feed one another across the whole match.

## What's next

- Provider-backed Banter judging with the transparent scorer as fallback
- Stream-online/offline EventSub subscriptions for push-based status
- Twitch-supported channel metadata controls with explicit additional permission
- Deeper native guest-stage guidance as Twitch's public guest APIs mature
- Multi-stream rivalry rooms, moderator controls, and creator-defined tournaments
- Licensed live-data providers and match schedules
- Vertical media rendering and caption burn-in after creator approval

## Demo

- Production app: https://crowd-pulse-ai-delta.vercel.app
- Deterministic experience: https://crowd-pulse-ai-delta.vercel.app/demo
- Banter Arena: https://crowd-pulse-ai-delta.vercel.app/rooms/clasico-2026-crowd-room#banter-room
- Public Moment: https://crowd-pulse-ai-delta.vercel.app/moments/clasico-2026-mbappe-88
- Demo video: TODO
- Source repository: TODO confirm public GitHub URL

## Built with

Next.js, React, TypeScript, Twitch OAuth, Twitch Helix, Twitch EventSub, AWS API Gateway, AWS Lambda, Amazon SQS, Amazon DynamoDB, Gemini, Vercel

## Event-specific fields to complete

- Hackathon name and URL: TODO after registration
- Required category/prize track: TODO
- Team members: TODO
- Submission deadline/timezone: TODO
- Testing credentials or judge instructions: use `/demo`; add any event-specific requirement after registration
- Screenshots and video URL: TODO

### ⏳ Not submitted yet

Nothing has been sent to Devpost.
