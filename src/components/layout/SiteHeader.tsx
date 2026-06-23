import Link from "next/link";
import { AccountMenu } from "./AccountMenu";
import { StickyHeader } from "./StickyHeader";

const NAV_LINKS = [
  { href: "/", label: "Berita" },
  { href: "/forum", label: "Forum" },
  { href: "/tentang", label: "Metodologi" },
];

export function SiteHeader() {
  return (
    <StickyHeader
      topNav={
        <nav aria-label="Navigasi utama" className="hidden md:block">
          <ul className="flex items-center gap-6 font-mono text-xs uppercase tracking-wider">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="relative text-[var(--color-ink)] hover:text-[var(--color-tarum)] transition-colors after:absolute after:bottom-[-2px] after:left-0 after:h-px after:w-0 after:bg-[var(--color-tarum)] after:transition-[width] after:duration-300 hover:after:w-full"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      }
      accountSlot={<AccountMenu />}
    >
      <Link href="/" className="group inline-flex flex-col gap-1">
        <span className="font-display text-[28px] leading-none font-semibold tracking-tight group-hover:text-[var(--color-tarum)] transition-colors">
          Anyaman
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-ink)]/60">
          Jurnalisme Damai · Ruang Diskusi
        </span>
      </Link>
    </StickyHeader>
  );
}
