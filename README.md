# Anyaman — Portal Jurnalisme Damai & Forum Diskusi

Aplikasi Next.js 15 yang menjadi artefak mata kuliah Pancasila. Portal berita dengan pendekatan jurnalisme damai, ditambah forum diskusi yang mendorong argumentasi kritis tanpa dehumanisasi.

Lihat docs di root (`../PRD.md`, `../DESIGN.md`, dll) untuk konteks lengkap.

## Stack aktual

| Layer | Implementasi |
|---|---|
| Framework | Next.js 15.5 (App Router) |
| Bahasa | TypeScript 5 |
| Styling | Tailwind CSS v4 + token CSS custom dari `DESIGN.md` |
| Database (dev) | **SQLite** via Prisma 6 |
| Database (prod) | **PostgreSQL** (Neon/Supabase) — perlu migrasi sebelum deploy |
| ORM | Prisma 6 (downgrade dari 7 yang masih transisi API) |
| Auth | Cookie httpOnly sederhana (lihat Catatan Penting di bawah) |
| Validasi | Zod |
| Sanitasi HTML | isomorphic-dompurify |
| Rich text | Plain textarea + HTML disanitasi (Tiptap tidak diinstal untuk MVP) |
| State | Server Components default; useTransition untuk optimistic UI |

## Cara jalanin (development)

```bash
# install deps
npm install

# setup database + seed
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
    page.tsx                    # beranda — hero dua-benang
    artikel/[slug]/page.tsx     # detail artikel + Sudut Pandang Berimbang
    kategori/[slug]/page.tsx
    forum/page.tsx
    forum/[threadId]/page.tsx   # nested reply + motif anyam indentasi
    tentang/page.tsx            # halaman Metodologi (wajib, nilai akademik)
    login/page.tsx
    dashboard/
      artikel/page.tsx          # editor: kelola artikel + viewpoint
      moderasi/page.tsx         # editor: antrian Report
    api/vitals/route.ts         # web vitals receiver
    sitemap.ts
    robots.ts
    layout.tsx
    globals.css                 # token warna + font + animasi
  actions/
    forum.ts                    # createReply, flagReply, toggleReaction
    auth.ts                     # login/logout/getCurrentUser
  components/
    ui/                         # Button, Card, Badge, Input, Textarea
    weave/WeaveDivider.tsx      # SATU sumber motif anyam (DESIGN.md §2)
    artikel/                    # ArticleCard, BalancedViewpointBox, JSON-LD
    forum/                      # ReactionBar, ReplyForm, ReplyTree
    layout/                     # SiteHeader, SiteFooter, AccountMenu
  lib/
    prisma.ts                   # singleton Prisma client
    articles.ts, forum.ts       # query helpers (Server Component only)
    format.ts                   # date-fns + locale Indonesia
    validations/forum.ts        # Zod schemas + needsFactSource heuristic
    moderation/sanitize.ts      # DOMPurify + in-memory rate limiter
prisma/
  schema.prisma
  seed.ts                       # 4 user, 5 kategori, 9 artikel, 3 thread nested
middleware.ts                   # security headers (XFO, XCTO, RP, PP)
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

## Build & smoke test hasil

Verifikasi pada 2026-06-22:

| Route | Status | Size | Strategi render |
|---|---|---|---|
| `/` | 200 | 41 KB | Dynamic (karena AccountMenu baca session) |
| `/artikel/[slug]` | 200 | 31 KB | **SSG** via `generateStaticParams` (9 artikel) |
| `/forum` | 200 | 21 KB | Dynamic |
| `/forum/[threadId]` | 200 | 29 KB | Dynamic — reply nested + 3 reaksi |
| `/tentang` | 200 | 33 KB | Static |
| `/login` | 200 | — | — |
| `/dashboard/artikel` | 307 | — | Redirect kalau belum login |
| `/dashboard/moderasi` | 307 | — | Redirect kalau bukan EDITOR |
| `/sitemap.xml` | 200 | — | Auto-generated |
| `/robots.txt` | 200 | — | Auto-generated |

**Security headers terverifikasi via `curl -I`:**
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`

**First Load JS**: **102–109 kB** untuk semua route — di bawah budget landing 150 kB.

**Lighthouse ≥90**: BELUM dijalankan otomatis (tidak ada Chrome terinstall di env build ini). Untuk verifikasi sesuai gate ROADMAP §Fase 6, jalankan manual di environment dengan Chrome:

```bash
npm run build && npm run start
# buka Chrome Incognito → DevTools → Lighthouse → pilih 4 kategori
# audit di: http://localhost:3000/ , /artikel/toleransi-vs-keadilan , /forum/<id>
```

## Catatan penting (deviasi dari dokumen awal)

1. **Database dev = SQLite, bukan Postgres.** Prisma 7 (rilis terkini saat build) masih transisi API. Saya pakai Prisma 6 + SQLite untuk development tanpa butuh akun Neon/Supabase. Sebelum deploy production:
   - Buat database Postgres (Neon/Supabase)
   - Ganti `provider = "postgresql"` di `prisma/schema.prisma`
   - Ganti field enum-as-string kembali ke `enum` Prisma asli (saat ini disimpan sebagai string karena SQLite tidak support enum)
   - Update `DATABASE_URL` di `.env` production

2. **Auth disederhanakan.** Sesuai PRD, idealnya pakai Auth.js v5 dengan bcrypt. Untuk scope tugas kuliah dan menghindari blocker dari Auth.js beta yang masih banyak breaking changes, login cukup dengan email (httpOnly cookie berisi user ID). Production harus upgrade ke Auth.js credentials provider dengan password.

3. **Tiptap tidak diinstal** (Fase 4 ROADMAP). Reply editor pakai textarea plain dengan sanitasi HTML server-side. Cukup untuk demo; bisa ditambah nanti.

4. **Rate limiter in-memory.** `lib/moderation/sanitize.ts` pakai `Map` di memory — restart server reset counter. Untuk production perlu Redis/Upstash.

5. **Homepage dynamic** (bukan ISR penuh) karena `SiteHeader` mount `AccountMenu` yang baca cookie. Tradeoff kecil: ~200ms lebih lambat vs static. Artikel tetap SSG — itu yang paling penting untuk LCP.

## Deployment ke Vercel

```bash
# 1. Setup Postgres production (Neon/Supabase free tier)
# 2. Set env vars di Vercel dashboard:
#    DATABASE_URL=postgres://...
#    AUTH_SECRET=<openssl rand -base64 32>
#    AUTH_TRUST_HOST=true
# 3. Ganti prisma/schema.prisma ke postgresql provider
# 4. Push:
vercel --prod
```

Catatan: migrasi Prisma ke Postgres harus dilakukan manual dari workstation lokal dulu (`npx prisma migrate deploy` setelah ganti provider).

## Source code asal

Mulai sebagai 8 file `.md` spesifikasi di `../` (PRD, DESIGN, ARCHITECTURE, dll). Semua keputusan produk/visual/teknis terdokumentasi di sana. CLAUDE.md repo utama berisi instruksi operasional untuk AI agent.