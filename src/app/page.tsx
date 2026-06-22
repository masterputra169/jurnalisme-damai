import Link from "next/link";
import { WeaveDivider } from "@/components/weave/WeaveDivider";
import { Badge } from "@/components/ui/Badge";
import { ArticleCard } from "@/components/artikel/ArticleCard";
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

  // ambil thread dengan reply paling banyak sebagai "titik temu"
  const titikTemu = [...articles]
    .filter((a) => a._count.replies > 0)
    .sort((a, b) => b._count.replies - a._count.replies)
    .slice(0, 3);

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      {/* HERO dua-benang — sesuai wireframe DESIGN.md §3.3 */}
      <section className="grid gap-12 lg:grid-cols-[3fr_2fr] lg:gap-16">
        <article className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <Badge tone="tarum">{hero.category.name}</Badge>
            <span className="font-mono text-[11px] uppercase tracking-wider text-[var(--color-ink)]/60">
              {formatTanggal(hero.publishedAt)}
            </span>
          </div>
          <h1 className="font-display text-[42px] leading-[1.05] tracking-tight md:text-[52px]">
            <Link href={`/artikel/${hero.slug}`} className="hover:text-[var(--color-tarum)] transition-colors">
              {hero.title}
            </Link>
          </h1>
          <p className="font-body text-lg leading-relaxed text-[var(--color-ink)]/85 max-w-[68ch]">
            {hero.dek}
          </p>
          <div className="mt-4 max-w-[68ch]">
            <WeaveDivider variant="tarum" />
          </div>
          <Link
            href={`/artikel/${hero.slug}`}
            className="font-mono text-sm uppercase tracking-wider text-[var(--color-tarum)] hover:underline underline-offset-4 mt-3 self-start"
          >
            Baca selengkapnya →
          </Link>
        </article>

        <aside className="flex flex-col gap-4 border-l border-[var(--color-line)] pl-8">
          <div className="flex items-center gap-3">
            <Badge tone="giri">Forum · Titik Temu</Badge>
          </div>
          <h2 className="font-display text-[24px] leading-tight">
            <Link href={`/artikel/${hero.slug}`} className="hover:text-[var(--color-giri)] transition-colors">
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
            className="font-mono text-sm uppercase tracking-wider text-[var(--color-giri)] hover:underline underline-offset-4 mt-3 self-start"
          >
            Masuk diskusi →
          </Link>
        </aside>
      </section>

      {/* TITIK TEMU — artikel dengan diskusi paling konstruktif */}
      {titikTemu.length > 0 && (
        <section className="mt-20">
          <header className="flex items-end justify-between mb-6">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-wider text-[var(--color-kunyit)]">
                Titik Temu
              </p>
              <h2 className="font-display text-[24px] mt-1">
                Artikel dengan diskusi paling konstruktif
              </h2>
            </div>
          </header>
          <div className="grid gap-6 md:grid-cols-3">
            {titikTemu.map((a) => (
              <ArticleCard
                key={a.id}
                slug={a.slug}
                title={a.title}
                dek={a.dek}
                categoryName={a.category.name}
                publishedAt={a.publishedAt}
                replyCount={a._count.replies}
              />
            ))}
          </div>
        </section>
      )}

      {/* GRID BERITA + SIDEBAR */}
      <section className="mt-20 grid gap-12 lg:grid-cols-[2fr_1fr]">
        <div>
          <h2 className="font-display text-[24px] mb-6 pb-3 border-b border-[var(--color-line)]">
            Berita terbaru
          </h2>
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
              />
            ))}
          </div>
        </div>
        <aside>
          <h2 className="font-display text-[18px] mb-6 pb-3 border-b border-[var(--color-line)]">
            Kategori
          </h2>
          <ul className="space-y-3 font-mono text-sm">
            <li>
              <Link href="/kategori/politik" className="text-[var(--color-ink)] hover:text-[var(--color-tarum)]">
                Politik →
              </Link>
            </li>
            <li>
              <Link href="/kategori/sosial-budaya" className="text-[var(--color-ink)] hover:text-[var(--color-tarum)]">
                Sosial-Budaya →
              </Link>
            </li>
            <li>
              <Link href="/kategori/toleransi-kebhinekaan" className="text-[var(--color-ink)] hover:text-[var(--color-tarum)]">
                Toleransi &amp; Kebhinekaan →
              </Link>
            </li>
            <li>
              <Link href="/kategori/klarifikasi-cek-fakta" className="text-[var(--color-ink)] hover:text-[var(--color-tarum)]">
                Klarifikasi/Cek Fakta →
              </Link>
            </li>
            <li>
              <Link href="/kategori/opini" className="text-[var(--color-ink)] hover:text-[var(--color-tarum)]">
                Opini →
              </Link>
            </li>
          </ul>
        </aside>
      </section>
    </main>
  );
}