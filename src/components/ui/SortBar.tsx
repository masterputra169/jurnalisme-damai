"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useTransition } from "react";

export type SortOption = "date" | "replies";

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "date", label: "Terbaru" },
  { value: "replies", label: "Terbanyak Balasan" },
];

interface SortBarProps {
  current: SortOption;
}

export function SortBar({ current }: SortBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const handleSort = (value: SortOption) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", value);
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  return (
    <div className="flex items-center gap-2" aria-label="Urutkan">
      <span className="font-mono text-[11px] uppercase tracking-wider text-[var(--color-ink)]/50 mr-1">
        Urutkan:
      </span>
      {SORT_OPTIONS.map((opt) => {
        const isActive = current === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            disabled={isPending}
            onClick={() => handleSort(opt.value)}
            aria-pressed={isActive}
            className={[
              "px-3 py-1 font-mono text-[11px] uppercase tracking-wider border transition-colors disabled:opacity-50",
              isActive
                ? "border-[var(--color-giri)] text-[var(--color-giri)]"
                : "border-[var(--color-line)] text-[var(--color-ink)]/60 hover:border-[var(--color-tarum)] hover:text-[var(--color-tarum)]",
            ].join(" ")}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
