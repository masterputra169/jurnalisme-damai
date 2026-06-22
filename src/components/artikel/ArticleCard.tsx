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
}

export function ArticleCard({
  slug,
  title,
  dek,
  categoryName,
  publishedAt,
  replyCount = 0,
  variant = "default",
}: ArticleCardProps) {
  return (
    <article
      className={`group border-t border-[var(--color-line)] pt-4 transition-colors hover:border-[var(--color-tarum)] ${
        variant === "compact" ? "pb-4" : "pb-6"
      }`}
    >
      <div className="flex items-center gap-3 mb-2">
        <Badge tone="tarum">{categoryName}</Badge>
        <span className="font-mono text-[11px] uppercase tracking-wider text-[var(--color-ink)]/60">
          {formatTanggalPendek(publishedAt)}
        </span>
      </div>
      <h3
        className={`font-display font-semibold leading-tight tracking-tight group-hover:text-[var(--color-tarum)] transition-colors ${
          variant === "compact" ? "text-[16px]" : "text-[20px]"
        }`}
      >
        <Link href={`/artikel/${slug}`}>{title}</Link>
      </h3>
      <p
        className={`font-body text-[var(--color-ink)]/80 mt-2 ${
          variant === "compact" ? "text-sm line-clamp-2" : "text-base"
        }`}
      >
        {dek}
      </p>
      {replyCount > 0 && (
        <p className="font-mono text-[11px] mt-3 text-[var(--color-giri)]">
          {replyCount} balasan di forum
        </p>
      )}
    </article>
  );
}