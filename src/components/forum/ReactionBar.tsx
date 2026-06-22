"use client";

import { useState, useTransition } from "react";
import { toggleReaction } from "@/actions/forum";

interface ReactionBarProps {
  replyId: string;
  initialCounts: Record<string, number>;
  userEmail: string;
}

const REACTIONS = [
  { type: "STRONG_ARGUMENT", label: "Argumen Kuat", color: "var(--color-giri)" },
  { type: "NEEDS_SOURCE", label: "Butuh Sumber", color: "var(--color-waspada)" },
  { type: "OTHER_PERSPECTIVE", label: "Bantu Lihat Sisi Lain", color: "var(--color-tarum)" },
] as const;

export function ReactionBar({ replyId, initialCounts, userEmail }: ReactionBarProps) {
  const [counts, setCounts] = useState<Record<string, number>>(initialCounts);
  const [active, setActive] = useState<Record<string, boolean>>({});
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleClick = (type: string) => {
    setError(null);
    const wasActive = !!active[type];
    // Optimistic
    setCounts((c) => ({ ...c, [type]: (c[type] ?? 0) + (wasActive ? -1 : 1) }));
    setActive((a) => ({ ...a, [type]: !a[type] }));

    startTransition(async () => {
      const result = await toggleReaction(replyId, userEmail, type as never);
      if (!result.ok) {
        // Rollback
        setCounts((c) => ({ ...c, [type]: (c[type] ?? 0) + (wasActive ? 1 : -1) }));
        setActive((a) => ({ ...a, [type]: wasActive }));
        setError(result.error);
      } else {
        setCounts((c) => ({ ...c, [type]: result.data.count }));
      }
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-2 mt-3">
      {REACTIONS.map((r) => {
        const isActive = !!active[r.type];
        const count = counts[r.type] ?? 0;
        return (
          <button
            key={r.type}
            type="button"
            disabled={pending}
            onClick={() => handleClick(r.type)}
            aria-pressed={isActive}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-mono uppercase tracking-wider border border-[var(--color-line)] hover:border-[var(--color-tarum)] transition-colors disabled:opacity-50 data-[active=true]:border-[var(--color-giri)] data-[active=true]:text-[var(--color-giri)]"
            data-active={isActive}
          >
            <span style={{ color: isActive ? r.color : "var(--color-ink)" }}>
              {r.label}
            </span>
            {count > 0 && <span className="text-[var(--color-ink)]/70">· {count}</span>}
          </button>
        );
      })}
      {error && (
        <span className="text-xs text-[var(--color-waspada)] ml-2">{error}</span>
      )}
    </div>
  );
}