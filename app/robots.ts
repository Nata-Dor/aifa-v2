// aifa-v2/app/robots.ts

import type { MetadataRoute } from "next";
import { appConfig } from "@/config/app-config";

export const dynamic = "force-static"; 

export default function robots(): MetadataRoute.Robots {
  const isDisallowAll = appConfig.seo.indexing === "disallow";

  if (isDisallowAll) {
    return {
      rules: { userAgent: "*", disallow: "/" },
      sitemap: appConfig.seo.sitemapUrl,
    };
  }

  const disallow = appConfig.seo.disallowPaths ?? [];

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow,
      },
    ],
    sitemap: appConfig.seo.sitemapUrl,
  };
}
