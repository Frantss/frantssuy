import type { ArticleIndexEntry } from "@/lib/articles/article-manifest";

export const articles = [
  {
    slug: "index-test-title",
    title: "Drizzle schema",
    description: "Fixture",
    date: "2026.10.01",
    tags: ["engineering"],
    keywords: ["database"],
    language: "en",
    bodyText: "Typed queries",
  },
  {
    slug: "index-test-body",
    title: "Building applications",
    description: "Fixture",
    date: "2026.10.03",
    tags: ["engineering", "log"],
    keywords: ["database"],
    language: "en",
    bodyText: "Using Drizzle",
  },
  {
    slug: "index-test-spanish",
    title: "Desarrollando aplicaciones",
    description: "Fixture",
    date: "2026.10.02",
    tags: ["log"],
    keywords: [],
    language: "es",
    bodyText: "Artículos en español",
  },
] satisfies ArticleIndexEntry[];
