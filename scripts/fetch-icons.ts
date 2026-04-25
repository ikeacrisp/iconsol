/**
 * fetch-icons.ts
 *
 * Fetches SVG/PNG logos for Solana ecosystem tokens and protocols.
 * Sources:
 *   1. Jupiter Token API V2 — for SPL token logos
 *   2. solana-labs/token-list GitHub — fallback raw CDN
 *   3. Coingecko — fallback for popular tokens
 *
 * Run: pnpm fetch-icons
 */

import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const ICONS_DIR = path.join(ROOT, "icons");

interface ManifestEntry {
  id: string;
  name: string;
  category: string;
  mintAddress?: string;
  aliases?: string[];
  tags?: string[];
}

interface JupiterToken {
  address: string;
  symbol: string;
  name: string;
  logoURI?: string;
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    headers: { "User-Agent": "solana-icons-fetcher/1.0" },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.json() as Promise<T>;
}

async function downloadFile(url: string, dest: string): Promise<boolean> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "solana-icons-fetcher/1.0" },
    });
    if (!res.ok) return false;
    const buffer = Buffer.from(await res.arrayBuffer());
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.writeFileSync(dest, buffer);
    return true;
  } catch {
    return false;
  }
}

async function fetchJupiterTokenMap(): Promise<Map<string, JupiterToken>> {
  console.log("📡 Fetching Jupiter token list...");
  try {
    // Jupiter token list — all validated tokens
    const tokens = await fetchJson<JupiterToken[]>(
      "https://token.jup.ag/all"
    );
    const map = new Map<string, JupiterToken>();
    for (const t of tokens) {
      map.set(t.address, t);
    }
    console.log(`   Found ${map.size} tokens in Jupiter list`);
    return map;
  } catch (e) {
    console.warn("   ⚠️  Jupiter API failed, continuing without it:", e);
    return new Map();
  }
}

async function processTokenIcon(
  entry: ManifestEntry,
  jupiterMap: Map<string, JupiterToken>
): Promise<void> {
  const destDir = path.join(ICONS_DIR, entry.category);
  const svgDest = path.join(destDir, `${entry.id}.svg`);
  const pngDest = path.join(destDir, `${entry.id}.png`);

  // Skip if already downloaded
  if (fs.existsSync(svgDest) || fs.existsSync(pngDest)) {
    console.log(`   ✓ ${entry.id} — already exists`);
    return;
  }

  if (!entry.mintAddress) return;

  const token = jupiterMap.get(entry.mintAddress);
  if (token?.logoURI) {
    const logoUrl = token.logoURI;
    const isSvg = logoUrl.toLowerCase().includes(".svg");
    const dest = isSvg ? svgDest : pngDest;

    const ok = await downloadFile(logoUrl, dest);
    if (ok) {
      console.log(`   ✓ ${entry.id} — downloaded from Jupiter (${isSvg ? "SVG" : "PNG"})`);
      return;
    }
  }

  // Fallback: solana-labs/token-list CDN
  const fallbackBase = `https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/${entry.mintAddress}`;
  for (const ext of ["logo.svg", "logo.png"]) {
    const url = `${fallbackBase}/${ext}`;
    const dest = ext.endsWith(".svg") ? svgDest : pngDest;
    const ok = await downloadFile(url, dest);
    if (ok) {
      console.log(`   ✓ ${entry.id} — downloaded from solana-labs CDN (${ext})`);
      return;
    }
  }

  console.log(`   ✗ ${entry.id} — not found, needs manual addition`);
}

async function main() {
  console.log("\n🌟 Solana Icons Fetcher\n");

  const manifestPath = path.join(ICONS_DIR, "manifest.json");
  const manifest: ManifestEntry[] = JSON.parse(
    fs.readFileSync(manifestPath, "utf8")
  );

  const tokenEntries = manifest.filter((e) => e.mintAddress);
  const protocolEntries = manifest.filter((e) => !e.mintAddress);

  // Fetch Jupiter token map once
  const jupiterMap = await fetchJupiterTokenMap();

  // Process tokens
  console.log(`\n🪙 Fetching ${tokenEntries.length} token icons...`);
  for (const entry of tokenEntries) {
    await processTokenIcon(entry, jupiterMap);
  }

  // Protocol logos need manual addition — log instructions
  console.log(`\n🏗️  Protocol logos (${protocolEntries.length} entries) need manual SVG addition:`);
  for (const entry of protocolEntries) {
    const destDir = path.join(ICONS_DIR, entry.category);
    const svgDest = path.join(destDir, `${entry.id}.svg`);
    if (!fs.existsSync(svgDest)) {
      console.log(`   → icons/${entry.category}/${entry.id}.svg  (${entry.website ?? ""})`);
    } else {
      console.log(`   ✓ ${entry.id} — exists`);
    }
  }

  console.log("\n✅ Done! Run `pnpm generate` to build React components.\n");
}

main().catch(console.error);
