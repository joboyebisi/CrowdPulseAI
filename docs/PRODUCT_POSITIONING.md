# CrowdPulse product positioning

## The category

CrowdPulse is a live audience-orchestration system for sports streamers. It sits upstream of VOD editing tools: the crowd identifies a moment while it is happening, Twitch creates the source clip, and a creator-controlled agent team packages the moment for reuse.

## CrowdPulse versus VOD automation

| Dimension | CrowdPulse | VOD clipping products |
| --- | --- | --- |
| Moment signal | Live audience commands and chat energy | Post-stream transcript, audio, or video analysis |
| Source media | Twitch-authorised clip | Downloaded or locally processed VOD |
| Primary value | Participation, speed, context, and creator control | Automated editing and publishing efficiency |
| Infrastructure | Twitch APIs plus lightweight AI generation | Transcription, FFmpeg, computer vision, and often GPUs |
| Output today | Clip candidate, pundit line, social drafts, approval page, OBS alert | Edited vertical video with captions |

The products are complementary. A future Render Agent can consume an approved CrowdPulse moment and hand it to a vertical-video pipeline. CrowdPulse should own the live signal, provenance, and approval record; the renderer should own reframing, subtitles, and export.

## The agent team

1. **Signal Scout** watches Twitch chat for unique audience triggers and qualifying energy.
2. **Clip Director** requests the native Twitch clip and verifies that it is ready.
3. **Pundit** writes a short, grounded call using only supplied chat and creator context.
4. **Growth Producer** creates distinct TikTok, YouTube Shorts, and X drafts.
5. **Creator** is the final editor and publisher. No public moment bypasses approval.

## What is implemented

| Capability | Status |
| --- | --- |
| Twitch OAuth and EventSub chat | Implemented |
| Unique `!hype`, `!clip`, and `!moment` voting | Implemented |
| Twitch Create Clip and readiness polling | Implemented |
| Gemini 3.8 pundit line and social package | Implemented, with OpenAI and deterministic fallbacks |
| Creator approve/reject workflow | Implemented |
| Public moment page and OBS browser overlay | Implemented |
| Optional browser text-to-speech overlay | Implemented with `/overlay?voice=1` |
| Post-copying to Twitch chat | Planned; requires an explicit send-message scope and creator control |
| Automatic vertical reframing, captions, and export | Planned Render Agent integration |
| Automatic TikTok/Shorts publishing | Not implemented; creator approval remains a product boundary |
| Durable multi-creator cloud listener | Production foundation: worker, PostgreSQL, and Redis required |

## Moment Cards and collections

The useful lesson from sports collectibles is not to add tokens prematurely. It is to turn a moment into a durable, attributable object:

- creator, channel, Twitch clip ID, and timestamp;
- the crowd members who contributed to the threshold;
- hype score and trigger window;
- approved pundit line and campaign drafts;
- collection tags such as match, season, rivalry, or community milestone.

This supports non-monetary collections, contributor badges, quests, and recaps without implying ownership of match footage or licensed sports IP. Wallets, scarcity, resale, and NFTs are out of scope until rights, licensing, moderation, and repeated creator demand are proven.

## Immediate creator value

The first-use promise is simple: connect Twitch, start the listener, let viewers call the moment, and receive a review-ready growth package in the same dashboard. The creator does not need to download a VOD, run a GPU, or scrub a six-hour stream to prove the loop.

