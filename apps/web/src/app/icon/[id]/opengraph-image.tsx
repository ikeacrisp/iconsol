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
  try {
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
  } catch (err) {
    // Surface the underlying failure as a debug PNG so we can read it
    // off the live response while diagnosing 500s. This is intentionally
    // ugly and temporary.
    const message =
      err instanceof Error ? `${err.name}: ${err.message}` : String(err);
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            padding: 48,
            backgroundColor: "#0a0b0f",
            color: "#ff6b6b",
            fontSize: 28,
            fontFamily: "sans-serif",
            whiteSpace: "pre-wrap",
          }}
        >
          {`cwd=${process.cwd()}\nVERCEL_URL=${process.env.VERCEL_URL ?? "(unset)"}\n\n${message}`}
        </div>
      ),
      size,
    );
  }
}
