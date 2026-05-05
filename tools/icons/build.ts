/**
 * Reads icons/<id>/icon.json + icons/<id>/{brand,solid}/*.svg and produces:
 *
 *   apps/web/src/lib/icons.generated.ts   → typed data module imported by
 *                                            the hand-written logo-assets.ts
 *   apps/web/public/{brand,solid}/*.svg   → flat copies for the website to
 *                                            serve at the same URLs as before
 *   apps/web/public/api/icons.json        → public third-party API
 *   icons/manifest.json                   → legacy npm-package manifest
 *                                            (consumed by scripts/generate-components.ts)
 *
 * Idempotent: running it twice is a no-op (writes are skipped if the target
 * already matches).
 *
 * Run:  pnpm icons:build
 */

import fs from "node:fs";
import path from "node:path";
import {
  AUX_DIR,
  ICONS_SRC,
  LEGACY_MANIFEST,
  PUBLIC_API_JSON,
  VARIANTS,
  WEB_PUBLIC,
  type Variant,
} from "./paths";
import { loadAllIcons, type LoadedIcon } from "./load";
import type { DisplayLayer, DisplaySpec, IconRecord } from "./types";

function ensureDir(p: string) {
  fs.mkdirSync(p, { recursive: true });
}

function writeIfChanged(file: string, contents: string | Buffer) {
  ensureDir(path.dirname(file));
  if (fs.existsSync(file)) {
    const existing = fs.readFileSync(file);
    const next = Buffer.isBuffer(contents) ? contents : Buffer.from(contents);
    if (existing.equals(next)) return false;
  }
  fs.writeFileSync(file, contents);
  return true;
}

/* ── public asset sync ────────────────────────────────────────────────── */

function syncPublicAssets(icons: LoadedIcon[]) {
  let copied = 0;
  let auxCopied = 0;

  for (const variant of VARIANTS) {
    const destDir = path.join(WEB_PUBLIC, variant);
    ensureDir(destDir);

    for (const { record, dir } of icons) {
      const srcDir = path.join(dir, variant);
      if (!fs.existsSync(srcDir)) continue;
      for (const file of fs.readdirSync(srcDir)) {
        if (!file.endsWith(".svg")) continue;
        const from = path.join(srcDir, file);
        const to = path.join(destDir, file);
        if (writeIfChanged(to, fs.readFileSync(from))) copied++;
      }
    }

    const auxVariantDir = path.join(AUX_DIR, variant);
    if (fs.existsSync(auxVariantDir)) {
      for (const file of fs.readdirSync(auxVariantDir)) {
        if (!file.endsWith(".svg")) continue;
        const from = path.join(auxVariantDir, file);
        const to = path.join(destDir, file);
        if (writeIfChanged(to, fs.readFileSync(from))) auxCopied++;
      }
    }
  }

  if (copied || auxCopied) {
    console.log(
      `  synced ${copied} icon asset(s) and ${auxCopied} auxiliary asset(s) to public/`
    );
  }
}

/* ── icons.generated.ts ───────────────────────────────────────────────── */

function quoteId(id: string): string {
  return /^[a-z][a-z0-9]*$/i.test(id) ? id : JSON.stringify(id);
}

function variantUrl(variant: Variant, file: string): string {
  return `/${variant}/${file}`;
}

function layerToSource(variant: Variant, layer: DisplayLayer): string {
  const parts: string[] = [];
  parts.push(`src: ${JSON.stringify(variantUrl(variant, layer.src))}`);
  parts.push(`x: ${layer.x}`);
  parts.push(`y: ${layer.y}`);
  parts.push(`width: ${layer.width}`);
  parts.push(`height: ${layer.height}`);
  if (layer.rotation !== undefined) parts.push(`rotation: ${layer.rotation}`);
  if (layer.maskSrcs) {
    const urls = layer.maskSrcs.map((m) => JSON.stringify(variantUrl(variant, m)));
    parts.push(`maskSrcs: [${urls.join(", ")}]`);
  }
  if (layer.maskPositions !== undefined) {
    parts.push(`maskPositions: ${JSON.stringify(layer.maskPositions)}`);
  }
  if (layer.maskSizes !== undefined) {
    parts.push(`maskSizes: ${JSON.stringify(layer.maskSizes)}`);
  }
  return `{ ${parts.join(", ")} }`;
}

function specToSource(variant: Variant, spec: DisplaySpec): string {
  const parts: string[] = [];
  if (spec.background !== undefined) {
    parts.push(`    background: ${JSON.stringify(spec.background)},`);
  }
  if (spec.radius !== undefined) {
    parts.push(`    radius: ${spec.radius},`);
  }
  const layerLines = spec.layers.map((l) => `      ${layerToSource(variant, l)},`);
  parts.push(`    layers: [\n${layerLines.join("\n")}\n    ],`);
  return `{\n${parts.join("\n")}\n  }`;
}

