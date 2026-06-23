import { prisma } from "@/lib/prisma";

export type ArticleListItem = {
  id: string;
  slug: string;
  title: string;
  dek: string;
  publishedAt: Date | null;
  category: { name: string; slug: string };
  author: { name: string };
  _count: { replies: number };
  isSyndicated: boolean;
  sourceName: string | null;
};

export async function getPublishedArticles(limit?: number) {
  const articles = await prisma.article.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    take: limit,
    include: {
      category: { select: { name: true, slug: true } },
      author: { select: { name: true } },
      thread: { select: { _count: { select: { replies: true } } } },
    },
  });
  return articles.map((a) => ({
    id: a.id,
    slug: a.slug,
    title: a.title,
    dek: a.dek,
    publishedAt: a.publishedAt,
    category: a.category,
    author: a.author,
    _count: { replies: a.thread?._count.replies ?? 0 },
    isSyndicated: a.isSyndicated,
    sourceName: a.sourceName,
  }));
}

export async function getArticleBySlug(slug: string) {
  return prisma.article.findUnique({
    where: { slug },
    include: {
      category: true,
      author: { select: { name: true } },
      tags: { include: { tag: true } },
      viewpoints: { orderBy: { order: "asc" } },
      thread: {
        include: {
          _count: { select: { replies: true } },
        },
      },
    },
  });
}

export async function getArticlesByCategory(slug: string) {
  return prisma.article.findMany({
    where: {
      status: "PUBLISHED",
      category: { slug },
    },
    orderBy: { publishedAt: "desc" },
    include: {
      category: { select: { name: true, slug: true } },
      author: { select: { name: true } },
      thread: { select: { _count: { select: { replies: true } } } },
    },
  });
}

export async function getAllCategories() {
  return prisma.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { articles: true } } },
  });
}