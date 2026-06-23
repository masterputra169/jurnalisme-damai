import { WeaveDivider } from "@/components/weave/WeaveDivider";
import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-[var(--color-line)]">
      <div className="mx-auto max-w-6xl px-6">
        <div className="py-10 grid gap-10 md:grid-cols-2 font-mono text-xs text-[var(--color-ink)]/70">
          <div>
            <p className="font-display text-lg text-[var(--color-ink)] mb-3 tracking-tight">Anyaman</p>
            <p className="font-body text-sm leading-relaxed text-[var(--color-ink)]/80">
              Portal jurnalisme damai & forum diskusi untuk kebhinekaan Indonesia.
            </p>
            <nav className="mt-4 flex gap-4">
              <Link href="/tentang" className="hover:text-[var(--color-tarum)] transition-colors">Metodologi</Link>
              <Link href="/forum" className="hover:text-[var(--color-tarum)] transition-colors">Forum</Link>
            </nav>
          </div>
          <div className="md:text-right">
            <p className="uppercase tracking-wider mb-3 text-[var(--color-ink)]/50">Tugas Kuliah</p>
            <p className="font-body text-sm leading-relaxed text-[var(--color-ink)]/80">
              Dibuat untuk mata kuliah Pancasila — penerapan nilai dalam produk digital.
            </p>
          </div>
        </div>
        <WeaveDivider variant="crossed" />
        <p className="text-center text-[10px] font-mono text-[var(--color-ink)]/40 py-4">
          &copy; {new Date().getFullYear()} Anyaman · Jurnalisme Damai
        </p>
      </div>
    </footer>
  );
}
