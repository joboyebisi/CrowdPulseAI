# CrowdPulse — The Crowd Makes the Moment

## One-line Summary

CrowdPulse turns the roar of a live sports audience into banter, guests, clips, and stories—while the creator stays in control.

## The Story

Imagine Maya is hosting an El Clásico watchalong.

Before kickoff, her supporters enter her Arena. Barcelona fans take one side. Madrid fans take the other. Neutrals sit in the middle and stir the pot. They predict the score, post pictures, and compete to land the sharpest line. CrowdPulse gives Maya a simple prompt to turn that rivalry into her opening conversation.

Then the 88th minute arrives.

Mbappé scores. Maya jumps out of her chair. Chat explodes. One fan posts the perfect reaction. Another lands a line Maya wants to read on stream. Hundreds of messages move past before she can catch them.

CrowdPulse catches the surge. It counts different people, not repeated spam. It finds the standout banter, helps Maya nominate a supporter for a live call-up, requests the Twitch clip, and prepares the story around it.

After the final whistle, the Arena moves into extra time. The best voices from both sides can return for the post-match conversation, while Maya reviews a ready-to-share Moment.

The stream may end. The crowd's story keeps moving.

## Problem

A sports creator has one pair of eyes but a crowd full of stories.

While the creator is reacting to the match, the best prediction, funniest reply, strongest fan voice, and most important shared reaction can vanish inside chat. Traditional clipping tools save video. They do not understand when the whole audience is saying, **"This is the moment."**

## Solution

CrowdPulse connects the entire match-day conversation:

1. **Before kickoff:** supporters choose a side or stay neutral, make predictions, share pictures, and warm up the rivalry.
2. **During the stream:** the Banter Arena becomes a live companion feed. Reactions and safe, witty shouts help the creator decide which voices to bring on air.
3. **When something unforgettable happens:** CrowdPulse detects the shared surge, requests a Twitch clip, and explains why the moment mattered.
4. **After the match:** the creator can spotlight supporters for a post-match panel and approve a shareable Moment.

The agents recommend. The creator decides.

## Why This Matters

The best sports streams feel bigger than the person on camera. They feel like a stadium where every section has a voice.

CrowdPulse gives independent creators that feeling without requiring a clipping team, chat producer, and social editor. It also gives supporters a reason to participate: a prediction can open the show, a picture can capture the mood, a joke can win the rivalry, and a reaction can help discover the moment everyone remembers.

## How We Used AI

CrowdPulse is not one mysterious AI box. It is a small match-day crew, and every agent has one visible job:

- **Signal Scout** detects a real crowd reaction using unique viewers rather than message spam.
- **Banter Ref** scores shouts for wit, football relevance, energy, and sportsmanship. Unsafe shouts cannot win or be nominated to the stage.
- **Heat Director** changes its prompts before, during, and after the match so the rivalry always has a next beat.
- **Host Coach** turns the leading safe shout into a short prompt the streamer can use live.
- **Pundit** writes a grounded call from the supplied match and chat context.
- **Growth Producer** drafts posts for TikTok, YouTube Shorts, and X.

The execution trace shows what each agent did, skipped, or failed to do. A labelled fallback keeps the demo reliable without pretending an external service completed an action.

## How We Used Codex

Codex helped us research Twitch's boundaries, shape the match-day journey, implement the Next.js and AWS features, fix OAuth, build the Banter Arena, and test the complete flow. Most importantly, it helped us keep the product honest: Twitch carries the video, the creator approves the guest, and a replay is always labelled as a replay.

## Key Features

- Twitch creator login and private dashboard
- Live Launchpad with real channel status and Twitch Stream Manager handoff
- Creator-owned Arenas for each stream, with pre-match, live, and post-match phases
- Side or neutral supporter identity, picture posts, public reactions, and a shared live feed
- AI Banter Arena with club-versus-club scoring, Heat Director prompts, safety rules, and creator call-ups
- Unique-viewer hype detection from Twitch chat
- Twitch clip capture for real live sessions
- Grounded commentary and platform-specific social drafts
- Creator review before approval or sharing
- Public Moment pages, poster images, and an OBS overlay
- Deterministic El Clásico replay for demos when no match is live

## Architecture

