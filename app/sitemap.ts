// aifa-v2/app/sitemap.ts
// Comments in English: Robust sitemap with nested content support and diagnostics.

import type { MetadataRoute } from "next";
import { appConfig } from "@/config/app-config";
import { contentData } from "@/config/content/content-data";
import { PageData } from "@/types/page-types";

export const dynamic = "force-dynamic"; // for debugging freshness; switch back to "force-static" later
export const revalidate = 300;

function isValidHref(href?: string): href is string {
  return typeof href === "string" && href.startsWith("/");
}

function absUrl(path: string): string {
  const base = appConfig.url.replace(/\/+$/, "");
  const p = path.replace(/^\/+/, "");
  return `${base}/${p}`;
}

function resolveLastMod(p: PageData): Date {
  const iso = p.updatedAt ?? p.createdAt;
  const d = iso ? new Date(iso) : new Date();
  return Number.isNaN(d.getTime()) ? new Date() : d;
}

function isIndexablePage(p: PageData, disallow: string[]): boolean {
  const roleOk = Array.isArray(p.roles) && p.roles.includes("guest");
  const publishedOk = p.isPublished === true;
  const hrefOk = isValidHref(p.href);
  const notBlocked = hrefOk && !disallow.some((rule) => p.href!.startsWith(rule));
  return roleOk && publishedOk && hrefOk && notBlocked;
}

// FIXED: Properly typed CatNode without any
type CatNode = {
  pages?: PageData[];
  items?: PageData[];
  entries?: PageData[];
  children?: CatNode[];
  sections?: CatNode[];
};

// FIXED: Extract pages with proper type checking instead of 'any'
function extractAllPages(nodes: CatNode[] | undefined): PageData[] {
  if (!Array.isArray(nodes)) return [];
  const out: PageData[] = [];
  
  for (const node of nodes) {
    // Safely extract page arrays with type narrowing
    const pageArrays: PageData[][] = [
      node.pages ?? [],
      node.items ?? [],
      node.entries ?? [],
    ];
    
    for (const arr of pageArrays) {
      out.push(...arr);
    }

    // Safely extract nested nodes with type narrowing
    const nextLevels: CatNode[][] = [
      node.children ?? [],
      node.sections ?? [],
    ];
    
    for (const next of nextLevels) {
      out.push(...extractAllPages(next));
    }
  }
  
  return out;
}

// FIXED: Define proper type for contentData or cast more safely
type ContentDataType = {
  categories?: CatNode[];
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const disallow = appConfig.seo.disallowPaths ?? [];

  // FIXED: Type assertion with proper type definition instead of plain 'any'
  const typedContentData = contentData as ContentDataType;
  const allPages: PageData[] = extractAllPages(typedContentData.categories);

  const indexable = allPages.filter((p) => isIndexablePage(p, disallow));

  const items: MetadataRoute.Sitemap = indexable.map((p) => ({
    url: absUrl(p.href!),
    lastModified: resolveLastMod(p),
  }));

  if (!items.some((i) => i.url === absUrl("/"))) {
    items.unshift({ url: absUrl("/"), lastModified: new Date() });
  }

  return items;
}
