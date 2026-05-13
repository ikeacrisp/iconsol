import { readFile } from "node:fs/promises";
import { join } from "node:path";

/**
 * Resolve a font file under /public/og/ at request time.
 *
 * Path resolution differs between build-time static OG generation and
 * request-time dynamic generation on Vercel — the static path works when
 * Next pre-renders the root OG, but the dynamic per-icon route runs from
 * a serverless function root where process.cwd() doesn't always anchor on
 * the Next app. So we try the fs path first and fall back to an HTTP
 * fetch of the public asset, which is always reachable in production.
 */
export async function loadOgFont(filename: string): Promise<ArrayBuffer> {
  try {
    const buffer = await readFile(join(process.cwd(), "public/og", filename));
    // Slice off the underlying ArrayBuffer view that Buffer wraps.
    return buffer.buffer.slice(
      buffer.byteOffset,
      buffer.byteOffset + buffer.byteLength,
    );
  } catch {
    // Fall through to HTTP fetch.
  }

  // Use the public alias, not VERCEL_URL. Vercel's per-deployment URLs
  // (preview and the production target *.vercel.app) sit behind SSO and
  // return 401 to anonymous fetches; iconsol.me is the only origin that
  // serves /public assets to the OG function itself.
  const host = "https://iconsol.me";
  const res = await fetch(`${host}/og/${filename}`);
  if (!res.ok) {
    throw new Error(`Failed to load font ${filename} from ${host}: ${res.status}`);
  }
  return res.arrayBuffer();
}
