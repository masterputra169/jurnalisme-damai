import type { CSSProperties } from "react";

type WeaveVariant = "tarum" | "giri" | "crossed";

interface WeaveDividerProps {
  variant?: WeaveVariant;
  className?: string;
  animated?: boolean;
  ariaLabel?: string;
}

const TARUM = "var(--color-tarum)";
const GIRI = "var(--color-giri)";

export function WeaveDivider({
  variant = "crossed",
  className = "",
  animated = false,
  ariaLabel,
}: WeaveDividerProps) {
  const animationStyle: CSSProperties = animated
    ? { animation: "weave-draw 500ms cubic-bezier(0.16, 1, 0.3, 1) both" }
    : {};

  if (variant === "crossed") {
    return (
      <svg
        role={ariaLabel ? "img" : "presentation"}
        aria-label={ariaLabel}
        aria-hidden={ariaLabel ? undefined : true}
        viewBox="0 0 240 24"
        preserveAspectRatio="none"
        className={`block w-full h-6 ${className}`}
        style={animationStyle}
      >
        <line x1="0" y1="8" x2="240" y2="8" stroke={TARUM} strokeWidth="1" />
        <line x1="0" y1="16" x2="240" y2="16" stroke={GIRI} strokeWidth="1" />
        {/* over-under crossing at center */}
        <circle cx="120" cy="8" r="2.5" fill={TARUM} />
        <circle cx="120" cy="16" r="2.5" fill={GIRI} />
      </svg>
    );
  }

  const color = variant === "tarum" ? TARUM : GIRI;

  return (
    <svg
      role={ariaLabel ? "img" : "presentation"}
      aria-label={ariaLabel}
      aria-hidden={ariaLabel ? undefined : true}
      viewBox="0 0 240 8"
      preserveAspectRatio="none"
      className={`block w-full h-2 ${className}`}
      style={animationStyle}
    >
      <line x1="0" y1="4" x2="240" y2="4" stroke={color} strokeWidth="1" />
    </svg>
  );
}