/**
 * Client-safe icon metadata — no Node.js imports.
 * Used by both server and client components.
 */

export type IconCategory =
  | "tokens"
  | "defi"
  | "wallets"
  | "nft"
  | "infrastructure";

export interface Icon {
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
  /** Relative URL under /icons/ for <img> use */
  src: string;
  hasLocalFile: boolean;
  fileType: "svg" | "png" | null;
}

export const CATEGORIES: { value: IconCategory | "all"; label: string }[] = [
  { value: "all", label: "All Logo’s" },
  { value: "tokens", label: "Tokens" },
  { value: "defi", label: "DeFi" },
  { value: "wallets", label: "Wallets" },
  { value: "nft", label: "NFT" },
  { value: "infrastructure", label: "Infra" },
];

export const CATEGORY_COLORS: Record<IconCategory, string> = {
  tokens: "#14f195",
  defi: "#9945ff",
  wallets: "#00c2ff",
  nft: "#ff6b6b",
  infrastructure: "#ffd700",
};
