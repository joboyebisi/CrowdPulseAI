# CrowdPulse agent handoff

## Current build

- Next.js 16.4.3 and React 19.3.1.
- Twitch authorization-code login with encrypted HTTP-only session cookies and refresh-token renewal.
- EventSub WebSocket development path with unique-viewer hype aggregation, Twitch clip creation, creator review, Moment pages, and OBS overlay.
- Four observable moment agents: Signal Scout, Clip Director, Pundit, and Growth Producer.
- Creator Match Room management plus a public pre-match experience with countdown, check-in, score prediction, poll, terrace pulse, and opening talking points.
- Match Rooms currently use a process-global memory adapter. Their UI and API contracts are implemented, but AWS persistence is the next integration step.

## AWS slice

`infra/template.yaml` defines the first serverless ingestion stack:

- API Gateway HTTP API;
- HMAC-verifying EventSub Lambda;
- DynamoDB receipt deduplication;
- SQS queue and dead-letter queue;
- queue processor Lambda;
- DynamoDB TTL, encryption, on-demand capacity, and point-in-time recovery;
- generated EventSub secret in Secrets Manager.

The queue processor currently records Twitch chat events. It still needs the DynamoDB hype-window transaction, encrypted creator grant lookup, clip capture, caption job, and dashboard update path.

## Immediate continuation order

1. Deploy the AWS foundation in `eu-west-2` using the `crowdpulse` CLI profile.
2. Add durable Match Room and participation repositories backed by DynamoDB.
3. Persist encrypted Twitch creator grants and create webhook subscriptions with an app access token.
4. Implement serverless hype aggregation, cooldown, clip capture, and moment persistence.
5. Connect Vercel server routes to the AWS API and configure production secrets.
6. Run the live Twitch proof from `docs/DEMO_RUNBOOK.md`.
7. Complete screenshot-based desktop/mobile design QA and prepare the video-demo script.

## Current verification

The latest local pass completed TypeScript, ESLint, seven Node tests, and the production Next.js build. Browser screenshot QA was unavailable in that session, so visual review remains required before recording the demo.
