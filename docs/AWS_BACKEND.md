# AWS backend direction

CrowdPulse will use Twitch EventSub webhooks instead of keeping a WebSocket alive inside Vercel. The initial AWS foundation in `infra/` provides:

- API Gateway HTTP API for the public Twitch callback;
- Lambda HMAC verification, timestamp checks, and duplicate-event protection;
- SQS buffering with a dead-letter queue;
- Lambda event processing;
- DynamoDB with on-demand capacity, encryption, TTL, and point-in-time recovery;
- Secrets Manager generation for the EventSub signing secret.

This topology is deliberately serverless for the demo and early product. It avoids paying for an idle worker and supports many Twitch creators through one callback.

## Delivery sequence

1. Rotate Twitch and Gemini credentials and generate a new session secret.
2. Restore a valid AWS CLI session and install AWS SAM CLI.
3. Run `sam validate --lint`, `sam build`, and `sam deploy --guided` from `infra/`.
4. Read the stack outputs and register the EventSub callback using an app access token.
5. Move Match Rooms, participation, moments, and encrypted Twitch grants from the local repository adapters into DynamoDB.
6. Add the queue consumer's hype-window transaction, clip capture, token refresh, and Moment Agent job.
7. Point Vercel server routes at the authenticated AWS API and run the real Twitch smoke test.

## Security boundaries

- Never expose the EventSub HMAC secret, Twitch client secret, refresh tokens, or Gemini key to the browser.
- Store Twitch grants encrypted with KMS-backed application encryption before durable persistence.
- Require a Twitch creator session for room management and moment review.
- Keep supporter participation pseudonymous, rate-limited, and idempotent.
- Set CloudWatch alarms on dead-letter messages, Lambda errors, and callback latency.

The current `infra/` slice only receives, verifies, deduplicates, queues, and records chat events. It does not yet create Twitch subscriptions or capture clips; those steps require a valid AWS account session and newly rotated production credentials.
