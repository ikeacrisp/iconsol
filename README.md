# iconsol

A curated directory of Solana ecosystem logos — tokens, DeFi protocols, wallets, NFT platforms, and infrastructure.

Live at **[iconsol.me](https://iconsol.me)**.

- Browse and download SVG (PNG fallback where applicable)
- Copy any logo as React, React Native, Swift, HTML, or SVG
- Full catalog as plain text at [`/llms.txt`](https://iconsol.me/llms.txt)
- JSON catalog at [`/api/logos`](https://iconsol.me/api/logos) and per-logo at `/api/logos/{id}`
- MCP endpoint for agents at [`/api/mcp`](https://iconsol.me/api/mcp) — tools: `search_logos`, `get_logo`

## Repository

```
apps/web/         Next.js 15 web app (the iconsol.me site)
packages/react/   Future @iconsol/react component package
icons/            Source-of-truth icon assets + manifest
scripts/          Build helpers (manifest generation, copy, fetch)
```

## Local development

Requires Node 20+ and `pnpm` 9+.

```bash
pnpm install
pnpm --filter web dev      # http://localhost:3030
pnpm --filter web build
pnpm --filter web lint
```

## Contributing

Want to add a logo, fix a typo, or improve the site? See **[CONTRIBUTING.md](./CONTRIBUTING.md)**.

For trademark holders requesting removal of a logo, open an issue with the `removal-request` label and we will action within 7 days.

## Reporting security issues

Please **do not** open public issues for security vulnerabilities. See **[SECURITY.md](./SECURITY.md)** for the disclosure process.

## License

[MIT](./LICENSE). Brand logos belong to their respective owners — see LICENSE for details.
