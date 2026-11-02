<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## CrowdPulse project context

CrowdPulse is the audience-intelligence layer for Twitch sports creators. The connected product journey is:

1. **Before kickoff:** a Twitch-authenticated creator opens a Match Room with a countdown, score predictions, a poll, supporter check-ins, and an opening brief.
2. **During the stream:** Twitch chat sends unique `!hype`, `!clip`, or `!moment` signals; CrowdPulse captures a Twitch clip and prepares grounded Pundit and Growth Producer drafts.
3. **After the moment:** the creator approves or rejects the candidate before it reaches the public Moment page or OBS overlay.

### Runtime direction

- The Next.js 16 web application remains the creator and supporter experience.
- Production EventSub uses signed Twitch webhooks on AWS, not a long-lived Vercel WebSocket.
- AWS target: API Gateway -> ingest Lambda -> SQS/DLQ -> processor Lambda -> DynamoDB.
- Secrets Manager owns the EventSub HMAC secret; durable Twitch grants must use KMS-backed application encryption.
- The local WebSocket and in-memory stores are development fallbacks only. Do not describe Match Rooms or moments as durable until their adapters use AWS.
- AWS deployment files live in `infra/`; read `docs/AWS_BACKEND.md` and `docs/ARCHITECTURE.md` before backend changes.

### Product and design rules

- Keep the experience recognizably sports-led: match-day language, clear icons, restrained emoji, crowd energy, and creator control.
- Never invent teams, players, scores, competitions, results, or match events in AI copy.
- Never publish a moment automatically. Approval is an explicit creator action.
- Preserve visible provenance for sandbox, live Twitch, AI-generated, and creator-approved content.
- Keep core supporter participation useful without gambling, Channel Points, or a mandatory viewer login.
- Design mobile-first for public Match Rooms and responsive control-room layouts for creators.

### Security and verification

- Never commit populated `.env*` values or paste credentials into docs, fixtures, screenshots, or logs.
- Protect creator mutations with the encrypted Twitch session and verify resource ownership.
- Verify EventSub HMAC signatures against the raw request body, reject stale timestamps, and deduplicate Twitch message IDs.
- Before handoff run `npm run check`, `npm run lint`, `npm test`, and `npm run build`.
- A production claim requires a real Twitch smoke test and a deployed AWS stack; the sandbox harness alone is not sufficient.
