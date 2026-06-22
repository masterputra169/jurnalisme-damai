import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  children: ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-[var(--color-tarum)] text-[var(--color-paper)] hover:bg-[#1c2f4e] active:translate-y-px",
  secondary:
    "bg-transparent text-[var(--color-ink)] border border-[var(--color-line)] hover:border-[var(--color-tarum)] hover:text-[var(--color-tarum)]",
  ghost:
    "bg-transparent text-[var(--color-ink)] hover:text-[var(--color-tarum)] underline-offset-4 hover:underline",
  danger:
    "bg-[var(--color-waspada)] text-[var(--color-paper)] hover:bg-[#6f2e23]",
};

export function Button({
  variant = "primary",
  className = "",
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium tracking-tight rounded-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${variantStyles[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}