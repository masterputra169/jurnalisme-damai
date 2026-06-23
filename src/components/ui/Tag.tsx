interface TagProps {
  label: string;
  href?: string;
}

export function Tag({ label, href }: TagProps) {
  const base =
    "inline-flex items-center px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-wider border border-[var(--color-line)] text-[var(--color-ink)]/70 transition-colors";
  const interactive = href
    ? "hover:border-[var(--color-kunyit)] hover:text-[var(--color-kunyit)] cursor-pointer"
    : "";

  const content = <span>{label}</span>;

  if (href) {
    return (
      <a href={href} className={`${base} ${interactive}`}>
        {content}
      </a>
    );
  }

  return <span className={base}>{content}</span>;
}
