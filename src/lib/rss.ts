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
}

const FEEDS: FeedConfig[] = [
  {
    name: "ANTARA",
    url: "https://www.antaranews.com/rss/terkini",
  },
  {
    name: "Republika",
    url: "https://www.republika.co.id/rss",
  },
  {
    name: "CNN Indonesia",
    url: "https://www.cnnindonesia.com/nasional/rss",
  },
];

const VALID_CATEGORIES = [
  { slug: "politik", label: "Politik" },
  { slug: "sosial-budaya", label: "Sosial Budaya" },
  { slug: "ekonomi", label: "Ekonomi" },
  { slug: "klarifikasi-cek-fakta", label: "Klarifikasi / Cek Fakta" },
  { slug: "opini", label: "Opini" },
];

const FALLBACK_CATEGORY = "politik";

// ── Keyword-based fallback categorization ──

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  politik: [
    "politik", "pilkada", "pemilu", "dpr", "mpr", "presiden", "menteri",
    "kabinet", "partai", "legislatif", "eksekutif", "yudikatif", "mahkamah",
    "konstitusi", "gubernur", "bupati", "walikota", "parlemen", "diplomasi",
  ],
  "sosial-budaya": [
    "budaya", "seni", "tradisi", "adat", "festival", "kebudayaan", "kesenian",
    "sosial", "masyarakat", "pendidikan", "sekolah", "universitas", "mahasiswa",
    "guru", "dosen", "agama", "keagamaan", "toleransi", "kebhinekaan",
    "pluralisme", "warisan", "cagar budaya",
  ],
  ekonomi: [
    "ekonomi", "bisnis", "keuangan", "investasi", "saham", "bank", "inflasi",
    "dagangan", "perdagangan", "ekspor", "impor", "rupiah", "kurs", "pajak",
    "apbn", "anggaran", "startup", "umkm", "koperasi", "industri",
    "manufaktur", "pertanian", "perkebunan", "pertambangan", "energi",
  ],
  "klarifikasi-cek-fakta": [
    "hoaks", "hoax", "klarifikasi", "cek fakta", "fact check", "disinformasi",
    "misinformasi", "penipuan", "viral", "tidak benar", "palsu", "fitnah",
    "konfirmasi", "penegasan", "bantahan",
  ],
  opini: [
    "opini", "analisis", "pendapat", "kolom", "tajuk", "editorial",
    "komentar", "perspektif", "sikap", "pandangan", "renungan",
  ],
};

