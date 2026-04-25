/**
 * copy-icons-to-public.ts
 * Copies icon files from icons/ into apps/web/public/icons/
 * so Next.js can serve them as static assets.
 *
 * Run: pnpm copy-icons  (or runs automatically before next build)
 */

import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const ICONS_SRC = path.join(ROOT, "icons");
const ICONS_DEST = path.join(ROOT, "apps", "web", "public", "icons");

const CATEGORIES = ["tokens", "defi", "wallets", "nft", "infrastructure"];

let copied = 0;

for (const cat of CATEGORIES) {
  const srcDir = path.join(ICONS_SRC, cat);
  const destDir = path.join(ICONS_DEST, cat);

  if (!fs.existsSync(srcDir)) continue;
  fs.mkdirSync(destDir, { recursive: true });

  for (const file of fs.readdirSync(srcDir)) {
    if (!/\.(svg|png|jpg|webp)$/.test(file)) continue;
    fs.copyFileSync(path.join(srcDir, file), path.join(destDir, file));
    copied++;
  }
}

console.log(`✅ Copied ${copied} icon files to public/icons/`);
