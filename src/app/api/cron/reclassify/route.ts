import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { detectCategory } from "@/lib/rss";

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
    // Fetch all syndicated articles
    const articles = await prisma.article.findMany({
      where: { isSyndicated: true },
      select: { id: true, title: true, dek: true },
    });

    // Fetch all categories
    const categories = await prisma.category.findMany();
    const categoryMap = new Map<string, string>();
    for (const cat of categories) {
      categoryMap.set(cat.slug, cat.id);
    }

    let updated = 0;
    let errors = 0;

    for (const article of articles) {
      const newSlug = await detectCategory(article.title, article.dek || "");
      const newCategoryId = categoryMap.get(newSlug);

      if (!newCategoryId) {
        errors++;
        continue;
      }

      await prisma.article.update({
        where: { id: article.id },
        data: { categoryId: newCategoryId },
      });

      updated++;
    }

    return NextResponse.json({
      ok: true,
      total: articles.length,
      updated,
      errors,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 }
    );
  }
}
