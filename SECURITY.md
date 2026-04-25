# Security Policy

## Reporting a vulnerability

**Do not file public issues for security problems.**

Email `security@iconsol.me` (or, until that mailbox is live, use **[GitHub Security Advisories](https://github.com/ikeacrisp/iconsol/security/advisories/new)**) with:

- A description of the issue
- Steps to reproduce
- Affected version / commit
- Your contact info for follow-up

You will receive an acknowledgement within **72 hours**. We aim to ship a fix or mitigation within **14 days** for high-severity issues.

We will credit you in the release notes (or keep you anonymous — your choice).

## In scope

- The deployed site at `iconsol.me`
- API routes under `apps/web/src/app/api/`
- The MCP endpoint at `/api/mcp`
- Any future npm package published under the `iconsol` name

## Out of scope

- Reports on third-party brand assets (those go to the trademark holder)
- Denial-of-service against the public read-only API (handled by Vercel edge protection)
- Reports without a reproducible PoC
- Findings against forks or self-hosted instances

## Security posture (current)

- All API routes are read-only over public icon data — no user data, no auth tokens, no writes.
- Inputs to API routes are validated with `zod`.
- No user-supplied URLs are fetched server-side (no SSRF surface).
- Secrets are stored exclusively in Vercel project env vars and GitHub Actions secrets — never in source.
- CORS on `/api/mcp` is `*` because the data is public; this will narrow when authenticated routes are added.

## Hardening that will land before any authenticated route ships

- Per-IP rate limiting (Upstash Ratelimit)
- Origin allowlist on CORS
- Auth tokens scoped per-route, rotated on a schedule
- Dependency-pinned production builds with `pnpm audit` gate in CI
- CodeQL + Dependabot already enabled (see `.github/`)
