/**
 * Server-only icon directory. Sources data from the build-time generated
 * module (`icons.generated.ts`), which is itself produced from
 * icons/<id>/icon.json.
 */
import "server-only";

import {
  BRAND_LOGO_ASSETS,
  ICON_META,
  LOGO_ORDER,
  type LogoId,
} from "./icons.generated";
import { DEFAULT_CONTRIBUTORS, type Icon } from "./icon-data";

export type { Contributor, Icon, IconCategory } from "./icon-data";
export { CATEGORIES, CATEGORY_COLORS, DEFAULT_CONTRIBUTORS } from "./icon-data";

function buildIcon(id: LogoId): Icon {
  const meta = ICON_META[id];
  if (!meta) {
    throw new Error(`No metadata for icon "${id}" in icons.generated.ts`);
  }
  const brandSpec = BRAND_LOGO_ASSETS[id];
  return {
    id,
    name: meta.name,
    ticker: meta.ticker,
    category: meta.category,
    aliases: meta.aliases,
    tags: meta.tags,
    mintAddress: meta.mintAddress,
    website: meta.website,
    description: meta.description,
    relatedIds: meta.relatedIds,
    contributors: meta.contributors ?? DEFAULT_CONTRIBUTORS,
    src: brandSpec?.layers[0]?.src ?? "",
    hasLocalFile: true,
    fileType: "svg",
  };
}

const ALL_ICONS: Icon[] = LOGO_ORDER.map(buildIcon);

export function getAllIcons(): Icon[] {
  return ALL_ICONS;
}

export function getIconById(id: string): Icon | undefined {
  return ALL_ICONS.find((icon) => icon.id === id);
}
