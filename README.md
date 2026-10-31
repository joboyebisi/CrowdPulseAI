# CrowdPulse AI

CrowdPulse turns a spike of unique `!hype` messages in Twitch chat into a creator-reviewed, AI-captioned, shareable moment.

The MVP implements the complete product loop:

1. A creator connects a Twitch channel using OAuth authorization code flow.
2. A persistent Node.js process listens to `channel.chat.message` through EventSub WebSockets.
3. Unique viewer votes are aggregated inside a sliding time window with a cooldown.
4. Twitch Create Clip is called and Get Clips is polled for up to 15 seconds.
5. The Moment Agent creates grounded copy from the available chat context.
6. The creator approves or rejects the candidate.
7. An approved moment receives a shareable page and appears in the OBS overlay.

Demo events and demo moments are visibly labelled and never represented as Twitch activity.

## Quick start

```bash
npm install
copy .env.example .env.local
npm run dev
```

Open `http://localhost:3000`. The landing page and labelled demo flow work without third-party credentials.

For live Twitch integration, follow [docs/TWITCH_SETUP.md](docs/TWITCH_SETUP.md).

## Commands

```bash
npm run dev      # local development server
npm run check    # TypeScript validation
npm test         # hype detector tests
npm run build    # production build
npm start        # persistent Node.js production server
```

## Important deployment constraint

The EventSub listener is held by the Node.js process. Deploy this project to a persistent Node host (for example Railway, Render, Fly.io, or a VM), not a request-isolated serverless function. The web UI may be separated onto Vercel later, but the listener and moment pipeline must remain persistent.

The current hackathon store is process memory by design, so restarting the server clears moments. PostgreSQL and Redis are the next production step.

## Safety and permissions

- OAuth credentials are encrypted into an HTTP-only, same-site cookie.
- The MVP asks only for `user:read:chat` and `clips:edit`.
- AI copy is labelled and instructed not to invent scores, teams, players, or match facts.
- Every moment requires creator approval before its share page becomes available.
- Only the creator's commentary and Twitch-authorised clip are handled; CrowdPulse does not assume rights to sports broadcast footage.
