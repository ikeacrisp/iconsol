# Contributing to iconsol

Thanks for your interest! There are three main ways to contribute.

## 1. Add or update a logo

1. Open an [issue](https://github.com/ikeacrisp/iconsol/issues/new?labels=logo-request) describing the project and linking to its official brand assets.
2. After triage, open a PR that:
   - Adds the SVG to `icons/<category>/<id>.svg` (and `apps/web/public/icons/<category>/<id>.svg`)
   - Adds an entry to `icons/manifest.json`
3. Optimize the SVG (`pnpm svgo` or [svgomg](https://jakearchibald.github.io/svgomg/)) — keep file size < 4 KB where possible.
4. Use a `viewBox`, no inline `width`/`height`, no embedded raster images.

## 2. Improve the site

1. Fork and branch from `main`.
2. Run `pnpm install`, then `pnpm --filter web dev`.
3. Read `CLAUDE.md` for the design system rules — this project uses inline `style={{}}` for design values, Tailwind only for layout utilities.
4. Run `pnpm --filter web lint` and `pnpm --filter web build` before pushing.
5. Open a PR. Keep PRs focused and small.

## 3. Submit a trademark removal request

If you are the rights-holder for a logo and want it removed, open an issue with the `removal-request` label or email `trademark@iconsol.me`. We action within 7 days.

## Code style

- TypeScript strict mode, no `any`.
- Prefer editing existing files over creating new ones.
- No comments unless they explain non-obvious *why*. Identifiers should carry the *what*.
- ESLint must pass with zero warnings.

## API / MCP route rules (strict)

When touching anything under `apps/web/src/app/api/`:

- All input parsed with `zod`. No raw `request.json()` consumed without validation.
- No `fetch()` of user-supplied URLs without an explicit allowlist.
- No `eval`, no dynamic `require`, no `child_process`.
- Secrets via `process.env` only — never inline, never logged, never echoed in responses.
- New write/auth routes require an explicit security review by a CODEOWNER.
- Add a test or a manual repro note to the PR description.

## Commit messages

Conventional-ish — short, imperative. Examples:

- `Add Drift logo`
- `Fix dark-mode contrast on detail page`
- `Tighten CORS allowlist on /api/mcp`

## Releases

The web app auto-deploys to Vercel from `main`. The npm package (`iconsol`) is published manually from a tag — see release notes for the version.
