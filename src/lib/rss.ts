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
  { slug: "hukum-kriminal", label: "Hukum & Kriminal" },
  { slug: "teknologi-sains", label: "Teknologi & Sains" },
  { slug: "olahraga", label: "Olahraga" },
  { slug: "kesehatan", label: "Kesehatan" },
  { slug: "pendidikan", label: "Pendidikan" },
  { slug: "lingkungan-bencana", label: "Lingkungan & Bencana" },
  { slug: "hiburan", label: "Hiburan" },
  { slug: "internasional", label: "Internasional" },
];

const FALLBACK_CATEGORY = "politik";

// ── Keyword-based fallback categorization ──

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  politik: [
    "politik", "pilkada", "pemilu", "dpr", "mpr", "presiden", "menteri",
    "kabinet", "partai", "legislatif", "eksekutif", "yudikatif", "mahkamah",
    "konstitusi", "gubernur", "bupati", "walikota", "parlemen", "diplomasi",
    "pilkada", "visi misi", "koalisi", "oposisi", "fraksi", "panitia",
    "rapat paripurna", "raperda", "raperpu", "hak angket", "interpelasi",
    "mosi tidak percaya", "reshuffle", "kpk", "koruptor", "korupsi",
    "tindak pidana korupsi", "gratifikasi", "saksi", "tahanan", "vonis",
    "jaksa", "polri", "polrestro", "kapolda", "panglima", "tni", "ad",
    "au", "al", "pertahanan", "alutsista", "keimigrasian", "kedutaan",
    "hub internasional", "sanctions", "embargo", "sumpah jabatan",
    "pelantikan", "jabatan strategis", "sekretaris menteri", "stafsus",
    "ketua umum", "sekjen partai", "bacaleg", "bawaslu", "kpud",
    "quick count", "real count", "hitung cepat", "debat capres",
    "konvensi", "konferensi pers", "rakyat", "demokrasi",
  ],
  "sosial-budaya": [
    "budaya", "seni", "tradisi", "adat", "festival", "kebudayaan", "kesenian",
    "sosial", "masyarakat", "pendidikan", "sekolah", "universitas", "mahasiswa",
    "guru", "dosen", "agama", "keagamaan", "toleransi", "kebhinekaan",
    "pluralisme", "warisan", "cagar budaya", "tari", "tarian", "batik",
    "wayang", "gamelan", "upacara", "ritual", "kearifan lokal", "suku",
    "etnis", "ras", "diskriminasi", "rasisme", "minoritas", "inklusi",
    "disabilitas", "difabel", "kesehatan mental", "kesehatan jiwa",
    "stunting", "gizi", "pola asuh", "keluarga", "kekerasan dalam rumah",
    "kdrt", "pelecehan", "bully", "perundungan", "kriminalisasi",
    "kemanusiaan", "bencana", "banjir", "gempa", "tsunami", "gunung meletus",
    "longsor", "kebakaran", "evakuasi", "pengungsi", "bantuan sosial",
    "bansos", "zakat", "infak", "sedekah", "amal", "filantropi",
    "relawan", "volunteer", "gotong royong", "bakti sosial", "donor darah",
    "imunisasi", "vaksin", "puskesmas", "rsud", "rumah sakit",
    "wabah", "pandemi", "epidemi", "lansia", "lanjut usia", "anak yatim",
    "panti asuhan", "beasiswa", "lpdp", "bidikmisi", "kip", "kartu indonesia pintar",
  ],
  ekonomi: [
    "ekonomi", "bisnis", "keuangan", "investasi", "saham", "bank", "inflasi",
    "dagangan", "perdagangan", "ekspor", "impor", "rupiah", "kurs", "pajak",
    "apbn", "anggaran", "startup", "umkm", "koperasi", "industri",
    "manufaktur", "pertanian", "perkebunan", "pertambangan", "energi",
    "ihsg", "indeks harga", "obligasi", "sukuk", "reksa dana", "cryptocurrency",
    "bitcoin", "fintech", "pinjol", "pinjaman online", "leasing", "kredit",
    "kpr", "dana pensiun", "bpjs ketenagakerjaan", "thr", "upah minimum",
    "gaji", "inflasi", "deflasi", "bi rate", "suku bunga", "likuiditas",
    "moneter", "fiskal", "devisa", "neraca perdagangan", "pdb", "pdrb",
    "pertumbuhan ekonomi", "resesi", "pemulihan ekonomi", "hilirisasi",
    "hilirisasi industri", "kawasan industri", "kawasan ekonomi khusus",
    "kei", "kekk", "berdikari", "swasembada", "ketahanan pangan",
    "harga BBM", "subsidi", "subsidi energi", "BBM", "pertamax", "pertalite",
    "minyak goreng", "sembako", "kelangkaan", "distribusi", "logistik",
    "e-commerce", "tokopedia", "shopee", "bukalapak", "gojek", "grab",
    "traveloka", "digital", "transformasi digital", "otomasi",
  ],
  "klarifikasi-cek-fakta": [
    "hoaks", "hoax", "klarifikasi", "cek fakta", "fact check", "disinformasi",
    "misinformasi", "penipuan", "viral", "tidak benar", "palsu", "fitnah",
    "konfirmasi", "penegasan", "bantahan", "sanggahan", "koreksi",
    "revision", "revisi", "update", "pembaruan", "terbaru", "sebenarnya",
    "sebetulnya", "yang sebenarnya", "faktanya", "bukan", "bukan berita",
    "menyesatkan", "clickbait", "click bait", "ujaran kebencian",
    "hate speech", "sara", "provokasi", "memanas-manasi", "adu domba",
    "kontroversi", "polemik", "perdebatan", "tudingan", "tuduhan",
    "klaim", "klaim sepihak", "belum terbukti", "masih diselidiki",
    "pemeriksaan", "audit", "investigasi", "sidik", "penyelidikan",
    "penyidikan", "bareskrim", "densus", "88", "antiteror",
  ],
  opini: [
    "opini", "analisis", "pendapat", "kolom", "tajuk", "editorial",
    "komentar", "perspektif", "sikap", "pandangan", "renungan",
    "refleksi", "gagasan", "pemikiran", "wacana", "diskursus",
    "catatan", "surat terbuka", "open letter", "seruan", "ajakan",
    "harapan", "imbauan", "pesan", "nasihat", "saran", "rekomendasi",
    "usul", "gagasan", "ide", "konsep", "visi", "misi",
    "menurut", "argumen", "premis", "tesis", "antitesis", "sintesis",
    "hipotesis", "deduksi", "induksi", "inferensi", "implikasi",
  ],
  "hukum-kriminal": [
    "hukum", "kriminal", "pidana", "perdata", "pengadilan", "mahkamah",
    "hakim", "jaksa", "pengacara", "advokat", "vonis", "hukuman", "penjara",
    "tahanan", "kasasi", "grasi", "amnesti", "aboli", "ekstradisi",
    "pembunuhan", "pencurian", "perampokan", "penipuan", "penyalahgunaan",
    "narkoba", "narkotika", "ganja", "sabu", "kokain", "heroin",
    "korupsi", "suap", "gratifikasi", "cuci uang", "money laundering",
    "kekerasan", "pemerkosaan", "penganiayaan", "asusila", "trafficking",
    "penculikan", "penyanderaan", "terorisme", "radikalisme", "bom",
    "polisi", "polrestro", "polda", "kapolda", "kabareskrim", "densus",
    "kejaksaan", "kejagung", "kejaksaan agung", "kpk", "komisi pemberantasan",
    "yudisial", "hukum acara", "dakwaan", "tuntutan", "putusan", "banding",
  ],
  "teknologi-sains": [
    "teknologi", "sains", "ilmu pengetahuan", "riset", "penelitian",
    "laboratorium", "peneliti", "ilmuwan", "dosen peneliti", "publikasi",
    "komputer", "laptop", "smartphone", "gadget", "android", "ios",
    "software", "hardware", "aplikasi", "aplikasi mobile", "mobile app",
    "artificial intelligence", "ai", "machine learning", "deep learning",
    "chatgpt", "generative ai", "llm", "large language model",
    "startup", "unicorn", "decacorn", "funding", "investasi startup",
    "internet", "wifi", "5g", "fiber optic", "satelit", "telekomunikasi",
    "cyber", "cybersecurity", "hacker", "data breach", "malware", "ransomware",
    "luar angkasa", "nasa", "spacex", "mars", "bulan", "roket", "satelit",
    "iklim", "cuaca", "meteorologi", "bmkg", "geologi", "seismologi",
    "vaksin", "obat baru", "terapi", "genetika", "dna", "crispr", "biologi",
    "fotovoltaik", "panel surya", "energi terbarukan", "kendaraan listrik",
    "ev", "tesla", "byd", "baterai", "lithium", "nikel",
  ],
  "olahraga": [
    "olahraga", "sport", "atlet", "pertandingan", "kompetisi", "turnamen",
    "liga", "championship", "olimpiade", "olympic", "sea games", "asian games",
    "sepak bola", "football", "soccer", "bola", "timnas", "tim nasional",
    "liga 1", "liga champions", "premier league", "la liga", "bundesliga",
    "manchester united", "liverpool", "real madrid", "barcelona", "psg",
    "persija", "persib", "arema", "bali united", "persipura", "psm makassar",
    "bulu tangkis", "badminton", "pb pbsi", "all england", "thomas cup",
    "ubers cup", "indonesia open", "jonatan", "anthony sinisuka", "aps",
    "apsl", "aps indonesia", "greysia", "apriyani", "fajar", "rian",
    "tenis", "tenis meja", "renang", "atletik", "maraton", "triathlon",
    "basket", "nba", "ibf", "voli", "volleyball", "futsal",
    "balap", "f1", "formula 1", "motogp", "moto3", "moto2",
    "tinju", "mma", "ufc", "one championship", "pencak silat", "karate",
    "e-sport", "esports", "gaming", "game", "mobile legends", "free fire",
    "dota", "valorant", "pubg", "pubg mobile",
  ],
  "kesehatan": [
    "kesehatan", "kesehatan masyarakat", "kemenkes", "kementerian kesehatan",
    "rumah sakit", "rsud", "puskesmas", "klinik", "dokter", "perawat",
    "pasien", "obat", "farmasi", "apotek", "bpom", "badan pengawas obat",
    "bpjs", "bpjs kesehatan", "jaminan kesehatan", "kartu sehat",
    "covid", "covid-19", "corona", "pandemi", "epidemi", "wabah",
    "virus", "bakteri", "infeksi", "penyakit", "kanker", "diabetes",
    "jantung", "stroke", "hipertensi", "asam urat", "kolesterol",
    "vaksin", "vaksinasi", "imunisasi", "booster", "herd immunity",
    "gizi", "stunting", "malnutrisi", "obesitas", "diet", "nutrisi",
    "kesehatan jiwa", "kesehatan mental", "depresi", "ansietas", "bipolar",
    "skizofrenia", "psikolog", "psikiater", "terapi", "konseling",
    "kesehatan ibu", "kehamilan", "persalinan", "bayi", "balita", "lansia",
  ],
  "pendidikan": [
    "pendidikan", "pendidikan tinggi", "dikti", "kemdikbud", "kemdikbudristek",
    "sekolah", "sd", "smp", "sma", "smk", "madrasah", "ponpes",
    "universitas", "institut", "politeknik", "akademi", "kampus",
    "mahasiswa", "mahasiswi", "dosen", "guru", "kepala sekolah", "rektor",
    "dekan", "kaprodi", "warek", "pembantu rektor", "senat universitas",
    "kurikulum", "kurikulum merdeka", "k13", "kurikulum 2013",
    "ujian", "un", "ujian nasional", "snbt", "snmpn", "utbk", "sbmptn",
    "beasiswa", "lpdp", "bidikmisi", "kip", "kartu indonesia pintar",
    "afd", "akreditasi", "ban-pt", "ban-sm", "mutu pendidikan",
    "literasi", "numerasi", "pisa", "timss", "kemdikbud", "ristek",
    "belajar dari rumah", "pjj", "pembelajaran jarak jauh", "daring", "online",
  ],
  "lingkungan-bencana": [
    "lingkungan", "bencana", "alam", "banjir", "banjir bandang", "banjir rob",
    "gempa", "gempa bumi", "tsunami", "longsor", "tanah longsor",
    "gunung meletus", "erupsi", "volcano", "kebakaran hutan", "karhutla",
    "kekeringan", "el nino", "la nina", "cuaca ekstrem", "badai", "topan",
    "siklon", "angin kencang", "hujan lebat", "hujan es", "puting beliung",
    "deforestasi", "penebangan liar", "illegal logging", "perambahan",
    "pencemaran", "polusi", "limbah", "sampah", "plastik", "emisi",
    "karbon", "gas rumah kaca", "perubahan iklim", "climate change",
    "pemanasan global", "global warming", "pencairan es", "naiknya muka air laut",
    "kebakaran", "kebakaran gedung", "kebakaran pemukiman", "ledakan gas",
    "kecelakaan", "kecelakaan lalu lintas", "kecelakaan kerja",
    "evakuasi", "pengungsi", "bantuan bencana", "bnpb", "bpbd",
    "penanggulangan", "mitigasi", "tanggap darurat", "rehabilitasi",
  ],
  "hiburan": [
    "hiburan", "entertainment", "film", "sinetron", "serial", "drama",
    "bioskop", "cinema", "box office", "festival film", "piala citra",
    "musik", "konser", "band", "penyanyi", "vokalis", "album", "single",
    "lagu", "playlist", "spotify", "youtube music", "apple music",
    "selebriti", "artis", "aktor", "aktris", "model", "influencer",
    "content creator", "youtuber", "tiktoker", "instagram", "tiktok",
    "gaming", "game", "esport", "esports", "mobile legends", "free fire",
    "konsol", "playstation", "xbox", "nintendo", "pc gaming", "steam",
    "komik", "manga", "anime", "manhwa", "webtoon", "novel", "buku",
    "teater", "pementasan", "stand up comedy", "komedi", "lawak",
    "k-pop", "kpop", "bts", "blackpink", "stray kids", "newjeans", "aespa",
    "hollywood", "netflix", "disney", "marvel", "dc", "star wars",
  ],
  "internasional": [
    "internasional", "dunia", "global", "luar negeri", "asing",
    "perang", "konflik", "invasi", "serangan", "pertempuran", "militer",
    "ukraina", "russia", "russian", "israel", "palestina", "gaza",
    "amerika", "amerika serikat", "united states", "usa", "washington",
    "china", "beijing", "jepang", "tokyo", "korea selatan", "seoul",
    "inggris", "london", "prancis", "paris", "jerman", "berlin",
    "india", "new delhi", "australia", "canberra", "brunei", "malaysia",
    "singapura", "filipina", "manila", "vietnam", "thailand", "myanmar",
    "timor leste", "asean", "pbb", "perserikatan bangsa-bangsa", "united nations",
    "nato", "g20", "g7", "apec", "forum asia", "diplomasi", "duta besar",
    "hub bilateral", "perjanjian", "treaty", "pakta", "embargo", "sanctions",
    "pengungsi", "imigran", "migran", "suaka", "asylum", "unhcr",
    "terorisme internasional", "isis", "al-qaeda", "jihad", "radikal",
  ],
};

