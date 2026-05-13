import { ImageResponse } from "next/og";
import { getIconById, getAllIcons } from "@/lib/icons";
import { renderOgCard } from "./og-card";
import { loadOgFont } from "./og-fonts";

export const runtime = "nodejs";
export const alt = "iconsol — a curated directory of Solana ecosystem logos and icons";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
  const [regular, medium, fraunces] = await Promise.all([
    loadOgFont("Geist-Regular.ttf"),
    loadOgFont("Geist-Medium.ttf"),
    loadOgFont("Fraunces-Regular.ttf"),
  ]);

  // Pick a marquee icon for the un-routed root OG card. Solana is the
  // emblem most synonymous with the directory, so default to it; fall back
  // to the first icon if for some reason it's not in the manifest.
  const icon = getIconById("sol") ?? getAllIcons()[0];

  return new ImageResponse(await renderOgCard(icon), {
    ...size,
    fonts: [
      { name: "Geist", data: regular, style: "normal", weight: 400 },
      { name: "Geist", data: medium, style: "normal", weight: 500 },
      { name: "Fraunces", data: fraunces, style: "normal", weight: 400 },
    ],
  });
}
