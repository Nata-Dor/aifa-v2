// aifa-v2/lib/construct-metadata.ts

import { appConfig, getOgImagePath } from "@/config/app-config";
import type { Metadata } from "next";

export type AuthorInfo = {
  name: string;
  email?: string;
  twitter?: string;
  url?: string;
  jobTitle?: string;
  bio?: string;
  image?: string;
  sameAs?: string[];
};

type ConstructArgs = {
  title?: string;
  description?: string;
  image?: string;
  pathname?: string;
  locale?: string;
  noIndex?: boolean;
  noFollow?: boolean;
};

const DEFAULT_AUTHOR: AuthorInfo = {
  name: "Roman Bolshiyanov",
  email: "roman@aifa.dev",
  twitter: "@aifa_agi",
  url: "https://github.com/aifa-agi",
  jobTitle: "Founder & Lead Developer",
  bio: "Full-stack developer specializing in AI-powered SaaS applications",
  sameAs: [
    "https://github.com/aifa-agi",
    "https://twitter.com/aifa_agi",
  ],
};

const DEFAULT_CREATOR = "aifa.dev";

const MAX_DESCRIPTION_LENGTH = 160;

// FIXED: Properly typed icon structure
type IconConfig = {
  url: string;
  rel?: string;
  sizes?: string;
  type?: string;
};

const CACHED_ICONS = (() => {
  const icons: IconConfig[] = [];

  // Favicon (any size)
  const faviconAny = appConfig.icons?.faviconAny;
  if (faviconAny && typeof faviconAny === "string" && faviconAny.length > 0) {
    icons.push({
      url: faviconAny,
      rel: "icon",
      sizes: "any",
      type: "image/x-icon",
    });
  }

  const icon32 = appConfig.icons?.icon32;
  if (icon32 && typeof icon32 === "string" && icon32.length > 0) {
    icons.push({
      url: icon32,
      type: "image/png",
      sizes: "32x32",
      rel: "icon",
    });
  }

  const icon48 = appConfig.icons?.icon48;
  if (icon48 && typeof icon48 === "string" && icon48.length > 0) {
    icons.push({
      url: icon48,
      type: "image/png",
      sizes: "48x48",
      rel: "icon",
    });
  }

  const icon192 = appConfig.icons?.icon192;
  if (icon192 && typeof icon192 === "string" && icon192.length > 0) {
    icons.push({
      url: icon192,
      type: "image/png",
      sizes: "192x192",
      rel: "icon",
    });
  }

  const icon512 = appConfig.icons?.icon512;
  if (icon512 && typeof icon512 === "string" && icon512.length > 0) {
    icons.push({
      url: icon512,
      type: "image/png",
      sizes: "512x512",
      rel: "icon",
    });
  }

  const appleTouch = appConfig.icons?.appleTouch;
  if (appleTouch && typeof appleTouch === "string" && appleTouch.length > 0) {
    icons.push({
      url: appleTouch,
      rel: "apple-touch-icon",
      sizes: "180x180",
      type: "image/png",
    });
  }

  return icons as NonNullable<Metadata["icons"]>;
})();

function normalizePath(p?: string): string {
  if (!p) return "/";
  let s = String(p).trim();
  if (!s.startsWith("/")) s = `/${s}`;
  while (s.includes("//")) s = s.replace("//", "/");
  return s;
}

function truncateDescription(
  desc: string,
  maxLength: number = MAX_DESCRIPTION_LENGTH
): string {
  if (desc.length <= maxLength) return desc;
  return desc.substring(0, maxLength - 3) + "...";
}

// FIXED: Properly typed schema objects instead of 'any'
type JsonLdSchema = Record<string, unknown>;

function buildPersonSchema(author: AuthorInfo): JsonLdSchema {
  const person: JsonLdSchema = {
    "@type": "Person",
    name: author.name,
  };

  if (author.url) person.url = author.url;
  if (author.email) person.email = author.email;
  if (author.image) person.image = author.image;
  if (author.bio) person.description = author.bio;
  if (author.jobTitle) person.jobTitle = author.jobTitle;

  const sameAsUrls: string[] = [];
  if (author.sameAs) sameAsUrls.push(...author.sameAs);
  if (author.twitter && !author.twitter.startsWith("http")) {
    const handle = author.twitter.replace("@", "");
    sameAsUrls.push(`https://twitter.com/${handle}`);
  }
  if (sameAsUrls.length > 0) person.sameAs = sameAsUrls;

  return person;
}

