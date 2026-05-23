import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // The MCP transport endpoint isn't useful to crawlers and is rate-limited.
        disallow: ["/api/mcp", "/api/agentation"],
      },
    ],
    sitemap: "https://iconsol.me/sitemap.xml",
    host: "https://iconsol.me",
  };
}
