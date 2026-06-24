import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { WeaveDivider } from "@/components/weave/WeaveDivider";
import { ReplyTree } from "@/components/forum/ReplyTree";
import { ReplyForm } from "@/components/forum/ReplyForm";
import { getThreadDetail } from "@/lib/forum";
import { formatTanggal } from "@/lib/format";

interface PageProps {
  params: Promise<{ threadId: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { threadId } = await params;
  const data = await getThreadDetail(threadId);
  if (!data) return { title: "Thread tidak ditemukan" };
  return { title: data.thread.title };
}

export const revalidate = 15; // cache 15s, cukup untuk reply baru

export default async function ThreadPage({ params }: PageProps) {
  const { threadId } = await params;
  const data = await getThreadDetail(threadId);
  if (!data) notFound();
  const { thread, roots } = data;

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <Badge tone="giri">Forum</Badge>
          <span className="font-mono text-[11px] uppercase tracking-wider text-[var(--color-ink)]/60">
            {formatTanggal(thread.createdAt)}
          </span>
          {thread.article && (
            <Link
              href={`/artikel/${thread.article.slug}`}
              className="font-mono text-[11px] uppercase tracking-wider text-[var(--color-tarum)] hover:underline underline-offset-2 transition-colors"
            >
              · {thread.article.title}
            </Link>
          )}
        </div>

        <h1 className="font-display text-[40px] leading-[1.08] tracking-tight md:text-[48px]">
          {thread.title}
        </h1>

        <div className="max-w-[200px] mt-6">
          <WeaveDivider variant="giri" />
        </div>
      </header>

      {thread.isLocked ? (
        <p className="font-body italic text-[var(--color-ink)]/70">
          Thread ini dikunci oleh moderator.
        </p>
      ) : roots.length === 0 ? (
        <div className="border border-[var(--color-line)] p-8 text-center mb-10">
          <p className="font-body text-[var(--color-ink)]/80 italic">
            Belum ada yang membuka diskusi ini. Jadi yang pertama?
          </p>
        </div>
      ) : (
        <div className="mb-12">
          <ReplyTree nodes={roots} threadId={threadId} />
        </div>
      )}

      {!thread.isLocked && (
        <section className="mt-12 pt-8 border-t border-[var(--color-line)]">
          <h2 className="font-display text-[20px] mb-4">Tulis balasan</h2>
          <ReplyForm threadId={threadId} />
        </section>
      )}
    </main>
  );
}