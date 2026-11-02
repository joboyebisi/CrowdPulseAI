# CrowdPulse agent handoff

## Current build

- Next.js 16.4.3 and React 19.3.1.
- Twitch authorization-code login with encrypted HTTP-only session cookies, refresh-token renewal, and the chat/bot grants required by the cloud EventSub webhook.
- Canonical creator entry flow: landing page -> `/login` -> Twitch OAuth -> authenticated `/dashboard`; signed-out dashboard requests return to login.
- Production OAuth callbacks persist KMS-encrypted creator grants in AWS and register Twitch EventSub webhook subscriptions.
- Durable creator state, chat events, unique-viewer hype windows, cooldowns, Twitch clip capture, Gemini/fallback moment packaging, review state, and public Moment pages.
- Four observable moment agents: Signal Scout, Clip Director, Pundit, and Growth Producer.
- Durable Match Rooms with creator management, a public countdown/check-in experience, score predictions, polls, supporter counts, and opening talking points.
- Vercel server routes use the AWS API in production and retain deterministic in-memory behavior for local/demo fallback.
- Public `/demo` live experience preview themed around Barcelona 1–2 Real Madrid on 25 October 2026: seeded Clásico Match Room, local room creation, opening brief, 88th-minute winner replay, four-agent trace, and review controls. The result is historical; supporter/chat data is visibly fictional and isolated from AWS production data.
- Match Rooms include a durable Banter Room: public supporter posts, five-second audience refresh, team colours, creator-dashboard count, and latest-shout visibility. Messages are escaped by React, length-limited, and expire from DynamoDB after 30 days.
- The football pulse uses Sportmonks live-score polling every 30 seconds when `SPORTMONKS_API_TOKEN` is configured; otherwise it explicitly displays the verified historical replay.
- The Clásico demo Moment uses the stable ID `clasico-2026-mbappe-88`, so approve/open works across stateless Vercel instances.
- Approved real moments embed the official Twitch clip and expose a generated 1200×630 share card, download action, device share action, dynamic Open Graph metadata, and Twitch-source link.
- The live experience preview uses `public/media/demo-streamer-reaction.png`, an AI-designed fictional creator reaction with visible provenance and no match footage or real-person likeness.
- Public Banter Room writes reject links/control characters and use a durable DynamoDB ten-second per-supporter cooldown.
- Twitch Developer Console now registers the canonical production callback `https://crowd-pulse-ai-delta.vercel.app/api/auth/twitch/callback`.
- The creator dashboard now includes a Live Launchpad that polls Twitch Helix for the authenticated channel's real live state, links to Twitch Stream Manager, exposes the live-experience preview, and states the OBS/encoder boundary without requesting or storing a stream key.
- The Banter Room is now the AI Banter Arena: transparent wit/relevance/energy/sportsmanship scores, safe-only club standings, host response cues, and creator-controlled stage nomination. Stage nomination is a UI handoff and never claims a Twitch guest has joined.
- An empty creator account always shows a direct Banter Arena preview link, so the feature is discoverable before the first Match Room is created.
- The complete four-minute narrative lives in `docs/DEMO_SCRIPT.md`; the extended requirements live in `docs/hackathon-build/prd.md`; `devpost-submission.md` is a provisional, explicitly unsubmitted application draft because the repository has no registered Devpost hackathon state.

## Production deployment - November 2, 2026

- Git branch: `main`.
- Durable integration revision: `c4d49c7`.
- Production bootstrap revision: `5e5c369`.
- Creator login and OAuth hostname fix: `e9733ad`.
- Vercel web: `https://crowd-pulse-ai-delta.vercel.app`.
- AWS account: `695912022574`.
- AWS region: `eu-west-2`.
- CloudFormation stack: `crowdpulse-backend` (`UPDATE_COMPLETE`).
- AWS API: `https://e89itqb0ph.execute-api.eu-west-2.amazonaws.com`.
- EventSub callback: `https://e89itqb0ph.execute-api.eu-west-2.amazonaws.com/eventsub`.
- DynamoDB table: `crowdpulse-backend-CrowdPulseTable-3WLKMXIKWLO2`.
- DynamoDB `byCreator` GSI: `ACTIVE`.
- KMS key ARN: `arn:aws:kms:eu-west-2:695912022574:key/08141e80-13f5-4e30-ad4c-4d2d239d85a8`.
- EventSub secret ARN: `arn:aws:secretsmanager:eu-west-2:695912022574:secret:EventSubWebhookSecret-MfMuaznbcVnP-DZKfsf`.
- Internal API secret ARN: `arn:aws:secretsmanager:eu-west-2:695912022574:secret:InternalApiSecret-ZdpvXuXANpHW-aYcAoD`.
- Integration secret ARN: `arn:aws:secretsmanager:eu-west-2:695912022574:secret:crowdpulse/integrations-fek9Lg`.

Vercel's protected bootstrap route synchronized the existing Twitch and Gemini configuration into AWS. Verification checked only field presence; secret values were never printed or written to the repository. The route rejects requests without the internal secret with HTTP 401.

## Current verification

- TypeScript check, ESLint, seven Node tests, and the production Next.js build passed before deployment.
- The latest Vercel production deployment is Ready.
- The production session endpoint reports Twitch configured and `Gemini 3.8` active.
- A production AWS smoke test passed room creation, creator-index listing, public read, supporter join, and three-line opening brief generation.
- A production AWS smoke test passed Banter post, read, room count, and creator visibility; its temporary partition was removed.
- Temporary QA DynamoDB records were deleted after the smoke test.
- No Twitch user is currently authenticated in the verification session.

## Immediate continuation order

1. Push and deploy the Live Launchpad/Banter Arena revision, then verify `/api/twitch/live-status` with the authenticated production session.
2. Use `/demo` for the no-stream walkthrough, then send live chat hype from distinct Twitch viewers for the separate integration proof.
3. Record the flow in `docs/DEMO_SCRIPT.md` and add the resulting video URL/screenshots to `devpost-submission.md`.
4. Initialize the official Devpost workflow with `$start-hackathon`, reconcile event-specific rules, then prepare/submit only after explicit confirmation.
5. Create a least-privilege AWS deployment role before routine AWS maintenance; the initial bootstrap used a root login session.

Never copy secret values from Secrets Manager into documentation, Git, client-side variables, or command output.
