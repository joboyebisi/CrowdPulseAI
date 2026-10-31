# Contributing to CrowdPulse

Thanks for helping build better tools for sports creators.

## Before opening a change

1. Search existing issues.
2. Keep the proposal aligned with creator control, community signal, grounded AI, and rights-aware media handling.
3. Open a feature request before large product or architecture changes.

## Development

```bash
npm install
copy .env.example .env.local
npm run dev
```

Before submitting:

```bash
npm run lint
npm run check
npm test
npm run build
```

Never commit `.env.local`, access tokens, client secrets, viewer personal data, or copyrighted match media.

## Pull requests

- Keep each pull request focused.
- Explain the user problem and acceptance criteria.
- Add tests for changed behavior.
- Include screenshots for visible UI changes.
- Document new scopes, environment variables, migrations, and deployment requirements.
