import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { detectCategory } from "@/lib/rss";

// Process 20 articles per batch — categorize only
const BATCH_SIZE = 20;

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    const isVercelCron = request.headers.get("x-vercel-cron");
    if (!isVercelCron) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    const total = await prisma.article.count({ where: { isSyndicated: true } });

    // Fetch first BATCH_SIZE syndicated articles
    const articles = await prisma.article.findMany({
      where: { isSyndicated: true },
      select: { id: true, title: true, dek: true, categoryId: true },
      orderBy: { createdAt: "asc" },
      take: BATCH_SIZE,
    });

    const categories = await prisma.category.findMany();
    const categoryMap = new Map<string, string>();
    for (const cat of categories) {
      categoryMap.set(cat.slug, cat.id);
    }

    let updated = 0;
    let skipped = 0;

    for (const article of articles) {
      const desc = article.dek || "";
      const newSlug = await detectCategory(article.title, desc);
      const newCategoryId = categoryMap.get(newSlug);

      if (newCategoryId && newCategoryId !== article.categoryId) {
        await prisma.article.update({
          where: { id: article.id },
          data: { categoryId: newCategoryId },
        });
        updated++;
      } else {
        skipped++;
      }
    }

    return NextResponse.json({
      ok: true,
      batch: articles.length,
      updated,
      skipped,
      total,
      message: articles.length > 0 ? `Call again to process more` : "All articles categorized",
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 }
    );
  }
}
