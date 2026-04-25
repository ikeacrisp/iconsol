import { NextResponse, type NextRequest } from "next/server";
import { getAllIcons } from "@/lib/icons";
import { searchIcons } from "@/lib/search";
import type { IconCategory } from "@/lib/icon-data";

const VALID_CATEGORIES: Array<IconCategory | "all"> = [
  "all",
  "tokens",
  "defi",
  "wallets",
  "nft",
  "infrastructure",
];

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Cache-Control": "public, max-age=300, s-maxage=3600",
};

function toAbsoluteSrc(origin: string, src: string) {
  if (!src) return src;
  if (src.startsWith("http")) return src;
  return `${origin}${src}`;
}

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const query = searchParams.get("q") ?? undefined;
  const rawCategory = searchParams.get("category");
  const category = VALID_CATEGORIES.includes(rawCategory as IconCategory | "all")
    ? (rawCategory as IconCategory | "all")
    : "all";

  const icons = searchIcons(getAllIcons(), { query, category });
  const logos = icons.map((icon) => ({
    ...icon,
    src: toAbsoluteSrc(origin, icon.src),
  }));

  return NextResponse.json(
    { count: logos.length, logos },
    { headers: CORS_HEADERS }
  );
}
