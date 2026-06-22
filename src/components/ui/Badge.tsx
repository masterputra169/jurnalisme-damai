import type { ReactNode } from "react";

type BadgeTone = "tarum" | "giri" | "kunyit" | "waspada" | "neutral";

interface BadgeProps {
  children: ReactNode;
  tone?: BadgeTone;
  className?: string;
}

const toneStyles: Record<BadgeTone, string> = {
  tarum: "text-[var(--color-tarum)] border-[var(--color-tarum)]",
  giri: "text-[var(--color-giri)] border-[var(--color-giri)]",
  kunyit: "text-[var(--color-kunyit)] border-[var(--color-kunyit)]",
  waspada: "text-[var(--color-waspada)] border-[var(--color-waspada)]",
  neutral: "text-[var(--color-ink)] border-[var(--color-line)]",
};

export function Badge({ children, tone = "neutral", className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 text-[11px] uppercase tracking-wider font-mono border ${toneStyles[tone]} ${className}`}
    >
      {children}
    </span>
  );
}