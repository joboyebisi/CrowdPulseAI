# Twitch integration setup

## 1. Create or prepare a Twitch account

Sign in at the [Twitch Developer Console](https://dev.twitch.tv/console/apps). Twitch requires a verified account with two-factor authentication enabled before an application can be registered.

## 2. Register CrowdPulse

Create an application with:

- Name: a unique name such as `CrowdPulse AI <your-name>`
- OAuth redirect URL: `http://localhost:3000/api/auth/twitch/callback`

CrowdPulse derives this callback from `NEXT_PUBLIC_APP_URL`, so there is only one hostname to configure. For production, register the exact canonical callback URL shown in `docs/DEPLOYMENT.md` in the Twitch Developer Console.
- Category: Chat Bot or Website Integration, whichever the console currently offers for the application
- Client type: confidential, because the Next.js server exchanges the code using a client secret

Copy the Client ID. Generate a Client Secret once and keep it private.

## 3. Configure local secrets

Copy `.env.example` to `.env.local` and fill in:

```dotenv
TWITCH_CLIENT_ID=your_client_id
TWITCH_CLIENT_SECRET=your_client_secret
SESSION_SECRET=a_random_secret_of_at_least_32_characters
```

Do not commit `.env.local` or paste the client secret into chat.

## 4. Run and connect

```bash
npm run dev
```

1. Open `http://localhost:3000/login`.
2. Select **Connect with Twitch**.
3. Review and grant `user:read:chat` and `clips:edit`.
4. Return to the dashboard and select **Start listener**.
5. Start a Twitch stream with clips enabled.
6. Have five different viewers send `!hype` within 20 seconds.

The threshold, window, and cooldown can be tuned in `.env.local`.

## 5. Add the OBS overlay

Add a Browser Source in OBS:

- URL: `http://localhost:3000/overlay`
- Width: `1280`
- Height: `720`
- Shutdown source when not visible: optional

The overlay background is transparent. It shows a compact ready indicator until the first moment arrives.

Append `?voice=1` to enable browser-based pundit speech:

`http://localhost:3000/overlay?voice=1`

## Twitch behavior to expect

- EventSub first sends a welcome message. CrowdPulse uses its session ID to create the `channel.chat.message` subscription.
- A user access token is required for a WebSocket EventSub subscription.
- Create Clip requires `clips:edit` and only works while the broadcaster is live with clips enabled.
- Clip creation is asynchronous. CrowdPulse polls Get Clips every three seconds and reports failure after 15 seconds, matching Twitch's documented guidance.
- The created capture window can include up to roughly 85 seconds before the API call and 5 seconds after it; Twitch decides the default published section.

## Optional AI captions

Set `GEMINI_API_KEY` and `GEMINI_MODEL=gemini-3.8-flash` to enable the Pundit and Growth Producer agents. OpenAI remains an optional secondary provider. Without either key, CrowdPulse uses a transparent deterministic package so the Twitch workflow still works.

## Verify the agent harness

Run the deterministic pipeline before using live credentials:

```bash
npm run harness
npm test
```

The harness consumes the same `channel.chat.message` envelope shape as EventSub, exercises every agent state, and uses no Twitch or Gemini quota. Then open `/api/health` to confirm the deployed provider and runtime status. A Vercel function cannot reliably retain the current WebSocket after its request finishes; production EventSub therefore needs the always-on worker described in the architecture guide, or a signed webhook backed by durable token and moment storage.
