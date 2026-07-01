# Security Policy

This is a personal portfolio/case-study project, not a maintained product — but if you find a security issue, please report it.

**To report:** open a [GitHub issue](https://github.com/chrisamber/wset-2-study-companion/issues) or email the maintainer directly rather than filing a public issue if the report involves a live credential or exploit. There's no bug bounty and no SLA, but reports will be read and fixed on a best-effort basis.

## Scope notes

- No user accounts, no persistent user data, no database — the main attack surface is the `/api/chat` route (rate-limited, input-length-capped) and the two third-party API keys (`VOYAGE_API_KEY`, `AI_GATEWAY_API_KEY`) it calls out to.
- Rate limiting is an in-memory, per-instance guard proportionate to portfolio-demo traffic, not a production-grade defense — see `src/lib/chat-helpers.ts`.
