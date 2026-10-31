# Security policy

## Reporting

Do not open a public issue for vulnerabilities, leaked credentials, token exposure, authorization bypasses, or personal-data findings. Use GitHub's private vulnerability reporting for this repository.

## Sensitive data

- Never commit Twitch or OpenAI secrets.
- OAuth access and refresh tokens must remain encrypted and server-side.
- Viewer activity must be minimized and aggregated for public display.
- Logs must not contain tokens, secrets, or raw session cookies.

If a secret is exposed, revoke or rotate it immediately before investigating downstream effects.
