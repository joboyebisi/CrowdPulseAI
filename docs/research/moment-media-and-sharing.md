# Moment media and sharing research

CrowdPulse treats Twitch as the source of truth for live video and adds a creator-controlled packaging layer around it.

## Product decisions

- **Capture:** use Twitch's Create Clip endpoint with `clips:edit`; a returned clip is polled until Twitch provides its URL and thumbnail.
- **Playback:** approved live moments use Twitch's official non-interactive Clips embed. The production hostname is passed as the required `parent` value.
- **Generated media:** CrowdPulse creates a 1200×630 social card from the approved title, hype score, discoverer count, and Twitch thumbnail. The creator can download it or share the public Moment URL through the device share sheet.
- **Demo integrity:** the experience preview uses a clearly labelled AI-designed fictional streamer reaction. It contains no real match footage, club marks, player likenesses, or implied Twitch clip.
- **Publishing boundary:** platform copy and media are prepared for review. CrowdPulse does not silently publish to a creator's social accounts.

## Official sources

- Twitch Clips API: https://dev.twitch.tv/docs/api/clips
- Twitch clip embeds and required `parent` domain: https://dev.twitch.tv/docs/embed/video-and-clips/
- Twitch OAuth scopes: https://dev.twitch.tv/docs/authentication/scopes/
- EventSub chat authorization and payloads: https://dev.twitch.tv/docs/eventsub/eventsub-subscription-types/#channelchatmessage

## Next production step

Complete one live-channel proof with clips enabled: connect Twitch, start a live stream, send qualifying hype commands from unique viewers, approve the resulting moment, play the embedded clip, and download the generated social card.
