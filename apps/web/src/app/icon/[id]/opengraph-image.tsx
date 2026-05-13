import { ImageResponse } from "next/og";
import { getIconById } from "@/lib/icons";
import { renderOgCard } from "../../og-card";
import { loadOgFont } from "../../og-fonts";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export async function generateImageMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const icon = getIconById(id);
  return [
    {
      id: "main",
      alt: icon
        ? `${icon.name} on iconsol`
        : "iconsol — Solana ecosystem logos",
      contentType,
      size,
    },
  ];
}

export default async function IconOpenGraphImage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [regular, medium, fraunces] = await Promise.all([
    loadOgFont("Geist-Regular.ttf"),
    loadOgFont("Geist-Medium.ttf"),
    loadOgFont("Fraunces-Regular.ttf"),
  ]);

  const icon = getIconById(id);

  return new ImageResponse(await renderOgCard(icon), {
    ...size,
    fonts: [
      { name: "Geist", data: regular, style: "normal", weight: 400 },
      { name: "Geist", data: medium, style: "normal", weight: 500 },
      { name: "Fraunces", data: fraunces, style: "normal", weight: 400 },
    ],
  });
}
