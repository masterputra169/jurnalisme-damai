import Link from "next/link";
import { WeaveDivider } from "@/components/weave/WeaveDivider";
import { AccountMenu } from "./AccountMenu";

const NAV_LINKS = [
  { href: "/", label: "Berita" },
  { href: "/forum", label: "Forum" },
  { href: "/tentang", label: "Metodologi" },
];

export function SiteHeader() {
  return (
    <header className="border-b border-[var(--color-line)] bg-[var(--color-paper)]">
      <div className="mx-auto max-w-6xl px-6 pt-8 pb-3">
        <div className="flex items-start justify-between gap-6">
          <Link href="/" className="group inline-flex flex-col gap-1">
            <span className="font-display text-[28px] leading-none font-semibold tracking-tight">
              Anyaman
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-ink)]/60">
              Jurnalisme Damai · Ruang Diskusi
            </span>
          </Link>

          <div className="flex flex-col items-end gap-3">
            <nav aria-label="Navigasi utama" className="hidden md:block">
              <ul className="flex items-center gap-6 font-mono text-xs uppercase tracking-wider">
                {NAV_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-[var(--color-ink)] hover:text-[var(--color-tarum)] transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <AccountMenu />
          </div>
        </div>

        {/* two-strand weave under logo — single source of truth untuk motif anyam */}
        <div className="mt-4">
          <WeaveDivider variant="crossed" />
        </div>
      </div>
    </header>
  );
}