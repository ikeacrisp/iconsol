/**
 * Server-only icon utilities. Uses imported manifest metadata plus the exact
 * logo asset set that powers the dashboard/icon detail UIs.
 */
import "server-only";

import manifest from "../../../../icons/manifest.json";
import type { Icon, IconCategory } from "./icon-data";
import {
  BRAND_LOGO_ASSETS,
  LOGO_ORDER,
  META_OVERRIDES,
  META_SOURCE_IDS,
  type LogoId,
} from "./logo-assets";

export type { Icon, IconCategory } from "./icon-data";
export { CATEGORIES, CATEGORY_COLORS } from "./icon-data";

type ManifestIcon = {
  id: string;
  name: string;
  ticker?: string;
  category: IconCategory;
  aliases: string[];
  tags: string[];
  mintAddress?: string;
  website?: string;
  description?: string;
  relatedIds?: string[];
};

const MANIFEST_BY_ID = new Map<string, ManifestIcon>(
  (manifest as ManifestIcon[]).map((entry) => [entry.id, entry])
);

function buildIcon(id: LogoId): Icon {
  const sourceId = META_SOURCE_IDS[id] ?? id;
  const base = MANIFEST_BY_ID.get(sourceId);
  const override = META_OVERRIDES[id];

  const fallbackName =
    id === "usd-prime"
      ? "USD Prime"
      : id === "usd-star"
        ? "USD STAR"
        : id === "powered-by-solana"
          ? "Powered by Solana"
          : id === "sanctum-gateway"
            ? "Sanctum Gateway"
            : id === "helius-orb"
              ? "Helius Orb"
              : id.replace(/-/g, " ");

  return {
    id,
    name: override?.name ?? base?.name ?? fallbackName,
    ticker: override?.ticker ?? base?.ticker,
    category: override?.category ?? base?.category ?? "infrastructure",
    aliases: override?.aliases ?? base?.aliases ?? [id],
    tags: override?.tags ?? base?.tags ?? ["brand-logo"],
    mintAddress: base?.mintAddress,
    website: override?.website ?? base?.website,
    description: override?.description ?? base?.description,
    relatedIds: override?.relatedIds ?? base?.relatedIds,
    src: BRAND_LOGO_ASSETS[id].layers[0]?.src ?? "",
    hasLocalFile: true,
    fileType: "svg",
  };
}

const ALL_ICONS = LOGO_ORDER.map(buildIcon);

export function getAllIcons(): Icon[] {
  return ALL_ICONS;
}

export function getIconById(id: string): Icon | undefined {
  return ALL_ICONS.find((icon) => icon.id === id);
}
