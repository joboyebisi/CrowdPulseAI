# Pre-stream engagement research

Research date: October 31, 2026

## Question

What can sports creators do before a stream—especially before a football match—to increase anticipation, participation, and the likelihood that viewers return when the creator goes live?

## Findings

### Scheduling creates an attendance anchor

Twitch says schedules appear on Following and search pages. Upcoming scheduled streams can also expose a one-time Reminder action in Twitch surfaces. CrowdPulse should create a richer pre-match destination while preserving Twitch as the source of truth for the broadcast.

**Product implication:** every Match Room needs a scheduled time, localized countdown, Twitch link, and explicit live-state transition.

Sources: [Twitch Channel Page Setup](https://help.twitch.tv/s/article/channel-page-setup), [scheduled-stream reminders](https://help.twitch.tv/s/article/shoutouts).

### Participation builds ownership

The European Club Association's football-fandom research says digital participation can deepen ownership and emotional attachment, specifically naming voting, quizzes, and polls.

**Product implication:** combine one prediction, one lightweight poll or quiz, and a supporter check-in instead of a passive countdown or long form.

Source: [ECA — Fan of the Future](https://www.ecaeurope.com/media/4802/eca-fan-of-the-future-defining-modern-football-fandom.pdf).

### Fans want short, current, personalized context

IBM and Morning Consult surveyed more than 18,000 sports fans across ten countries. Respondents prioritized real-time updates and personalized content as AI enhancements, while summaries, highlights, and social content were important complementary formats.

**Product implication:** turn participation into a concise creator opening brief and crowd summary, not a generic long AI preview.

Source: [IBM Global Sports Attitudes and Behaviors study](https://newsroom.ibm.com/2024-06-26-IBM-Study-Fan-Engagement-and-Consumption-of-Sports-Shifting%2C-Reveals-New-Opportunities-for-Technology-Integrations-including-AI).

### Twitch-native tools cannot be the universal core

Twitch exposes schedules, polls, and predictions through Helix. Polls require `channel:manage:polls`; Channel Points predictions require `channel:manage:predictions` and are limited to Affiliates and Partners.

**Product implication:** detect capabilities and fall back gracefully. Match Rooms must work without Channel Points.

Sources: [Twitch API reference](https://dev.twitch.tv/docs/api/reference), [Twitch Predictions](https://dev.twitch.tv/docs/api/predictions).

### The live handoff is the differentiator

Most pre-stream tools stop at reminders. CrowdPulse can turn fan responses into the first five minutes of the show: the split prediction, hottest take, closest poll, and a question the creator can answer immediately. This is a product inference from the participation and short-form research above.

## Recommended experience

1. Creator publishes an upcoming Match Room.
2. Fans see a countdown and submit a prediction, poll response, and check-in.
3. An explainable hype meter rises with unique participation.
4. The creator receives a short opening brief.
5. At go-live, the room keeps its URL and shifts to live mode.
6. The final result can appear in OBS while chat moment detection begins.

## Guardrails

- Predictions are community entertainment, not betting advice.
- Participation does not require payment, Channel Points, or Affiliate status.
- Match claims come from creator-entered or licensed data.
- AI remains labelled, editable, and grounded.
- Public aggregates do not expose personal viewer information.
- Participation requires deduplication, rate limits, moderation, and transparent scoring.

## Hypotheses to test

- A Match Room increases arrival during the first ten minutes.
- A three-action lobby converts better than a long prediction form.
- Showing the leading prediction in OBS increases early chat participation.
- Creators who receive a useful opening brief repeat the workflow.
