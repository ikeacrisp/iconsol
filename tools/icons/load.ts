/**
 * Loads + validates all per-icon source folders. Used by build, parity check,
 * and any other script that needs the canonical icon data.
 */

import fs from "node:fs";
import path from "node:path";
import { ICONS_SRC, ORDER_FILE, VARIANTS } from "./paths";
import type { IconRecord } from "./types";

// Pre-existing category folders (icons/defi/*.svg, etc.) feed the legacy npm
// package — skip them when scanning per-icon folders.
const LEGACY_CATEGORY_DIRS = new Set([
  "tokens",
  "defi",
  "wallets",
  "nft",
  "infrastructure",
]);
const SKIP_DIRS = new Set(["_aux", ...LEGACY_CATEGORY_DIRS]);

function readJson<T>(file: string): T {
  return JSON.parse(fs.readFileSync(file, "utf8")) as T;
}

function readOrder(): string[] {
  if (!fs.existsSync(ORDER_FILE)) return [];
  return fs
    .readFileSync(ORDER_FILE, "utf8")
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !l.startsWith("#"));
}

function listIconDirs(): string[] {
  return fs
    .readdirSync(ICONS_SRC, { withFileTypes: true })
    .filter((e) => e.isDirectory() && !SKIP_DIRS.has(e.name))
    .map((e) => e.name);
}

function validateRecord(record: IconRecord, dir: string) {
  if (!record.id) throw new Error(`${dir}/icon.json: missing 'id'`);
  if (record.id !== path.basename(dir)) {
    throw new Error(
      `${dir}/icon.json: id "${record.id}" does not match folder "${path.basename(dir)}"`
    );
  }
  if (!record.name) throw new Error(`${record.id}: missing 'name'`);
  if (!record.category) throw new Error(`${record.id}: missing 'category'`);

  if (record.display) {
    for (const variant of VARIANTS) {
      const spec = record.display[variant];
      if (!spec) continue;
      for (const layer of spec.layers) {
        const layerPath = path.join(dir, variant, layer.src);
        if (!fs.existsSync(layerPath)) {
          throw new Error(
            `${record.id}: ${variant} layer "${layer.src}" not found at ${layerPath}`
          );
        }
        for (const mask of layer.maskSrcs ?? []) {
          const maskPath = path.join(dir, variant, mask);
          if (!fs.existsSync(maskPath)) {
            throw new Error(
              `${record.id}: ${variant} mask "${mask}" not found at ${maskPath}`
            );
          }
        }
      }
    }
  }
}

export interface LoadedIcon {
  record: IconRecord;
  /** Absolute path to icons/<id>/ */
  dir: string;
}

export interface LoadResult {
  /** Icons that have a website display spec, sorted by displayOrder/_order.txt then alphabetical. */
  webLogos: LoadedIcon[];
  /** Icons that are data-only (no display.brand and no display.solid). */
  dataOnly: LoadedIcon[];
  /** All icons combined, in webLogos-order then dataOnly. */
  all: LoadedIcon[];
}

export function loadAllIcons(): LoadResult {
  const dirs = listIconDirs();
  const records: LoadedIcon[] = dirs.map((id) => {
    const dir = path.join(ICONS_SRC, id);
    const file = path.join(dir, "icon.json");
    if (!fs.existsSync(file)) {
      throw new Error(`Missing icon.json in icons/${id}/`);
    }
    const record = readJson<IconRecord>(file);
    validateRecord(record, dir);
    return { record, dir };
  });

  const orderList = readOrder();
  const orderRank = new Map(orderList.map((id, i) => [id, i]));

  const webLogos = records
    .filter((x) => x.record.display)
    .sort((a, b) => {
      const ra = orderRank.get(a.record.id);
      const rb = orderRank.get(b.record.id);
      if (ra !== undefined && rb !== undefined) return ra - rb;
      if (ra !== undefined) return -1;
      if (rb !== undefined) return 1;
      return a.record.id.localeCompare(b.record.id);
    });

  const dataOnly = records
    .filter((x) => !x.record.display)
    .sort((a, b) => a.record.id.localeCompare(b.record.id));

  return { webLogos, dataOnly, all: [...webLogos, ...dataOnly] };
}
