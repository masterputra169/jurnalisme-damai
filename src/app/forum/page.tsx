import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { WeaveDivider } from "@/components/weave/WeaveDivider";
import { getAllThreads } from "@/lib/forum";
import { formatTanggal } from "@/lib/format";

export const dynamic = "force-dynamic"; // forum: refresh manual

export default async function ForumIndexPage() {
  const threads = await getAllThreads();

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <div className="flex items-center gap-3 mb-3">
        <Badge tone="giri">Forum</Badge>
      </div>
      <h1 className="font-display text-[40px] leading-tight tracking-tight mb-3">
        Diskusi
      </h1>
      <p className="font-body text-[var(--color-ink)]/80 max-w-[68ch] mb-10">
        Forum ini mendorong kritik yang tajam dan berbasis sumber. Yang dilarang
        bukan ketajaman — yang dilarang adalah dehumanisasi. Reaksi di sini
        menilai kualitas argumen, bukan popularitas.
      </p>

      <div className="max-w-[200px] mb-10">
        <WeaveDivider variant="giri" />
      </div>

      {threads.length === 0 ? (
        <div className="border border-[var(--color-line)] p-8 text-center">
          <p className="font-body text-[var(--color-ink)]/80 italic">
            Belum ada yang membuka diskusi. Jadi yang pertama?
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-[var(--color-line)]">
          {threads.map((t) => (
            <li key={t.id} className="py-5">
              <div className="flex items-baseline gap-3 mb-1">
                {t.article ? (
                  <Badge tone="tarum">Terhubung artikel</Badge>
                ) : (
                  <Badge tone="giri">Diskusi bebas</Badge>
                )}
                <span className="font-mono text-[11px] uppercase tracking-wider text-[var(--color-ink)]/60">
                  {formatTanggal(t.createdAt)}
                </span>
                {t.isLocked && (
                  <span className="font-mono text-[11px] uppercase tracking-wider text-[var(--color-waspada)]">
                    · dikunci
                  </span>
                )}
              </div>
              <h2 className="font-display text-[22px] leading-tight mt-1">
                <Link
                  href={`/forum/${t.id}`}
                  className="hover:text-[var(--color-giri)] transition-colors"
                >
                  {t.title}
                </Link>
              </h2>
              <div className="flex items-center gap-3 mt-2 font-mono text-[11px] text-[var(--color-ink)]/60">
                <span>{t._count.replies} balasan</span>
                {t.article && (
                  <>
                    <span aria-hidden>·</span>
                    <span>
                      dari artikel:{" "}
                      <Link
                        href={`/artikel/${t.article.slug}`}
                        className="text-[var(--color-tarum)] hover:underline underline-offset-2"
                      >
                        {t.article.title}
                      </Link>
                    </span>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}