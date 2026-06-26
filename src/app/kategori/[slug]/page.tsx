import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleCard } from "@/components/artikel/ArticleCard";
import { Badge } from "@/components/ui/Badge";
import { SortBar } from "@/components/ui/SortBar";
import { prisma } from "@/lib/prisma";
import type { SortOption } from "@/components/ui/SortBar";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ sort?: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const cat = await prisma.category.findUnique({ where: { slug } });
  if (!cat) return { title: "Kategori tidak ditemukan" };
  return {
    title: `Kategori: ${cat.name}`,
    description: `Kumpulan artikel dalam kategori ${cat.name}.`,
  };
}

export const revalidate = 60;

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { sort } = await searchParams;
  const sortOption: SortOption = sort === "replies" ? "replies" : "date";

  const category = await prisma.category.findUnique({ where: { slug } });
  if (!category) notFound();

  const articles = await prisma.article.findMany({
    where: { status: "PUBLISHED", categoryId: category.id },
    orderBy:
      sortOption === "replies"
        ? { thread: { replies: { _count: "desc" } } }
        : { publishedAt: "desc" },
    include: {
      category: { select: { name: true, slug: true } },
      author: { select: { name: true } },
      thread: { select: { _count: { select: { replies: true } } } },
    },
  });

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <div className="flex items-center gap-3 mb-3">
        <Badge tone="tarum">Kategori</Badge>
      </div>
      <h1 className="font-display text-[40px] leading-tight tracking-tight mb-2">
        {category.name}
      </h1>
      <p className="font-body text-[var(--color-ink)]/75 mb-8">
        {articles.length} artikel dalam kategori ini.
      </p>

      <div className="mb-8">
        <Suspense fallback={null}>
          <SortBar current={sortOption} />
        </Suspense>
      </div>

      {articles.length === 0 ? (
        <p className="font-body text-[var(--color-ink)]/70 italic">
          Belum ada artikel dalam kategori ini.
        </p>
      ) : (
        <div className="space-y-8">
          {articles.map((a) => (
            <ArticleCard
              key={a.id}
              slug={a.slug}
              title={a.title}
              dek={a.dek}
              categoryName={a.category.name}
              publishedAt={a.publishedAt}
              replyCount={a.thread?._count.replies ?? 0}
            />
          ))}
        </div>
      )}
    </main>
  );
}
