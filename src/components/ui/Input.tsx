import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  describedById?: string;
}

export function Input({ label, error, id, describedById, className = "", ...rest }: InputProps) {
  const inputId = id ?? `input-${Math.random().toString(36).slice(2, 8)}`;
  const errorId = error ? `${inputId}-error` : undefined;
  const described = [describedById, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-[var(--color-ink)]">
          {label}
        </label>
      )}
      <input
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={described}
        className={`bg-transparent border border-[var(--color-line)] px-3 py-2 text-base text-[var(--color-ink)] placeholder:text-[var(--color-ink)]/40 focus:border-[var(--color-tarum)] focus:outline-none rounded-sm ${className}`}
        {...rest}
      />
      {error && (
        <p id={errorId} className="text-sm text-[var(--color-waspada)]">
          {error}
        </p>
      )}
    </div>
  );
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Textarea({ label, error, id, className = "", ...rest }: TextareaProps) {
  const inputId = id ?? `ta-${Math.random().toString(36).slice(2, 8)}`;
  const errorId = error ? `${inputId}-error` : undefined;

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-[var(--color-ink)]">
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={`bg-transparent border border-[var(--color-line)] px-3 py-2 text-base text-[var(--color-ink)] placeholder:text-[var(--color-ink)]/40 focus:border-[var(--color-tarum)] focus:outline-none rounded-sm min-h-[120px] ${className}`}
        {...rest}
      />
      {error && (
        <p id={errorId} className="text-sm text-[var(--color-waspada)]">
          {error}
        </p>
      )}
    </div>
  );
}