export function constructMetadata({
  title = appConfig.name,
  description = appConfig.description,
  image = getOgImagePath(),
  pathname,
  locale = appConfig.seo?.defaultLocale ?? appConfig.lang,
  noIndex = false,
  noFollow = false,
}: ConstructArgs = {}): Metadata {
  const base = appConfig.seo?.canonicalBase ?? appConfig.url;
  const path = normalizePath(pathname);
  const canonical = new URL(path, base).toString();
  const validDescription = truncateDescription(description);

  const metadata: Metadata = {
    title,
    description: validDescription,
    metadataBase: new URL(appConfig.url),
    alternates: { canonical },
    manifest: "/manifest.webmanifest",
    icons: CACHED_ICONS,
    authors: [{ name: DEFAULT_AUTHOR.name, url: DEFAULT_AUTHOR.url }],
    creator: DEFAULT_CREATOR,
    publisher: DEFAULT_CREATOR,
    openGraph: {
      type: appConfig.og?.type ?? "website",
      title,
      description: validDescription,
      url: canonical,
      siteName: appConfig.og?.siteName ?? appConfig.name,
      images: [
        {
          url: image,
          width: appConfig.og?.imageWidth ?? 1200,
          height: appConfig.og?.imageHeight ?? 630,
          alt: validDescription,
        },
      ],
      locale: appConfig.og?.locale ?? `${locale}_${locale.toUpperCase()}`,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: validDescription,
      images: [image],
      creator: appConfig.seo?.social?.twitter,
    },
    robots: {
      index: !noIndex && (appConfig.pageDefaults?.robotsIndex ?? true),
      follow: !noFollow && (appConfig.pageDefaults?.robotsFollow ?? true),
    },
  };

  return metadata;
}

export function buildArticleSchema({
  headline,
  datePublished,
  dateModified,
  author,
  image,
  description,
}: {
  headline: string;
  datePublished: string;
  dateModified?: string;
  author: AuthorInfo | AuthorInfo[];
  image?: string;
  description?: string;
}): JsonLdSchema {
  // FIXED: Properly typed author schema
  const authorSchema = Array.isArray(author)
    ? author.map((a) => buildPersonSchema(a))
    : buildPersonSchema(author);

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline,
    datePublished,
    dateModified: dateModified || datePublished,
    author: authorSchema,
    ...(description && { description }),
    publisher: {
      "@type": "Organization",
      name: DEFAULT_CREATOR,
      logo: {
        "@type": "ImageObject",
        url: new URL(appConfig.logo, appConfig.url).toString(),
      },
    },
    ...(image && {
      image: {
        "@type": "ImageObject",
        url: image,
      },
    }),
  };
}

export function buildFAQSchema(
  faqs: Array<{ question: string; answer: string }>
): JsonLdSchema {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

export function buildProductSchema({
  name,
  description,
  price,
  currency,
  rating,
  reviewCount,
  image,
  brand,
}: {
  name: string;
  description?: string;
  price: number;
  currency: string;
  rating?: number;
  reviewCount?: number;
  image?: string;
  brand?: string;
}): JsonLdSchema {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    ...(description && { description }),
    ...(image && { image }),
    ...(brand && { brand: { "@type": "Brand", name: brand } }),
    offers: {
      "@type": "Offer",
      price: price.toFixed(2),
      priceCurrency: currency,
      availability: "https://schema.org/InStock",
    },
    ...(rating &&
      reviewCount && {
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: rating,
          reviewCount,
        },
      }),
  };
}

export function buildBreadcrumbSchema(
  breadcrumbs: Array<{ name: string; url: string }>
): JsonLdSchema {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbs.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: new URL(item.url, appConfig.url).toString(),
    })),
  };
}
