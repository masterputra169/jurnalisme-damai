# Anyaman — Portal Jurnalisme Damai & Forum Diskusi

Aplikasi Next.js 15 yang menjadi artefak mata kuliah Pancasila. Portal berita dengan pendekatan jurnalisme damai, ditambah forum diskusi yang mendorong argumentasi kritis tanpa dehumanisasi.

**Demo:** https://jurnalisme-damai.vercel.app

Lihat docs di root (`../PRD.md`, `../DESIGN.md`, dll) untuk konteks lengkap.

## Stack

| Layer | Implementasi |
|---|---|
| Framework | Next.js 15.5 (App Router, Server Components, ISR) |
| Bahasa | TypeScript 5 |
| Styling | Tailwind CSS v4 + token CSS custom dari `DESIGN.md` |
| Database | **PostgreSQL** (Supabase) via Prisma 7 |
| ORM | Prisma 7 + `@prisma/adapter-pg` (connection pooler) |
| Auth | Auth.js (NextAuth v5) |
| Validasi | Zod |
| Sanitasi HTML | sanitize-html |
| State | Server Components default; useTransition untuk optimistic UI |
| AI | OpenRouter (Claude) — auto-kategorisasi & rewrite artikel |

## Cara jalanin (development)

```bash
# install deps
npm install

# copy env
cp .env.example .env.local
# Isi DATABASE_URL (Supabase), AUTH_SECRET, AUTH_TRUST_HOST=true

# setup database + seed
npx prisma generate
npx prisma migrate dev --name init
npx tsx prisma/seed.ts

# dev server
npm run dev
# buka http://localhost:3000
```

## Cara jalanin (production build)

```bash
npm run build
npm run start
```

## Struktur folder

```
src/
  app/
    page.tsx                    # beranda — hero dua-benang + Titik Temu
    artikel/[slug]/page.tsx     # detail artikel + SPB + auto-create thread
    kategori/[slug]/page.tsx
    forum/page.tsx
    forum/[threadId]/page.tsx   # nested reply + motif anyam indentasi
    tentang/page.tsx            # halaman Metodologi (wajib, nilai akademik)
    login/page.tsx
    dashboard/
      artikel/page.tsx          # editor: kelola artikel + viewpoint
      moderasi/page.tsx         # editor: antrian Report
    api/
      cron/fetch-rss/route.ts   # Vercel Cron — auto-import RSS + AI classify
      vitals/route.ts           # web vitals receiver
    sitemap.ts
    robots.ts
    layout.tsx
    globals.css                 # token warna + font + animasi
  actions/
    forum.ts                    # createReply, flagReply, toggleReaction (anonymous)
    threads.ts                  # ensureThreadForArticle (idempotent)
    auth.ts                     # login/logout/getCurrentUser
  components/
    ui/                         # Button, Card, Badge, Input, Textarea
    weave/WeaveDivider.tsx      # SATU sumber motif anyam (DESIGN.md §2)
    artikel/                    # ArticleCard, BalancedViewpointBox, JSON-LD
    forum/                      # ReactionBar, ReplyForm, ReplyTree (anonymous)
    layout/                     # SiteHeader (sticky), SiteFooter, AccountMenu, AccountDropdown
  lib/
    prisma.ts                   # singleton Prisma client + pg adapter
    articles.ts, forum.ts       # query helpers (Server Component only)
    rss.ts                      # RSS fetch + AI categorize + rewrite + import
    format.ts                   # date-fns + locale Indonesia
    validations/forum.ts        # Zod schemas + needsFactSource heuristic
    moderation/sanitize.ts      # sanitize-html + in-memory rate limiter
prisma/
  schema.prisma                 # 18 kategori, nullable author/reporter (anonymous)
  seed.ts                       # 4 user, 5 kategori, 9 artikel, 3 thread nested
prisma.config.ts                # Prisma 7 config for migrations
middleware.ts                   # security headers (XFO, XCTO, RP, PP)
vercel.json                     # Vercel Cron schedule
```

## Akun demo (dari seed)

| Email | Role | Nama |
|---|---|---|
| `editor@anyaman.id` | EDITOR | Rani Wibowo |
| `kontributor@anyaman.id` | CONTRIBUTOR | Bagas Pratama |
| `pembaca@anyaman.id` | READER | Maya Lestari |
| `daniel@anyaman.id` | READER | Daniel Siahaan |

Login di `/login` (cukup email — bukan password, lihat catatan auth di bawah).

## Pemetaan nilai Pancasila → bukti di kode

| Nilai | Bukti konkret |
|---|---|
| Ketuhanan YME | Kategori `toleransi-kebhinekaan` punya liputan rutin (lihat `/kategori/toleransi-kebhinekaan`) |
| Kemanusiaan | Forum menolak dehumanisasi via `<FlagButton>` + SOP moderasi di `dashboard/moderasi` |
| Persatuan | Komponen `BalancedViewpointBox` wajib ≥2 entri untuk artikel kontroversial (lihat DATA-MODEL §3) |
| Musyawarah | 3 jenis reaksi (`STRONG_ARGUMENT`, `NEEDS_SOURCE`, `OTHER_PERSPECTIVE`) — bukan like/dislike |
| Keadilan sosial | Aksesibilitas: focus-visible, semantic HTML, prefers-reduced-motion, kontras token (paper #EEF0EA + ink #1C2B3A ≈ 12:1) |

## Kategori (18 total)

Politik, Sosial Budaya, Ekonomi, Klarifikasi/Cek Fakta, Opini, Hukum & Kriminal, Teknologi & Sains, Olahraga, Kesehatan, Pendidikan, Lingkungan & Bencana, Hiburan, Internasional, Infrastruktur & Transportasi, Otomotif, Properti, Wisata & Kuliner, Daerah.

## Fitur

- **Portal berita** — homepage editorial, halaman kategori, detail artikel dengan Sudut Pandang Berimbang
- **Forum diskusi** — thread per artikel (auto-create), reply bertingkat, 3 jenis reaksi, flag & moderasi
- **RSS auto-import** — fetch dari ANTARA, Republika, CNN Indonesia + AI categorize + rewrite
- **Anonymous participation** — reply, react, report tanpa login (nama tampil "Anonymous")
- **Dashboard moderasi** — antrian report, dismiss/action konten bermasalah
- **Performa** — ISR caching (60s homepage, 60s artikel), font `display: optional`, sticky header tanpa layout shift
- **JSON-LD** — `NewsArticle` schema per artikel untuk SEO

## Environment Variables

```bash
DATABASE_URL=          # Supabase PostgreSQL (pooler port 6543)
AUTH_SECRET=           # openssl rand -base64 32
AUTH_TRUST_HOST=true
NEXT_PUBLIC_SITE_URL=  # http://localhost:3000 (dev) atau URL production
CRON_SECRET=           # optional, untuk proteksi cron endpoint
LLM_API_KEY=           # OpenRouter API key
LLM_API_BASE_URL=      # https://openrouter.ai/api/v1
LLM_MODEL=             # model id (default: anthropic/claude-sonnet-4-20250514)
```

## Source code asal

Mulai sebagai 8 file `.md` spesifikasi di `../` (PRD, DESIGN, ARCHITECTURE, dll). Semua keputusan produk/visual/teknis terdokumentasi di sana. CLAUDE.md repo utama berisi instruksi operasional untuk AI agent.
