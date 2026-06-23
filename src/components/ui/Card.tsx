import type { HTMLAttributes, ReactNode } from "react";

interface CardProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  as?: "article" | "section" | "div";
  interactive?: boolean;
  elevated?: boolean;
}

export function Card({
  children,
  as: Tag = "section",
  interactive = false,
  elevated = false,
  className = "",
  ...rest
}: CardProps) {
  const base =
    "bg-[var(--color-paper)] border border-[var(--color-line)] p-6 transition-all duration-200";
  const hover = interactive
    ? "hover:border-[var(--color-tarum)] hover:shadow-[0_2px_8px_rgba(36,58,94,0.08)]"
    : "";
  const elevate = elevated
    ? "shadow-[0_2px_12px_rgba(28,43,58,0.06)] border-transparent"
    : "";

  return (
    <Tag className={`${base} ${hover} ${elevate} ${className}`} {...rest}>
      {children}
    </Tag>
  );
}