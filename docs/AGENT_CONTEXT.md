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
- Public `/demo` judge sandbox themed around Barcelona 1–2 Real Madrid on 25 October 2026: seeded Clásico Match Room, local room creation, opening brief, 88th-minute winner replay, four-agent trace, and review controls. The result is historical; supporter/chat data is visibly fictional and isolated from AWS production data.

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
- Temporary QA DynamoDB records were deleted after the smoke test.
- No Twitch user is currently authenticated in the verification session.

## Immediate continuation order

1. Open the production app and choose **Connect Twitch** so the streamer grants consent; this persists the real encrypted creator grant and registers the EventSub subscription.
2. Use `/demo` for the no-stream judge walkthrough, then send live chat hype from distinct Twitch viewers for the separate integration proof.
3. Complete screenshot-based desktop/mobile visual QA across the landing page, dashboard, Match Rooms, moment review, overlay, and public pages.
4. Polish any visual issues, then follow `docs/DEMO_RUNBOOK.md` and record the demo.
5. Create a least-privilege AWS deployment role before routine AWS maintenance; the initial bootstrap used a root login session.

Never copy secret values from Secrets Manager into documentation, Git, client-side variables, or command output.
