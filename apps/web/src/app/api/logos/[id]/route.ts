import { NextResponse, type NextRequest } from "next/server";
import { getIconById } from "@/lib/icons";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Cache-Control": "public, max-age=300, s-maxage=3600",
};

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const icon = getIconById(id);

  if (!icon) {
    return NextResponse.json(
      { error: "not_found", message: `No logo with id '${id}'` },
      { status: 404, headers: CORS_HEADERS }
    );
  }

  const { origin } = new URL(request.url);
  const src = icon.src?.startsWith("http") ? icon.src : `${origin}${icon.src}`;

  return NextResponse.json({ ...icon, src }, { headers: CORS_HEADERS });
}
