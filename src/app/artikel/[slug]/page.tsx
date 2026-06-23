import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { WeaveDivider } from "@/components/weave/WeaveDivider";
import { BalancedViewpointBox } from "@/components/artikel/BalancedViewpointBox";
import { NewsArticleJsonLd } from "@/components/artikel/NewsArticleJsonLd";
import { getArticleBySlug } from "@/lib/articles";
import { formatTanggal } from "@/lib/format";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const { prisma } = await import("@/lib/prisma");
  const articles = await prisma.article.findMany({
    where: { status: "PUBLISHED", isSyndicated: false },
    select: { slug: true },
    take: 20,
  });
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return { title: "Artikel tidak ditemukan" };

  return {
    title: article.title,
    description: article.dek,
    openGraph: {
      title: article.title,
      description: article.dek,
      type: "article",
      publishedTime: article.publishedAt?.toISOString(),
    },
  };
}

export const revalidate = 300;

export const dynamicParams = true;

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article || article.status !== "PUBLISHED") notFound();

  const paragraphs = article.body.split("\n\n");

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <NewsArticleJsonLd
        title={article.title}
        dek={article.dek}
        publishedAt={article.publishedAt ?? article.createdAt}
        authorName={article.author.name}
        url={`/artikel/${article.slug}`}
      />

      <div className="grid gap-12 lg:grid-cols-[1fr_280px]">
        <article>
          <header className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <Link
                href={`/kategori/${article.category.slug}`}
                className="hover:opacity-80"
              >
                <Badge tone="tarum">{article.category.name}</Badge>
              </Link>
              <span className="font-mono text-[11px] uppercase tracking-wider text-[var(--color-ink)]/60">
                {formatTanggal(article.publishedAt)}
              </span>
            </div>

            <h1 className="font-display text-[42px] leading-[1.08] tracking-tight md:text-[56px]">
              {article.title}
            </h1>

            <p className="font-body text-xl text-[var(--color-ink)]/85 mt-6 leading-relaxed">
              {article.dek}
            </p>

            <div className="mt-6 max-w-[200px]">
              <WeaveDivider variant="tarum" />
            </div>

            <p className="mt-3 font-mono text-[11px] uppercase tracking-wider text-[var(--color-ink)]/50">
              oleh {article.author.name}
            </p>

            {article.sourceUrl && (
              <p className="mt-2 font-mono text-[11px] uppercase tracking-wider text-[var(--color-kunyit)]">
                Ringkasan dari{" "}
                <a
                  href={article.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="underline underline-offset-2 hover:text-[var(--color-tarum)] transition-colors"
                >
                  {article.sourceName || "sumber asli"}
                  <span className="ml-0.5 text-[9px]">↗</span>
                </a>
              </p>
            )}
          </header>

          <div className="prose-editor font-body text-[18px] leading-[1.7] text-[var(--color-ink)]/90 max-w-[68ch]">
            {paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>

          {article.tags.length > 0 && (
            <div className="mt-12 flex flex-wrap gap-2">
              <span className="font-mono text-[11px] uppercase tracking-wider text-[var(--color-ink)]/60 self-center mr-2">
                Tag:
              </span>
              {article.tags.map(({ tag }) => (
                <Badge key={tag.id} tone="neutral">
                  {tag.name}
                </Badge>
              ))}
            </div>
          )}
        </article>

        {/* Sticky sidebar: Balanced Viewpoints */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          {article.viewpoints.length > 0 && (
            <BalancedViewpointBox
              viewpoints={article.viewpoints.map((v) => ({
                id: v.id,
                label: v.label,
                summary: v.summary,
                sourceUrl: v.sourceUrl,
              }))}
            />
          )}
        </aside>
      </div>

      {article.thread && (
        <section
          id="diskusi"
          className="mt-16 pt-8 border-t border-[var(--color-line)]"
        >
          <p className="font-mono text-[11px] uppercase tracking-wider text-[var(--color-giri)] mb-1">
            Forum
          </p>
          <h2 className="font-display text-[24px] leading-tight">
            Lihat diskusi soal artikel ini
          </h2>
          <p className="font-body text-[var(--color-ink)]/80 mt-2">
            Forum ini mendorong kritik yang tajam dan berbasis sumber. Anda
            tidak harus login untuk membaca — login hanya untuk membalas.
          </p>
          <div className="mt-6 flex items-center gap-4 font-mono text-[11px] uppercase tracking-wider text-[var(--color-ink)]/60">
            <span>{article.thread._count.replies} balasan</span>
            <span aria-hidden>·</span>
            <span>3 jenis reaksi, bukan like/dislike</span>
          </div>
          <Link
            href={`/forum/${article.thread.id}`}
            className="inline-block mt-4 font-mono text-sm uppercase tracking-wider text-[var(--color-giri)] hover:underline underline-offset-4 transition-colors"
          >
            Masuk diskusi →
          </Link>
        </section>
      )}
    </main>
  );
}