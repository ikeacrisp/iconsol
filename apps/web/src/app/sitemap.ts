import type { MetadataRoute } from "next";
import { LOGO_ORDER } from "@/lib/icons.generated";

const BASE_URL = "https://iconsol.me";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE_URL}/dashboard`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/lens`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/mcp`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/playground`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/docs`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/submit`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
  ];

  const iconRoutes: MetadataRoute.Sitemap = LOGO_ORDER.map((id) => ({
    url: `${BASE_URL}/icon/${id}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...iconRoutes];
}
