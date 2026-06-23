import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { formatTanggalPendek } from "@/lib/format";

interface ArticleCardProps {
  slug: string;
  title: string;
  dek: string;
  categoryName: string;
  publishedAt: Date | null;
  replyCount?: number;
  variant?: "default" | "compact";
  isSyndicated?: boolean;
  sourceName?: string | null;
}

export function ArticleCard({
  slug,
  title,
  dek,
  categoryName,
  publishedAt,
  replyCount = 0,
  variant = "default",
  isSyndicated = false,
  sourceName,
}: ArticleCardProps) {
  return (
    <article
      className={`group border-b border-[var(--color-line)] pb-6 transition-colors hover:border-[var(--color-tarum)] animate-slide-left ${
        variant === "compact" ? "" : ""
      }`}
    >
      <div className="flex items-center gap-3 mb-2">
        <Badge tone="tarum">{categoryName}</Badge>
        {isSyndicated && (
          <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--color-kunyit)]">
            Ringkasan: {sourceName || "RSS"}
          </span>
        )}
        <span className="font-mono text-[11px] uppercase tracking-wider text-[var(--color-ink)]/60">
          {formatTanggalPendek(publishedAt)}
        </span>
        {replyCount > 0 && (
          <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--color-giri)]">
            {replyCount} balasan
          </span>
        )}
      </div>
      <h3
        className={`font-display font-semibold leading-tight tracking-tight group-hover:text-[var(--color-tarum)] transition-colors ${
          variant === "compact" ? "text-[16px]" : "text-[22px]"
        }`}
      >
        <Link href={`/artikel/${slug}`}>{title}</Link>
      </h3>
      <p
        className={`font-body text-[var(--color-ink)]/80 mt-2 leading-relaxed ${
          variant === "compact" ? "text-sm line-clamp-2" : "text-base line-clamp-3"
        }`}
      >
        {dek}
      </p>
    </article>
  );
}