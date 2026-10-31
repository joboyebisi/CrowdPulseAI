# Product roadmap

| Phase | Outcome | Key work | Exit signal |
| --- | --- | --- | --- |
| 0 — Live MVP | Prove the crowd-to-moment loop | OAuth, EventSub, `!hype`, clips, AI draft, approval, overlay | One real Twitch channel completes the full flow |
| 1 — Production foundation | Make real-time operation durable | PostgreSQL, Redis, token refresh, worker, monitoring, authorization | Listener survives deploys and reconnects automatically |
| 2 — Pre-Match Hype | Build audience before kickoff | Match Rooms, countdown, prediction, poll/trivia, check-in, opening brief | Fans participate and return when the stream starts |
| 3 — Native Twitch depth | Meet creators where they already work | Schedule sync, eligible polls/predictions, richer EventSub, moderator roles | Creator runs the flow without duplicate setup |
| 4 — Retention | Turn match-day spikes into a community habit | Recaps, seasons, streaks, insights, multi-stream rooms | Creators and fans return across fixtures |

## Next build slice

1. Introduce durable creator and Match Room data models.
2. Build creator Match Room setup.
3. Build the public countdown and three participation modules.
4. Add deduplication, rate limits, lock times, and moderation.
5. Generate the creator opening brief.
6. Carry the result into the dashboard and OBS overlay.

## Decisions deferred

- Sports-data provider: requires rights, coverage, latency, and pricing evaluation.
- Viewer identity model: begin with privacy-preserving participation, then test Twitch sign-in.
- Notification channels: start with Twitch links and reminders before adding Discord or email.
- Monetization: prove repeat use before subscriptions, sponsorship, or premium analytics.
