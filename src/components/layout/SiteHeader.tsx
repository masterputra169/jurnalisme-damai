"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { WeaveDivider } from "@/components/weave/WeaveDivider";
import { AccountMenu } from "./AccountMenu";

const NAV_LINKS = [
  { href: "/", label: "Berita" },
  { href: "/forum", label: "Forum" },
  { href: "/tentang", label: "Metodologi" },
];

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`border-b border-[var(--color-line)] bg-[var(--color-paper)] transition-[background-color,backdrop-filter,box-shadow,transform] duration-300 ${
        scrolled
          ? "fixed top-0 left-0 right-0 z-50 bg-[var(--color-paper)]/80 backdrop-blur-sm shadow-[0_1px_0_var(--color-line)]"
          : "relative"
      }`}
    >
      <div className="mx-auto max-w-6xl px-6 pt-8 pb-3">
        <div className="flex items-start justify-between gap-6">
          <Link href="/" className="group inline-flex flex-col gap-1">
            <span className="font-display text-[28px] leading-none font-semibold tracking-tight group-hover:text-[var(--color-tarum)] transition-colors">
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
                      className="relative text-[var(--color-ink)] hover:text-[var(--color-tarum)] transition-colors after:absolute after:bottom-[-2px] after:left-0 after:h-px after:w-0 after:bg-[var(--color-tarum)] after:transition-[width] after:duration-300 hover:after:w-full"
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

        {/* two-strand weave under logo */}
        <div className={`mt-4 transition-opacity duration-300 ${scrolled ? "opacity-40" : ""}`}>
          <WeaveDivider variant="crossed" />
        </div>
      </div>
    </header>
  );
}