function generateIconsModule(icons: LoadedIcon[]): string {
  const webLogos = icons.filter((x) => x.record.display);

  const idUnion = webLogos
    .map((x) => `  | ${JSON.stringify(x.record.id)}`)
    .join("\n");

  const orderLines = webLogos
    .map((x) => `  ${JSON.stringify(x.record.id)},`)
    .join("\n");

  const brandEntries: string[] = [];
  const solidEntries: string[] = [];
  for (const { record } of webLogos) {
    const key = quoteId(record.id);
    if (record.display?.brand) {
      brandEntries.push(`  ${key}: ${specToSource("brand", record.display.brand)},`);
    }
    if (record.display?.solid) {
      solidEntries.push(`  ${key}: ${specToSource("solid", record.display.solid)},`);
    }
  }

  const metaEntries = icons.map(({ record }) => {
    const meta = stripDisplay(record);
    const key = quoteId(record.id);
    return `  ${key}: ${JSON.stringify(meta, null, 2).replace(/\n/g, "\n  ")},`;
  });

  return `/* eslint-disable */
// AUTO-GENERATED by tools/icons/build.ts — DO NOT EDIT.
// Source of truth: icons/<id>/icon.json. Run \`pnpm icons:build\` to regenerate.

import type { IconCategory, Contributor } from "./icon-data";

export type LogoId =
${idUnion};

export interface LogoAssetLayer {
  src: string;
  width: number;
  height: number;
  x: number;
  y: number;
  rotation?: number;
  maskSrcs?: string[];
  maskPositions?: string;
  maskSizes?: string;
}

export interface LogoAssetSpec {
  background?: string;
  radius?: number;
  layers: LogoAssetLayer[];
}

export type LogoVariant = "brand" | "solid";

export const LOGO_ORDER: LogoId[] = [
${orderLines}
];

export const BRAND_LOGO_ASSETS: Record<LogoId, LogoAssetSpec> = {
${brandEntries.join("\n")}
};

export const SOLID_LOGO_ASSETS: Record<LogoId, LogoAssetSpec> = {
${solidEntries.join("\n")}
};

export interface IconMeta {
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
  hasDisplay: boolean;
}

export const ICON_META: Record<string, IconMeta> = {
${metaEntries.join("\n")}
};
`;
}

function stripDisplay(record: IconRecord): Record<string, unknown> {
  const { display, displayOrder, ...rest } = record;
  return { ...rest, hasDisplay: Boolean(display) };
}

/* ── legacy manifest.json ─────────────────────────────────────────────── */

function generateLegacyManifest(icons: LoadedIcon[]): string {
  const entries = icons.map(({ record }) => {
    const out: Record<string, unknown> = {
      id: record.id,
      name: record.name,
      category: record.category,
    };
    if (record.ticker) out.ticker = record.ticker;
    out.aliases = record.aliases;
    out.tags = record.tags;
    if (record.mintAddress) out.mintAddress = record.mintAddress;
    if (record.website) out.website = record.website;
    if (record.description) out.description = record.description;
    if (record.relatedIds) out.relatedIds = record.relatedIds;
    if (record.contributors) out.contributors = record.contributors;
    return out;
  });
  return JSON.stringify(entries, null, 2) + "\n";
}

/* ── public api ───────────────────────────────────────────────────────── */

function generatePublicApi(icons: LoadedIcon[]): string {
  const payload = {
    version: 1,
    generatedAt: new Date().toISOString().slice(0, 10),
    count: icons.length,
    icons: icons.map(({ record }) => ({
      id: record.id,
      name: record.name,
      ticker: record.ticker,
      category: record.category,
      aliases: record.aliases,
      tags: record.tags,
      website: record.website,
      twitter: record.twitter,
      github: record.github,
      mintAddress: record.mintAddress,
      description: record.description,
      relatedIds: record.relatedIds,
      assets: record.display
        ? {
            brand: record.display.brand
              ? `/brand/${record.display.brand.layers[0]?.src}`
              : undefined,
            solid: record.display.solid
              ? `/solid/${record.display.solid.layers[0]?.src}`
              : undefined,
          }
        : undefined,
    })),
  };
  return JSON.stringify(payload, null, 2) + "\n";
}

/* ── main ─────────────────────────────────────────────────────────────── */

const GENERATED_MODULE = path.join(
  WEB_PUBLIC,
  "..",
  "src",
  "lib",
  "icons.generated.ts"
);

function main() {
  console.log("\nBuilding icons...\n");
  const { all } = loadAllIcons();
  console.log(`  loaded ${all.length} icon record(s)`);

  syncPublicAssets(all);

  if (writeIfChanged(GENERATED_MODULE, generateIconsModule(all))) {
    console.log("  wrote apps/web/src/lib/icons.generated.ts");
  }
  if (writeIfChanged(LEGACY_MANIFEST, generateLegacyManifest(all))) {
    console.log("  wrote icons/manifest.json");
  }
  if (writeIfChanged(PUBLIC_API_JSON, generatePublicApi(all))) {
    console.log("  wrote apps/web/public/api/icons.json");
  }

  console.log("\nDone.\n");
}

main();
