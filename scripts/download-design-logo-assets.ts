import fs from "node:fs/promises";
import path from "node:path";
import {
  BRAND_LOGO_ASSETS,
  SOLID_LOGO_ASSETS,
  type LogoAssetLayer,
  type LogoAssetSpec,
} from "../apps/web/src/lib/logo-assets";

const ROOT = process.cwd();
const PUBLIC_ROOT = path.join(ROOT, "apps", "web", "public");

type DownloadEntry = {
  target: string;
  remote: string;
};

function collectLayerDownloads(layer: LogoAssetLayer): DownloadEntry[] {
  const entries: DownloadEntry[] = [{ target: layer.src, remote: layer.remote }];

  if (layer.maskSrcs && layer.maskRemotes) {
    layer.maskSrcs.forEach((target, index) => {
      const remote = layer.maskRemotes?.[index];
      if (!remote) return;
      entries.push({ target, remote });
    });
  }

  return entries;
}

function collectSpecDownloads(spec: LogoAssetSpec): DownloadEntry[] {
  return spec.layers.flatMap(collectLayerDownloads);
}

// Sniff common raster signatures. The design asset export pipeline flattens unsupported primitives
// (most commonly angular gradients) into PNG regardless of what extension
// the consumer requested — catch that here so we never ship a .svg file
// whose bytes are actually PNG.
function sniffImageKind(buffer: Buffer): "png" | "jpeg" | "webp" | "gif" | "svg" | "unknown" {
  if (buffer.length >= 8 && buffer.slice(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "png";
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return "jpeg";
  if (buffer.length >= 12 && buffer.slice(0, 4).toString() === "RIFF" && buffer.slice(8, 12).toString() === "WEBP") return "webp";
  if (buffer.length >= 6 && (buffer.slice(0, 6).toString() === "GIF87a" || buffer.slice(0, 6).toString() === "GIF89a")) return "gif";
  const head = buffer.slice(0, 512).toString("utf8").trim();
  if (head.startsWith("<svg") || head.startsWith("<?xml")) return "svg";
  return "unknown";
}

async function downloadFile(target: string, remote: string) {
  const response = await fetch(remote);
  if (!response.ok) {
    throw new Error(`Failed to download ${remote}: ${response.status} ${response.statusText}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  const kind = sniffImageKind(buffer);

  const declaredExt = path.extname(target).toLowerCase().slice(1); // "svg" | "png" | ...
  const actualExt =
    kind === "svg" ? "svg" : kind === "unknown" ? declaredExt : kind;

  let resolvedTarget = target;
  if (actualExt && actualExt !== declaredExt) {
    resolvedTarget = target.replace(/\.[^./]+$/, `.${actualExt}`);
    console.warn(
      `   ⚠ ${target}: asset export returned ${actualExt.toUpperCase()} bytes (angular-gradient or similar raster). ` +
        `Saving as ${resolvedTarget} — update logo-assets.ts to reference this path.`
    );
  }

  const destination = path.join(PUBLIC_ROOT, resolvedTarget.replace(/^\//, ""));
  await fs.mkdir(path.dirname(destination), { recursive: true });
  await fs.writeFile(destination, buffer);
  return resolvedTarget;
}

async function main() {
  const downloads = [
    ...Object.values(BRAND_LOGO_ASSETS).flatMap(collectSpecDownloads),
    ...Object.values(SOLID_LOGO_ASSETS).flatMap(collectSpecDownloads),
  ];

  const uniqueDownloads = new Map<string, string>();
  for (const entry of downloads) {
    uniqueDownloads.set(entry.target, entry.remote);
  }

  const mismatches: Array<{ declared: string; actual: string }> = [];
  for (const [target, remote] of uniqueDownloads) {
    console.log(`Downloading ${target}`);
    const resolved = await downloadFile(target, remote);
    if (resolved !== target) {
      mismatches.push({ declared: target, actual: resolved });
    }
  }

  if (mismatches.length > 0) {
    console.warn(
      `\n⚠ ${mismatches.length} layer(s) were saved with a corrected extension. ` +
        `Update the matching brandPath(...)/solidPath(...) entries in logo-assets.ts to brandPng(...)/solidPng(...) (or point at the new extension) so runtime references match disk.`
    );
    for (const m of mismatches) {
      console.warn(`   ${m.declared} → ${m.actual}`);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
