# Contributing to iconsol

Thanks for your interest! There are three main ways to contribute.

## 1. Add or update a logo

Each logo lives in its own folder at `icons/<id>/`. See
[icons/README.md](icons/README.md) for the full schema and quality bar.

1. Open an [issue](https://github.com/ikeacrisp/iconsol/issues/new?labels=logo-request)
   describing the project and linking to its official brand assets.
2. After triage, open a PR that adds:
   - `icons/<id>/icon.json` — metadata + display spec
   - `icons/<id>/brand/<name>.svg` — brand variant (color)
   - `icons/<id>/solid/<name>.svg` — solid variant (single-color glyph)
3. Run `pnpm icons:build` from the repo root and commit the regenerated files
   (`apps/web/src/lib/icons.generated.ts`, `apps/web/public/{brand,solid}/*.svg`,
   `apps/web/public/api/icons.json`, `icons/manifest.json`).
4. Run `pnpm --filter web dev` and visually confirm `/dashboard` and
   `/icon/<id>` look right.
5. Optimize SVGs (`pnpm svgo` or [svgomg](https://jakearchibald.github.io/svgomg/)) — keep file size < 4 KB where possible. Use a `viewBox`, no inline
   `width`/`height`, no embedded raster images.

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
