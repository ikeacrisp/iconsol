// Icon manifest type
export interface IconEntry {
  id: string;
  name: string;
  ticker?: string;
  category: "tokens" | "defi" | "wallets" | "nft" | "infrastructure";
  aliases?: string[];
  tags?: string[];
  mintAddress?: string;
  website?: string;
}
