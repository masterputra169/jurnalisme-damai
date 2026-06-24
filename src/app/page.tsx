import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { ArticleCard } from "@/components/artikel/ArticleCard";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { getPublishedArticles } from "@/lib/articles";
import { formatTanggal } from "@/lib/format";

export const revalidate = 60;

export default async function Home() {
  const articles = await getPublishedArticles(20);
  if (articles.length === 0) {
    return (
      <main className="mx-auto max-w-6xl px-6 py-16">
        <p className="font-body text-lg">Belum ada artikel yang diterbitkan.</p>
      </main>
    );
  }

  const [hero, ...rest] = articles;
  const heroThread = hero._count.replies;

  const titikTemu = [...articles]
    .filter((a) => a._count.replies > 0)
    .sort((a, b) => b._count.replies - a._count.replies)
    .slice(0, 3);

  return (
    <main className="mx-auto max-w-6xl px-6 anyaman-bg">
      {/* HERO — editorial lead story */}
      <section className="grid gap-12 lg:grid-cols-[3fr_2fr] lg:gap-16 pt-16 pb-16 relative z-10">
        <article className="flex flex-col gap-5">
          <div className="flex items-center gap-3">
            <Badge tone="tarum">{hero.category.name}</Badge>
            <span className="font-mono text-[11px] uppercase tracking-wider text-[var(--color-ink)]/60">
              {formatTanggal(hero.publishedAt)}
            </span>
          </div>
          <h1 className="font-display text-[44px] leading-[1.05] tracking-tight md:text-[56px]">
            <Link href={`/artikel/${hero.slug}`} className="hover:text-[var(--color-tarum)] transition-colors duration-300">
              {hero.title}
            </Link>
          </h1>
          <p className="font-body text-lg leading-relaxed text-[var(--color-ink)]/85 max-w-[68ch]">
            {hero.dek}
          </p>
          <Link
            href={`/artikel/${hero.slug}`}
            className="font-mono text-sm uppercase tracking-wider text-[var(--color-tarum)] hover:underline underline-offset-4 mt-3 self-start transition-colors"
          >
            Baca selengkapnya →
          </Link>
        </article>

        <aside className="flex flex-col gap-4 border-l border-[var(--color-line)] pl-8">
          <div className="flex items-center gap-3">
            <Badge tone="giri">Forum · Titik Temu</Badge>
          </div>
          <h2 className="font-display text-[22px] leading-tight">
            <Link href={`/artikel/${hero.slug}`} className="hover:text-[var(--color-giri)] transition-colors duration-300">
              Diskusi yang sedang produktif di portal ini
            </Link>
          </h2>
          <p className="font-body text-base text-[var(--color-ink)]/80">
            {heroThread} balasan masuk untuk artikel &ldquo;{hero.title}&rdquo;.
            Forum ini memprioritaskan argumen yang mengkritik substansi, bukan
            yang paling banyak disukai.
          </p>
          <div className="flex items-center gap-4 font-mono text-[11px] uppercase tracking-wider text-[var(--color-ink)]/60">
            <span>{heroThread} balasan</span>
            <span aria-hidden>·</span>
            <span>Bahasa sopan, kritik tajam</span>
          </div>
          <Link
            href={`/artikel/${hero.slug}#diskusi`}
            className="font-mono text-sm uppercase tracking-wider text-[var(--color-giri)] hover:underline underline-offset-4 mt-3 self-start transition-colors"
          >
            Masuk diskusi →
          </Link>
        </aside>
      </section>

      {/* TITIK TEMU — asymmetric bento grid */}
      {titikTemu.length > 0 && (
        <ScrollReveal className="mt-16">
          <section>
            <header className="mb-8">
              <p className="font-mono text-[11px] uppercase tracking-wider text-[var(--color-kunyit)]">
                Titik Temu
              </p>
              <h2 className="font-display text-[28px] mt-1">
                Artikel dengan diskusi paling konstruktif
              </h2>
            </header>
            <div className="grid gap-6 md:grid-cols-[1.2fr_1fr_1fr]">
              {titikTemu.map((a, i) => (
                <ArticleCard
                  key={a.id}
                  slug={a.slug}
                  title={a.title}
                  dek={a.dek}
                  categoryName={a.category.name}
                  publishedAt={a.publishedAt}
                  replyCount={a._count.replies}
                  variant={i > 0 ? "compact" : "default"}
                  isSyndicated={a.isSyndicated}
                  sourceName={a.sourceName}
                />
              ))}
            </div>
          </section>
        </ScrollReveal>
      )}

      {/* GRID BERITA + SIDEBAR */}
      <ScrollReveal className="mt-16">
        <section className="grid gap-12 lg:grid-cols-[2fr_1fr] pb-20 relative z-10">
          <div>
            <header className="flex items-end justify-between mb-8">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-wider text-[var(--color-tarum)]">
                  Berita Terbaru
                </p>
                <h2 className="font-display text-[28px] mt-1">
                  Artikel terbaru
                </h2>
              </div>
            </header>
            <div className="space-y-8">
              {rest.slice(0, 6).map((a) => (
                <ArticleCard
                  key={a.id}
                  slug={a.slug}
                  title={a.title}
                  dek={a.dek}
                  categoryName={a.category.name}
                  publishedAt={a.publishedAt}
                  replyCount={a._count.replies}
                  isSyndicated={a.isSyndicated}
                  sourceName={a.sourceName}
                />
              ))}
            </div>
          </div>
          <aside className="lg:pl-8 lg:border-l lg:border-[var(--color-line)] grid-bg">
            <h2 className="font-display text-[18px] mb-6">
              Kategori
            </h2>
            <ul className="space-y-4 font-mono text-sm">
              {[
                { slug: "politik", label: "Politik" },
                { slug: "sosial-budaya", label: "Sosial Budaya" },
                { slug: "ekonomi", label: "Ekonomi" },
                { slug: "hukum-kriminal", label: "Hukum & Kriminal" },
                { slug: "teknologi-sains", label: "Teknologi & Sains" },
                { slug: "olahraga", label: "Olahraga" },
                { slug: "kesehatan", label: "Kesehatan" },
                { slug: "pendidikan", label: "Pendidikan" },
                { slug: "lingkungan-bencana", label: "Lingkungan & Bencana" },
                { slug: "hiburan", label: "Hiburan" },
                { slug: "internasional", label: "Internasional" },
                { slug: "klarifikasi-cek-fakta", label: "Klarifikasi / Cek Fakta" },
                { slug: "opini", label: "Opini" },
              ].map((cat) => (
                <li key={cat.slug}>
                  <Link
                    href={`/kategori/${cat.slug}`}
                    className="group flex items-center gap-2 text-[var(--color-ink)] hover:text-[var(--color-tarum)] transition-colors"
                  >
                    <span className="inline-block w-3 h-px bg-[var(--color-line)] group-hover:w-5 group-hover:bg-[var(--color-tarum)] transition-all duration-300" />
                    <span>{cat.label}</span>
                    <span className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300">→</span>
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-10 pt-8 border-t border-[var(--color-line)]">
              <p className="font-mono text-[10px] uppercase tracking-wider text-[var(--color-ink)]/50 mb-4">
                Metodologi
              </p>
              <Link href="/tentang" className="font-body text-sm text-[var(--color-ink)]/70 hover:text-[var(--color-tarum)] transition-colors">
                Tentang jurnalisme damai dan cara kerja kami →
              </Link>
            </div>
          </aside>
        </section>
      </ScrollReveal>
    </main>
  );
}
