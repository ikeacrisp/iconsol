# iconsol

A curated directory of high-quality logos and icons for the Solana ecosystem — tokens, DeFi protocols, wallets, NFT platforms, and infrastructure.

Live at **[iconsol.me](https://iconsol.me)**.

- Browse and download SVG/PNG
- Copy as a React, Vue, or Svelte component
- Soon: `npm i iconsol` for direct React imports
- MCP endpoint for AI agents at `/api/mcp`

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
