import { WeaveDivider } from "@/components/weave/WeaveDivider";

interface Viewpoint {
  id: string;
  label: string;
  summary: string;
  sourceUrl: string | null;
}

interface BalancedViewpointBoxProps {
  viewpoints: Viewpoint[];
}

export function BalancedViewpointBox({ viewpoints }: BalancedViewpointBoxProps) {
  if (viewpoints.length === 0) return null;

  return (
    <aside
      aria-labelledby="sudut-pandang-heading"
      className="my-12 border-t border-b border-[var(--color-tarum)] py-8"
    >
      <p className="font-mono text-[11px] uppercase tracking-wider text-[var(--color-tarum)] mb-1">
        Sebelum ikut berdiskusi
      </p>
      <h2
        id="sudut-pandang-heading"
        className="font-display text-[24px] leading-tight mb-6"
      >
        Sudut Pandang Berimbang
      </h2>

      <div className="space-y-6">
        {viewpoints.map((vp, idx) => (
          <div key={vp.id} className="pl-4 border-l border-[var(--color-line)]">
            <h3 className="font-display text-[16px] font-semibold mb-2">
              {vp.label}
            </h3>
            <p className="font-body text-[var(--color-ink)]/85 leading-relaxed">
              {vp.summary}
            </p>
            {vp.sourceUrl && (
              <p className="font-mono text-[11px] mt-2 text-[var(--color-ink)]/60">
                Sumber:{" "}
                <a
                  href={vp.sourceUrl}
                  className="text-[var(--color-tarum)] underline-offset-2 hover:underline"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  {vp.sourceUrl}
                </a>
              </p>
            )}
            {idx < viewpoints.length - 1 && (
              <div className="mt-6 max-w-[200px] opacity-50">
                <WeaveDivider variant="giri" />
              </div>
            )}
          </div>
        ))}
      </div>
    </aside>
  );
}