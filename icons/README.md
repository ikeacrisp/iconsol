# `icons/` — source of truth for every logo

Each logo lives in its own folder. Adding or updating a logo means editing
**one folder** and running one script.

```
icons/
  <id>/
    icon.json              required — metadata + display spec
    brand/                 brand-variant SVGs (color, gradient, full-fidelity)
      <name>.svg
    solid/                 solid-variant SVGs (single-color glyph)
      <name>.svg
  _aux/                    auxiliary SVGs not tied to a single logo
  _order.txt               curated dashboard order (one id per line)
  manifest.json            auto-generated — do not edit
```

The repo also contains legacy category directories (`tokens/`, `defi/`,
`wallets/`, `nft/`, `infrastructure/`) that feed the npm `iconsol` React
package. Leave them alone unless you're adding a brand-new SVG for the
generator to wrap.

## Adding a logo

1. Create `icons/<id>/icon.json`. Use kebab-case for `<id>` (e.g.
   `drift`, `magic-eden`, `usd-prime`).
2. Drop SVGs into `icons/<id>/brand/<name>.svg` and `icons/<id>/solid/<name>.svg`.
3. Run `pnpm icons:build` from the repo root.
4. `pnpm --filter web dev` and confirm the logo renders on `/dashboard` and
   `/icon/<id>`.
5. Commit the whole `icons/<id>/` folder *plus* the regenerated
   `apps/web/src/lib/icons.generated.ts`, `apps/web/public/{brand,solid}/*.svg`,
   `apps/web/public/api/icons.json`, and `icons/manifest.json`.

CI runs `pnpm icons:build` and fails if any of the regenerated files differ
from what was committed — so you can't forget to run it.

## `icon.json` schema

```jsonc
{
  "id": "jupiter",                  // must match the folder name
  "name": "Jupiter",                // display name
  "ticker": "JUP",                  // optional, for tokens
  "category": "tokens",             // tokens | defi | wallets | nft | infrastructure
  "aliases": ["jupiter", "jup.ag"], // search aliases
  "tags": ["dex", "aggregator"],    // free-form tags
  "website": "https://jup.ag",
  "twitter": "JupiterExchange",     // handle without @ (optional)
  "github": "jup-ag",               // org/user (optional)
  "mintAddress": "JUPy...",         // SPL mint, tokens only
  "description": "Jupiter is …",
  "relatedIds": ["sol", "jupsol"],  // shown as "Commonly used with"
  "contributors": [                 // optional; defaults to project defaults
    { "github": "ikeacrisp" }
  ],
  "displayOrder": 3,                // optional; lower sorts earlier on dashboard

  "display": {                      // optional. Omit for data-only entries.
    "brand": {
      "background": "#ffef46",      // optional CSS color or gradient
      "radius": 8,                  // optional border-radius (32-unit base)
      "layers": [
        {
          "src": "main.svg",        // basename within icons/<id>/brand/
          "x": 0, "y": 0, "width": 32, "height": 32
        }
      ]
    },
    "solid": { "layers": [ { "src": "main.svg", "x": 0, "y": 0, "width": 32, "height": 32 } ] }
  }
}
```

### Display spec

The display spec is a **compositional** model — most logos only need a
single full-bleed layer (`x: 0, y: 0, width: 32, height: 32`), but logos
with a tile background, inset padding, rotation, or alpha masks are
supported.

| Field                       | Notes                                                |
|----------------------------|------------------------------------------------------|
| `background`                | CSS color or gradient painted behind the layers.     |
| `radius`                    | Border-radius. Coordinate space is 32-unit-square.   |
| `layers[].src`              | Basename of an SVG in `icons/<id>/<variant>/`.       |
| `layers[].{x,y,width,height}` | Position + size in 32-unit base coordinates.       |
| `layers[].rotation`         | Degrees, optional.                                   |
| `layers[].maskSrcs`         | Array of mask SVG basenames (alpha mask).            |
| `layers[].maskPositions`    | CSS `mask-position`, optional.                       |
| `layers[].maskSizes`        | CSS `mask-size`, optional.                           |

### Data-only entries

Logos in the npm React package but not on the website (e.g. PNG-only
tokens, projects without curated brand artwork) omit the `display` field
entirely. They still get an `icon.json` so search/categorization works.

## SVG quality bar

- Use a `viewBox`, no inline `width` / `height`.
- No embedded raster images (PNG/JPEG inside `<image>` tags).
- Single root `<svg>`. No XML prolog, no comments, no metadata.
- Optimize with `pnpm svgo` or [svgomg](https://jakearchibald.github.io/svgomg/) — file size under 4 KB where reasonable.
- For solid variants, use `currentColor` so the glyph inherits the surrounding text color.

## Scripts

| Command                   | Purpose                                                     |
|--------------------------|-------------------------------------------------------------|
| `pnpm icons:build`       | Regenerate everything from `icons/<id>/icon.json`.          |
| `pnpm --filter web dev`  | Run the website at `localhost:3030` (or autoport).          |
| `pnpm --filter web build`| Production build (auto-runs `icons:build` first).           |

## Removing a logo

If you're a rights-holder requesting removal, see
[CONTRIBUTING.md](../CONTRIBUTING.md#3-submit-a-trademark-removal-request).
For maintainers: delete `icons/<id>/`, remove the id from `icons/_order.txt`
if listed, and run `pnpm icons:build`.
