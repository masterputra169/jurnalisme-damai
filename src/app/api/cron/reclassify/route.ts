import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { detectCategory } from "@/lib/rss";

// Process 5 articles per batch to stay within Hobby 10s timeout
const BATCH_SIZE = 5;

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
    const articles = await prisma.article.findMany({
      where: { isSyndicated: true },
      select: { id: true, title: true, dek: true, body: true, sourceUrl: true },
      orderBy: { createdAt: "asc" },
      take: BATCH_SIZE,
    });

    const categories = await prisma.category.findMany();
    const categoryMap = new Map<string, string>();
    for (const cat of categories) {
      categoryMap.set(cat.slug, cat.id);
    }

    let updated = 0;
    let rewritten = 0;
    let categoryChanged = 0;
    const errors = 0;

    for (const article of articles) {
      const desc = article.dek || "";
      const newSlug = await detectCategory(article.title, desc);
      const newCategoryId = categoryMap.get(newSlug);

      const updates: Record<string, unknown> = {};

      if (newCategoryId) {
        updates.categoryId = newCategoryId;
        categoryChanged++;
      }

      if (!article.body || article.body.length < 300) {
        const rewrittenBody = await rewriteWithAI(article.title, desc, article.sourceUrl || "");
        if (rewrittenBody) {
          updates.body = rewrittenBody;
          rewritten++;
        }
      }

      if (Object.keys(updates).length > 0) {
        await prisma.article.update({
          where: { id: article.id },
          data: updates,
        });
        updated++;
      }
    }

    const remaining = await prisma.article.count({
      where: { isSyndicated: true },
    });

    return NextResponse.json({
      ok: true,
      batch: articles.length,
      updated,
      categoryChanged,
      rewritten,
      errors,
      remaining,
      message: remaining > 0 ? `Call again to process ${remaining} more articles` : "All articles processed",
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 }
    );
  }
}

async function rewriteWithAI(title: string, description: string, sourceUrl: string): Promise<string | null> {
  const apiKey = process.env.LLM_API_KEY;
  const apiBase = process.env.LLM_API_BASE_URL;

  if (!apiKey || !apiBase) return null;

  const systemPrompt = `Kamu adalah jurnalis profesional berbahasa Indonesia yang menulis ulang berita dari sumber lain dengan gaya jurnalistik yang segar, faktual, dan mudah dipahami.

TUGAS:
1. Tulis ulang berita berdasarkan judul dan ringkasan yang diberikan
2. Gunakan kalimat dan struktur yang BERBEDA dari aslinya (parafrase)
3. Jaga fakta, nama, angka, dan data tetap akurat
4. Tulis dalam gaya jurnalistik Indonesia: paragraf-paragraf singkat (1-3 kalimat)
5. Mulai dengan lead (paragraf pertama) yang langsung ke inti berita
6. Jangan tambahkan opini atau interpretasi pribadi
7. Jangan gunakan kata "saya", "kami", "menurut kami"
8. Gunakan 3-6 paragraf, total 300-600 kata
9. Bahasa formal, objektif, netral
10. Hasil akhir HARUS berupa teks berita siap publikasi, bukan ringkasan
11. JANGAN gunakan markdown apa pun — tanpa **, *, _, #, atau format tebal/miring
12. JANGAN gunakan em-dash (—) atau en-dash (–), gunakan koma atau titik sebagai gantinya`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const resp = await fetch(`${apiBase}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": "https://jurnalisme-damai.vercel.app",
        "X-Title": "Jurnalisme Damai RSS Importer",
      },
      body: JSON.stringify({
        model: process.env.LLM_MODEL || "Naraya/Naraya-v4-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Judul: ${title}\nRingkasan: ${description || "(tidak ada)"}\nURL: ${sourceUrl}\n\nTulis ulang berita ini.` },
        ],
        max_tokens: 1500,
        temperature: 0.7,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!resp.ok) return null;

    const data = (await resp.json()) as Record<string, unknown>;
    const choices = data.choices as Array<{ message: { content: string } }> | undefined;
    const raw = choices?.[0]?.message?.content?.trim() || "";

    // Strip markdown formatting, em-dashes, en-dashes
    const cleaned = raw
      .replace(/\*\*/g, '')
      .replace(/(?<!\*)\*(?!\*)/g, '')
      .replace(/__/g, '')
      .replace(/_/g, '')
      .replace(/^#{1,6}\s+/gm, '')
      .replace(/—/g, ', ')
      .replace(/–/g, ', ')
      .replace(/\s+/g, ' ')
      .trim();

    return cleaned.length > 100 ? cleaned : null;
  } catch {
    clearTimeout(timeout);
    return null;
  }
}
