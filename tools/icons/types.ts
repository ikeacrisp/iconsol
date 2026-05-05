/**
 * Per-icon source-of-truth schema.
 *
 * Each logo lives at `icons/<id>/icon.json` (canonical id = website id).
 * SVG layer files live at their original paths under
 * `apps/web/public/{brand,solid}/<basename>.svg` — the layer `src` here is
 * the basename only and the build script resolves it to the full URL.
 *
 * The display.brand / display.solid spec is the same compositional model the
 * runtime BrandLogo component already uses (background, radius, layers with
 * x/y/width/height, optional rotation and masks). It is preserved verbatim
 * during migration, so rendered output is byte-identical.
 */

export type IconCategory =
  | "tokens"
  | "defi"
  | "wallets"
  | "nft"
  | "infrastructure";

export interface Contributor {
  github?: string;
  name?: string;
  avatar?: string;
}

export interface DisplayLayer {
  /** Basename within icons/<id>/<variant>/ — e.g. "sol.svg" or "solflare-fill.svg" */
  src: string;
  width: number;
  height: number;
  x: number;
  y: number;
  rotation?: number;
  /** Basenames of mask files in the same variant directory */
  maskSrcs?: string[];
  maskPositions?: string;
  maskSizes?: string;
}

export interface DisplaySpec {
  /** CSS background (color or gradient) painted behind layers */
  background?: string;
  /** Border-radius in 32-unit base coordinates */
  radius?: number;
  layers: DisplayLayer[];
}

export interface IconRecord {
  id: string;
  name: string;
  ticker?: string;
  category: IconCategory;
  aliases: string[];
  tags: string[];
  website?: string;
  twitter?: string;
  github?: string;
  mintAddress?: string;
  description?: string;
  relatedIds?: string[];
  contributors?: Contributor[];
  /** Curated dashboard sort key (lower = earlier). Optional; defaults to alphabetical. */
  displayOrder?: number;
  /**
   * Display spec for each variant. If a variant is omitted, the icon is
   * data-only (powers the npm package or third-party API but does not render
   * on the website).
   */
  display?: {
    brand?: DisplaySpec;
    solid?: DisplaySpec;
  };
}
