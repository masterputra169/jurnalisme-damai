"use client";

import { useState, useEffect, type ReactNode } from "react";

interface StickyHeaderProps {
  children: ReactNode;
  topNav: ReactNode;
  accountSlot: ReactNode;
}

export function StickyHeader({ children, topNav, accountSlot }: StickyHeaderProps) {
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
          ? "fixed top-0 left-0 right-0 z-50 bg-[var(--color-paper)]/80 backdrop-blur-sm shadow-[0_1px_0_var(--color-line)] before:absolute before:top-0 before:left-0 before:right-0 before:h-[3px] before:bg-[var(--color-kunyit)]"
          : "relative before:absolute before:top-0 before:left-0 before:right-0 before:h-[3px] before:bg-[var(--color-kunyit)]"
      }`}
    >
      <div className="mx-auto max-w-6xl px-6 pt-8 pb-3">
        <div className="flex items-start justify-between gap-6">
          {children}
          <div className="flex items-center gap-6">
            {topNav}
            {accountSlot}
          </div>
        </div>
      </div>
    </header>
  );
}