export function detectCategoryByKeywords(title: string, description: string): string {
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

export async function detectCategoryByAI(title: string, description: string): Promise<string | null> {
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

    // Strip any quotes, backticks, or whitespace
    const slug = content
      .trim()
      .toLowerCase()
      .replace(/^["']+|["']+$/g, "")
      .replace(/^`+|`+$/g, "");

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

// ── AI article rewriting (Opsi C) ──

const REWRITE_SYSTEM_PROMPT = `Kamu adalah jurnalis profesional berbahasa Indonesia yang menulis ulang berita dari sumber lain dengan gaya jurnalistik yang segar, faktual, dan mudah dipahami.

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
10. Hasil akhir HARUS berupa teks berita siap publikasi, bukan ringkasan`;

async function rewriteArticle(title: string, description: string, sourceUrl: string): Promise<string | null> {
  const apiKey = process.env.LLM_API_KEY;
  const apiBase = process.env.LLM_API_BASE_URL;

  if (!apiKey || !apiBase) {
    return null;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000); // 30s for rewrite

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
          { role: "system", content: REWRITE_SYSTEM_PROMPT },
          {
            role: "user",
            content: `Judul: ${title}\nRingkasan sumber: ${description || "(tidak ada)"}}\nURL sumber: ${sourceUrl}\n\nTulis ulang berita ini dalam gaya jurnalistik Indonesia profesional.`,
          },
        ],
        max_tokens: 1500,
        temperature: 0.7,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!resp.ok) {
      console.error(`[RSS Rewrite] API error: ${resp.status}`);
      return null;
    }

    const data = (await resp.json()) as Record<string, unknown>;
    const choices = data.choices as Array<{ message: { content: string } }> | undefined;
    const content = choices?.[0]?.message?.content?.trim() || "";

    if (!content || content.length < 100) {
      console.warn(`[RSS Rewrite] Too short output, falling back to raw content`);
      return null;
    }

    return content;
  } catch (err) {
    clearTimeout(timeout);
    console.warn(`[RSS Rewrite] Error: ${(err as Error).message}`);
    return null;
  }
}

// ── Main categorization (AI → Keywords fallback) ──

export async function detectCategory(title: string, description: string): Promise<string> {
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

        // Try AI rewrite first, fallback to raw content
        let body = await rewriteArticle(item.title, description, item.link);
        if (!body) {
          body = truncate(plainContent, 2000);
        }

        await prisma.article.create({
          data: {
            slug,
            title: item.title,
            dek,
            body,
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
