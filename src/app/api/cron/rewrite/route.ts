import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Process 3 articles per batch — rewrite is slow (~8s each)
const BATCH_SIZE = 3;

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
    // Only fetch articles with short/missing body
    const articles = await prisma.article.findMany({
      where: {
        isSyndicated: true,
        OR: [
          { body: null },
          { body: "" },
          { body: { lt: "z" } }, // filter: will check length in code
        ],
      },
      select: { id: true, title: true, dek: true, body: true, sourceUrl: true },
      orderBy: { createdAt: "asc" },
      take: BATCH_SIZE * 5, // fetch more, filter short ones in code
    });

    // Filter to only short/missing bodies
    const shortArticles = articles.filter((a) => !a.body || a.body.length < 300).slice(0, BATCH_SIZE);

    let updated = 0;
    let errors = 0;

    for (const article of shortArticles) {
      const rewritten = await rewriteArticle(article.title, article.dek || "", article.sourceUrl || "");
      if (rewritten) {
        await prisma.article.update({
          where: { id: article.id },
          data: { body: rewritten },
        });
        updated++;
      } else {
        errors++;
      }
    }

    const remaining = await prisma.article.count({
      where: { isSyndicated: true },
    });

    return NextResponse.json({
      ok: true,
      batch: shortArticles.length,
      updated,
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

async function rewriteArticle(title: string, description: string, sourceUrl: string): Promise<string | null> {
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
  const timeout = setTimeout(() => controller.abort(), 12000);

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
