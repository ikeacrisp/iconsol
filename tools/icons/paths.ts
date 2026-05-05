import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));

/** Repo root */
export const ROOT = path.resolve(here, "..", "..");

/** Per-icon source folders live here: icons/<id>/icon.json + icons/<id>/{brand,solid}/*.svg */
export const ICONS_SRC = path.join(ROOT, "icons");

/** Where the website serves brand/solid SVGs from */
export const WEB_PUBLIC = path.join(ROOT, "apps", "web", "public");

/** Generated module that BrandLogo / IconDetail / etc. import */
export const LOGO_ASSETS_TS = path.join(
  ROOT,
  "apps",
  "web",
  "src",
  "lib",
  "logo-assets.ts"
);

/** Curated dashboard order (one id per line) */
export const ORDER_FILE = path.join(ICONS_SRC, "_order.txt");

/** Files outside any single icon (e.g. solana-card.svg, phantom-white.svg) */
export const AUX_DIR = path.join(ICONS_SRC, "_aux");

/** Public third-party API endpoint */
export const PUBLIC_API_JSON = path.join(
  WEB_PUBLIC,
  "api",
  "icons.json"
);

/** Legacy npm-package manifest — regenerated for backward compat */
export const LEGACY_MANIFEST = path.join(ICONS_SRC, "manifest.json");

export const VARIANTS = ["brand", "solid"] as const;
export type Variant = (typeof VARIANTS)[number];
