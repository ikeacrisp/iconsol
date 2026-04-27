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

/**
 * A contributor entry for an icon. Order is newest → oldest, so the first
 * entry renders on the left and on top of older contributors.
 *
 * - `github` is a GitHub username — when present, the avatar links to that
 *   profile and (unless overridden by `avatar`) loads from github.com.
 * - `name` is the display name shown in the tooltip; falls back to `github`.
 * - `avatar` overrides the avatar URL (use this for non-GitHub entities like
 *   organizations that should appear without a profile link).
 */
export interface Contributor {
  github?: string;
  name?: string;
  avatar?: string;
}

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
  contributors?: Contributor[];
  /** Relative URL under /icons/ for <img> use */
  src: string;
  hasLocalFile: boolean;
  fileType: "svg" | "png" | null;
}

/**
 * Default attribution applied when an icon has no manifest-level
 * `contributors` field. Newest-first ordering: ikeacrisp (latest contributor,
 * left/on top) → Juicebox (original contributor, right/behind, no link).
 */
export const DEFAULT_CONTRIBUTORS: Contributor[] = [
  { github: "ikeacrisp", avatar: "/ui/contributor-1.png" },
  { name: "Juicebox", avatar: "/ui/contributor-2.png" },
];

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