function detectCategoryByKeywords(title: string, description: string): string {
  const text = `${title} ${description}`.toLowerCase();

  const scores: Record<string, number> = {};
  for (const [categorySlug, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    scores[categorySlug] = 0;
    for (const keyword of keywords) {
      if (text.includes(keyword)) {
        scores[categorySlug] += 1;
      }
    }
  }

  let bestSlug = FALLBACK_CATEGORY;
  let bestScore = 0;
  for (const [slug, score] of Object.entries(scores)) {
    if (score > bestScore) {
      bestScore = score;
      bestSlug = slug;
    }
  }

  return bestSlug;
}

// ── AI-based categorization (primary) ──

const AI_CATEGORIES_PROMPT = VALID_CATEGORIES
  .map((c) => `- "${c.slug}" (${c.label})`)
  .join("\n");

async function detectCategoryByAI(title: string, description: string): Promise<string | null> {
  const apiKey = process.env.LLM_API_KEY;
  const apiBase = process.env.LLM_API_BASE_URL; // e.g. https://openrouter.ai/api/v1
  const aiModel = process.env.LLM_MODEL || "anthropic/claude-sonnet-4-20250514";

  if (!apiKey || !apiBase) {
    return null; // No AI configured, signal to use fallback
  }

  const systemPrompt = `Kamu adalah asisten editor portal berita berbahasa Indonesia.
Tugasmu: klasifikasikan berita ke SATU kategori yang paling tepat.

Daftar kategori valid:
${AI_CATEGORIES_PROMPT}

Balas HANYA dengan slug kategori (misal: "politik"), tanpa penjelasan tambahan.`;

  const userPrompt = `Judul: ${title}\nRingkasan: ${description || "(tidak ada)"}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000); // 10s timeout

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
        model: aiModel,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        max_tokens: 20,
        temperature: 0,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!resp.ok) {
      console.error(`[RSS AI] API error: ${resp.status} ${resp.statusText}`);
      return null;
    }

    const data = (await resp.json()) as Record<string, unknown>;
    const choices = data.choices as Array<{ message: { content: string } }> | undefined;
    const content = choices?.[0]?.message?.content?.trim().toLowerCase() || "";

    // Strip any quotes or backticks the model might add
    const slug = content.replace(/^["']|["']$/g, "").replace(/^`|`$/g, "");

    // Validate that the AI returned a valid category
    const isValid = VALID_CATEGORIES.some((c) => c.slug === slug);
    if (!isValid) {
      console.warn(`[RSS AI] Invalid category returned: "${slug}", falling back to keywords`);
      return null;
    }

    return slug;
  } catch (err) {
    clearTimeout(timeout);
    console.warn(`[RSS AI] Error: ${(err as Error).message}, falling back to keywords`);
    return null;
  }
}

// ── Main categorization (AI → Keywords fallback) ──

async function detectCategory(title: string, description: string): Promise<string> {
  // Try AI first
  const aiResult = await detectCategoryByAI(title, description);
  if (aiResult) {
    return aiResult;
  }

  // Fallback to keyword matching
  return detectCategoryByKeywords(title, description);
}

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
  aiUsed: number;
  keywordFallback: number;
}> {
  const authorId = await getOrCreateAggregatorUser();
  let imported = 0;
  let skipped = 0;
  let aiUsed = 0;
  let keywordFallback = 0;
  const errors: string[] = [];

  // Pre-fetch all categories
  const allCategories = await prisma.category.findMany();
  const categoryMap = new Map<string, (typeof allCategories)[number]>();
  for (const cat of allCategories) {
    categoryMap.set(cat.slug, cat);
  }

  const MAX_ITEMS_PER_FEED = 5;

  for (const feed of FEEDS) {
    try {
      // Timeout wrapper for feed fetch
      const controller = new AbortController();
      const feedTimeout = setTimeout(() => controller.abort(), 15000); // 15s per feed

      const parsed = await Promise.race([
        parser.parseURL(feed.url),
        new Promise<never>((_, reject) => {
          controller.signal.addEventListener("abort", () => reject(new Error("Feed timeout")));
        }),
      ]);

      clearTimeout(feedTimeout);

      // Limit items to avoid timeout
      const items = parsed.items.slice(0, MAX_ITEMS_PER_FEED);

      for (const item of items) {
        if (!item.link || !item.title) continue;

        // Check if already imported
        const existing = await prisma.article.findFirst({
          where: { sourceUrl: item.link },
        });
        if (existing) {
          skipped++;
          continue;
        }

        // Auto-detect category (AI → keyword fallback)
        const description =
          ((item as unknown as Record<string, string>).contentSnippet) ||
          item.description ||
          "";
        const categorySlug = await detectCategory(item.title, description);

        // Track which method was used (for logging)
        const apiKey = process.env.LLM_API_KEY;
        const apiBase = process.env.LLM_API_BASE_URL;
        if (apiKey && apiBase) {
          aiUsed++;
        } else {
          keywordFallback++;
        }

        const category = categoryMap.get(categorySlug);
        if (!category) {
          errors.push(`Category not found: ${categorySlug} (for "${item.title}")`);
          continue;
        }

        const slug = `${sanitizeSlug(item.title)}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        const plainContent = description.replace(/<[^>]*>/g, "").trim();
        const dek = truncate(plainContent, 200);

        await prisma.article.create({
          data: {
            slug,
            title: item.title,
            dek,
            body: truncate(plainContent, 2000),
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

  return { imported, skipped, errors, aiUsed, keywordFallback };
}
