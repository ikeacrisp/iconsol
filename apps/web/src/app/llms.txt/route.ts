import { type NextRequest } from "next/server";
import { getAllIcons } from "@/lib/icons";
import { ICON_COUNT } from "@/lib/icon-count";

const HEADERS = {
  "Content-Type": "text/plain; charset=utf-8",
  "Cache-Control": "public, max-age=300, s-maxage=3600",
  "Access-Control-Allow-Origin": "*",
};

function abs(origin: string, src: string) {
  if (!src) return src;
  return src.startsWith("http") ? src : `${origin}${src}`;
}

export function GET(request: NextRequest) {
  const { origin } = new URL(request.url);
  const icons = getAllIcons();

  const byCategory = new Map<string, typeof icons>();
  for (const icon of icons) {
    const list = byCategory.get(icon.category) ?? [];
    list.push(icon);
    byCategory.set(icon.category, list);
  }

  const categoryOrder = ["tokens", "defi", "wallets", "nft", "infrastructure"];
  const categoryLabel: Record<string, string> = {
    tokens: "Tokens",
    defi: "DeFi",
    wallets: "Wallets",
    nft: "NFT",
    infrastructure: "Infrastructure",
  };

  const lines: string[] = [];

  lines.push("# iconsol");
  lines.push("");
  lines.push(
    `> A curated directory of ${ICON_COUNT} Solana ecosystem logos and icons. Each entry includes a name, ticker, category, mint address (when applicable), website, and a direct SVG URL.`
  );
  lines.push("");
  lines.push(
    "iconsol is a free, MIT-licensed catalog. All icons are served as SVG (with PNG fallbacks where applicable) under stable URLs that can be hot-linked or downloaded."
  );
  lines.push("");

  lines.push("## For agents");
  lines.push("");
  lines.push(
    `- [JSON catalog](${origin}/api/logos): Full directory as JSON. Supports \`?q=<query>\` and \`?category=<tokens|defi|wallets|nft|infrastructure>\`.`
  );
  lines.push(
    `- [Single logo as JSON](${origin}/api/logos/{id}): Returns one icon by id (e.g. \`/api/logos/jup\`).`
  );
  lines.push(
    `- [MCP endpoint](${origin}/api/mcp): Streamable HTTP MCP server. Tools: \`search_logos(query?, category?)\`, \`get_logo(id)\`. Drop into Cursor or Claude Code as \`{ "mcpServers": { "iconsol": { "url": "${origin}/api/mcp" } } }\`.`
  );
  lines.push("");

  lines.push("## Catalog");
  lines.push("");
  lines.push(
    "Format: `<id>` — `<name>` (`<ticker>`) · category · mint · website · svg"
  );
  lines.push("");

  for (const cat of categoryOrder) {
    const list = byCategory.get(cat);
    if (!list?.length) continue;
    lines.push(`### ${categoryLabel[cat]}`);
    lines.push("");
    for (const icon of list) {
      const parts = [`- \`${icon.id}\` — ${icon.name}`];
      if (icon.ticker) parts[0] += ` (${icon.ticker})`;
      const meta: string[] = [];
      if (icon.mintAddress) meta.push(`mint: \`${icon.mintAddress}\``);
      if (icon.website) meta.push(`site: ${icon.website}`);
      if (icon.src) meta.push(`svg: ${abs(origin, icon.src)}`);
      if (meta.length) parts.push(meta.join(" · "));
      lines.push(parts.join(" · "));
    }
    lines.push("");
  }

  lines.push("## Optional");
  lines.push("");
  lines.push(`- [Browse the directory](${origin}/dashboard)`);
  lines.push(`- [GitHub](https://github.com/ikeacrisp/iconsol)`);
  lines.push("");

  return new Response(lines.join("\n"), { headers: HEADERS });
}