CrowdPulse uses Next.js, React, and TypeScript. Twitch OAuth identifies the creator, Helix reads channel state and creates clips, and EventSub delivers chat. AWS API Gateway, Lambda, SQS, and DynamoDB handle audience bursts, unique reactions, cooldowns, and review state. Gemini prepares grounded commentary, with a transparent fallback.

## Challenges We Ran Into

The hardest challenge was protecting the magic without faking it.

Twitch does not replace OBS. A call-up is not an automatic guest admission. A historical replay is not a live feed. One viewer cannot manufacture a crowd surge by spamming. CrowdPulse keeps those boundaries visible with unique-viewer counting, safety scoring, labelled replay data, execution traces, and creator approval.

## Accomplishments We Are Proud Of

- One connected journey from the first prediction to the post-match panel
- A creator-owned Arena that makes audience personality part of the show
- A visible agent trace that explains what happened and what was skipped
- An AWS-backed, rate-limited participation path
- A reliable demo that never fabricates a live Twitch clip

## What We Learned

We learned that AI feels most useful when it gives the creator better choices instead of making the final choice for them.

We also learned that the heart of a sports stream is not only the footage. It is the prediction before kickoff, the picture that captures the mood, the joke that starts a rivalry, the explosion after the goal, and the story the creator and crowd carry into the next stream.

## Testing Instructions

### Fast judge path

1. Open `https://crowd-pulse-ai-delta.vercel.app/demo` and enter the Banter Arena.
2. Choose a side or stay neutral, use a Heat Director prompt, post a shout or picture, and react to the live feed.
3. Move the Arena from pre-match to live or post-match, then mark a safe supporter for a live call-up or post-match panel.
4. Return to the dashboard and replay the 88th-minute winner.
5. Review the agent trace, approve the Moment, and open its public page.

### Real Twitch path

Connect Twitch, start an original OBS test scene from the Live Launchpad, start the CrowdPulse listener, and ask five distinct viewers to send the hype command. The resulting candidate should enter creator review before approval.

## Public Demo Link

- App: https://crowd-pulse-ai-delta.vercel.app
- Live experience preview: https://crowd-pulse-ai-delta.vercel.app/demo
- Banter Arena: https://crowd-pulse-ai-delta.vercel.app/rooms/clasico-2026-crowd-room#banter-room
- Public Moment: https://crowd-pulse-ai-delta.vercel.app/moments/clasico-2026-mbappe-88

## Public Repository Link

https://github.com/joboyebisi/CrowdPulseAI

## Demo Video

**Video URL:** TODO

Suggested 3-minute story:

1. Introduce Maya: one streamer trying to catch an entire crowd.
2. Open her Arena and show the two sides warming up the rivalry.
3. Post a picture, react to banter, and call up one standout supporter.
4. Replay the 88th-minute goal, show the crowd surge and agent trace, then approve the Moment.
5. Return to extra time for the post-match panel.
6. Close with: **"The stream may end. The crowd's story keeps moving."**

## Screenshot Shot List

1. Landing-page hero with the Twitch and preview actions
2. Creator dashboard showing the Live Launchpad
3. Banter Arena showing club scores, picture posts, reactions, Heat Director, and creator call-ups
4. Moment review card with the agent execution trace
5. Approved public Moment page with share controls

## Known Limitations

- Twitch still requires OBS or another encoder to transmit video.
- Guest-stage nomination is creator-controlled; the current build does not automatically admit a supporter to Twitch Guest Star.
- The demo uses labelled fictional supporter activity around a historical replay.
- Live football data requires an optional provider token.
- The first Banter Ref uses transparent deterministic scoring; model-backed judging is planned behind the same safety rules.

## What's Next

- Twitch Guest Star integration for Twitch-authenticated nominees
- Model-backed Banter judging with the transparent scorer as fallback
- Multi-stream rivalry rooms and moderator controls
- Licensed live match schedules and statistics
- Creator-approved vertical video rendering and captioning

## Submission Readiness Notes

- Core public build: ready
- Latest Arena picture, reaction, phase, and call-up interface: deployment verification pending
- Public repository: ready
- Automated and browser testing: passed
- Demo video: TODO
- Final screenshots: TODO
- Official event fields and judging criteria: TODO after the Devpost workflow is initialized

## TODO Official Form Fields

- Hackathon name and URL
- Category or prize track
- Team members
- Submission deadline and timezone
- Demo video URL
- Final screenshots
- Any event-specific AI or Codex questions

### ⏳ Not submitted yet

Nothing has been sent to Devpost.
