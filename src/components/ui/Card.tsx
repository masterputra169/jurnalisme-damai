import type { HTMLAttributes, ReactNode } from "react";

interface CardProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  as?: "article" | "section" | "div";
  interactive?: boolean;
}

export function Card({
  children,
  as: Tag = "section",
  interactive = false,
  className = "",
  ...rest
}: CardProps) {
  const base =
    "bg-[var(--color-paper)] border border-[var(--color-line)] p-6 transition-colors";
  const hover = interactive
    ? "hover:border-[var(--color-tarum)] hover:shadow-[0_1px_0_var(--color-tarum)]"
    : "";

  return (
    <Tag className={`${base} ${hover} ${className}`} {...rest}>
      {children}
    </Tag>
  );
}