import type { Icon, IconCategory } from "./icon-data";

export type SearchOptions = {
  query?: string;
  category?: IconCategory | "all";
};

export function searchIcons(icons: Icon[], options: SearchOptions = {}): Icon[] {
  const { query, category = "all" } = options;
  const normalized = query?.toLowerCase().trim() ?? "";

  return icons.filter((icon) => {
    if (category !== "all" && icon.category !== category) return false;
    if (!normalized) return true;

    return (
      icon.name.toLowerCase().includes(normalized) ||
      icon.id.toLowerCase().includes(normalized) ||
      (icon.ticker?.toLowerCase().includes(normalized) ?? false) ||
      icon.aliases.some((alias) => alias.toLowerCase().includes(normalized)) ||
      icon.tags.some((tag) => tag.toLowerCase().includes(normalized))
    );
  });
}
