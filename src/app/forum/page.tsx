import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { WeaveDivider } from "@/components/weave/WeaveDivider";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { getAllThreads } from "@/lib/forum";
import { formatTanggal } from "@/lib/format";

export const revalidate = 30;

export default async function ForumIndexPage() {
  const threads = await getAllThreads();

  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <ScrollReveal>
        <header className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <Badge tone="giri">Forum</Badge>
          </div>
          <h1 className="font-display text-[44px] leading-tight tracking-tight md:text-[52px]">
            Diskusi
          </h1>
          <p className="font-body text-[var(--color-ink)]/80 max-w-[68ch] mt-3 text-lg">
            Forum ini mendorong kritik yang tajam dan berbasis sumber. Yang dilarang
            bukan ketajaman — yang dilarang adalah dehumanisasi. Reaksi di sini
            menilai kualitas argumen, bukan popularitas.
          </p>
        </header>

        <div className="max-w-[200px] mb-10">
          <WeaveDivider variant="giri" />
        </div>
      </ScrollReveal>

      {threads.length === 0 ? (
        <div className="border border-[var(--color-line)] p-8 text-center">
          <p className="font-body text-[var(--color-ink)]/80 italic">
            Belum ada yang membuka diskusi. Jadi yang pertama?
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-[var(--color-line)]">
          {threads.map((t, i) => (
            <li
              key={t.id}
              className="py-6 animate-slide-left"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className="flex items-baseline gap-3 mb-2">
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
              <h2 className="font-display text-[24px] leading-tight mt-1 group-hover:text-[var(--color-giri)]">
                <Link
                  href={`/forum/${t.id}`}
                  className="hover:text-[var(--color-giri)] transition-colors duration-300"
                >
                  {t.title}
                </Link>
              </h2>
              <div className="flex items-center gap-3 mt-3 font-mono text-[11px] text-[var(--color-ink)]/60">
                <span className="text-[var(--color-giri)]">{t._count.replies} balasan</span>
                {t.article && (
                  <>
                    <span aria-hidden>·</span>
                    <span>
                      dari{" "}
                      <Link
                        href={`/artikel/${t.article.slug}`}
                        className="text-[var(--color-tarum)] hover:underline underline-offset-2 transition-colors"
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
