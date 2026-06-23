import Parser from "rss-parser";
import { prisma } from "@/lib/prisma";

const parser = new Parser({
  customFields: {
    item: [
      ["media:content", "media"],
      "description",
      "content:encoded",
    ],
  },
});

interface FeedConfig {
  name: string;
  url: string;
  categorySlug: string;
}

const FEEDS: FeedConfig[] = [
  {
    name: "ANTARA",
    url: "https://www.antaranews.com/rss/terkini",
    categorySlug: "opini",
  },
  {
    name: "Republika",
    url: "https://www.republika.co.id/rss",
    categorySlug: "opini",
  },
  {
    name: "CNN Indonesia",
    url: "https://www.cnnindonesia.com/nasional/rss",
    categorySlug: "opini",
  },
];

function sanitizeSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 120);
}

function truncate(text: string, maxLen: number): string {
  if (!text || text.length <= maxLen) return text || "";
  return text.slice(0, maxLen).replace(/\s\w*$/, "") + "...";
}

async function getOrCreateAggregatorUser(): Promise<string> {
  let user = await prisma.user.findUnique({ where: { email: "rss@anyaman.id" } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        name: "RSS Aggregator",
        email: "rss@anyaman.id",
        passwordHash: null,
        role: "CONTRIBUTOR",
      },
    });
  }
  return user.id;
}

export async function fetchAndImportFeeds(): Promise<{
  imported: number;
  skipped: number;
  errors: string[];
}> {
  const authorId = await getOrCreateAggregatorUser();
  let imported = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const feed of FEEDS) {
    try {
      const parsed = await parser.parseURL(feed.url);
      const category = await prisma.category.findUnique({
        where: { slug: feed.categorySlug },
      });
      if (!category) {
        errors.push(`Category not found: ${feed.categorySlug}`);
        continue;
      }

      for (const item of parsed.items) {
        if (!item.link || !item.title) continue;

        // Check if already imported
        const existing = await prisma.article.findFirst({
          where: { sourceUrl: item.link },
        });
        if (existing) {
          skipped++;
          continue;
        }

        const slug = `${sanitizeSlug(item.title)}-${Date.now()}`;
        const content = ((item as unknown as Record<string, string>).contentSnippet) || item.content || item.description || "";
        const dek = truncate(content.replace(/<[^>]*>/g, "").trim(), 200);

        await prisma.article.create({
          data: {
            slug,
            title: item.title,
            dek,
            body: truncate(content.replace(/<[^>]*>/g, "").trim(), 2000),
            status: "PUBLISHED",
            authorId,
            categoryId: category.id,
            publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
            sourceUrl: item.link,
            sourceName: feed.name,
            isSyndicated: true,
          },
        });

        imported++;
      }
    } catch (err) {
      errors.push(`${feed.name}: ${(err as Error).message}`);
    }
  }

  return { imported, skipped, errors };
}
