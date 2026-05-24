# iconsol

React components for the [iconsol.me](https://iconsol.me) directory of Solana ecosystem logos and icons.

```bash
npm i @iconsol/react
```

```tsx
import { Phantom, Jup, Sol } from "@iconsol/react";

export function Brands() {
  return (
    <div style={{ display: "flex", gap: 12 }}>
      <Phantom size={32} />
      <Jup size={32} />
      <Sol size={32} />
    </div>
  );
}
```

Every component accepts the standard `SVGProps<SVGSVGElement>` plus a `size` prop (number or string, default `24`). All other SVG props pass through, so you can style with `className`, `style`, `onClick`, etc.

```tsx
<Phantom size={48} className="logo" aria-label="Phantom" />
```

## Tree-shaking

The package is ESM-first and ships with `sideEffects: false`. Importing one icon by name pulls only that icon's JSX into your bundle when you use a modern bundler (Vite, esbuild, webpack 5, Rollup, Next.js).

## Companion endpoints

Beyond the React components, iconsol also publishes:

- **[iconsol.me](https://iconsol.me)** — browse and copy any logo as React, React Native, Swift, HTML, or SVG.
- **[iconsol.me/llms.txt](https://iconsol.me/llms.txt)** — the full catalog as plain text for LLMs and agents.
- **[iconsol.me/api/logos](https://iconsol.me/api/logos)** — JSON catalog (supports `?q=` and `?category=`).
- **[iconsol.me/api/mcp](https://iconsol.me/api/mcp)** — Streamable HTTP MCP server. Drop into Cursor or Claude Code:

  ```json
  {
    "mcpServers": {
      "iconsol": { "url": "https://iconsol.me/api/mcp" }
    }
  }
  ```

## Trademark notice

The brand marks in this package are the property of their respective owners and are included for identification and interoperability. If you represent a project whose logo appears here and want it changed or removed, open an issue at <https://github.com/ikeacrisp/iconsol/issues> with the `removal-request` label.

## License

[MIT](./LICENSE)
