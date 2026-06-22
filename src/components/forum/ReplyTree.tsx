import { WeaveDivider } from "@/components/weave/WeaveDivider";
import { Badge } from "@/components/ui/Badge";
import { ReactionBar } from "@/components/forum/ReactionBar";
import { FlagButton, ReplyForm } from "@/components/forum/ReplyForm";
import type { ReplyNode } from "@/lib/forum";
import { formatTanggalPendek } from "@/lib/format";

interface ReplyTreeProps {
  nodes: ReplyNode[];
  threadId: string;
  depth?: number;
}

const MAX_DEPTH = 5;

export function ReplyTree({ nodes, threadId, depth = 0 }: ReplyTreeProps) {
  return (
    <ul className="space-y-6">
      {nodes.map((node) => (
        <li key={node.id}>
          <ReplyNodeView
            node={node}
            threadId={threadId}
            depth={depth}
          />
        </li>
      ))}
    </ul>
  );
}

function ReplyNodeView({
  node,
  threadId,
  depth,
}: {
  node: ReplyNode;
  threadId: string;
  depth: number;
}) {
  // Hitung jumlah reaksi per tipe
  const counts: Record<string, number> = {};
  for (const r of node.reactions) {
    counts[r.type] = (counts[r.type] ?? 0) + 1;
  }

  // sumber klaim faktual -> tandai dengan badge khusus
  const hasSource = !!node.sourceUrl;

  return (
    <article
      className={`pl-${Math.min(depth, MAX_DEPTH) * 4} relative`}
      aria-label={`Komentar oleh ${node.author.name}`}
    >
      {/* motif anyam indentasi — satu-satunya tempat motif anyam dipakai untuk reply,
          sesuai DESIGN.md §2: nested reply secara harfiah adalah jalinan suara. */}
      {depth > 0 && (
        <div className="absolute left-0 top-0 bottom-0 opacity-40 pointer-events-none">
          <WeaveDivider variant={depth % 2 === 0 ? "tarum" : "giri"} />
        </div>
      )}

      <div
        className="border-l-2 pl-4 py-1"
        style={{
          borderColor:
            depth % 2 === 0 ? "var(--color-tarum)" : "var(--color-giri)",
        }}
      >
        <header className="flex items-center gap-3 mb-2 flex-wrap">
          <span className="font-display text-[14px] font-semibold">
            {node.author.name}
          </span>
          <span className="font-mono text-[11px] uppercase tracking-wider text-[var(--color-ink)]/60">
            {formatTanggalPendek(node.createdAt)}
          </span>
          {hasSource && <Badge tone="giri">Dengan sumber</Badge>}
        </header>

        <div
          className="font-body text-[16px] leading-relaxed text-[var(--color-ink)]/90 [&_a]:text-[var(--color-tarum)] [&_a]:underline [&_blockquote]:border-l-2 [&_blockquote]:border-[var(--color-line)] [&_blockquote]:pl-3 [&_blockquote]:italic [&_code]:font-mono [&_code]:text-sm [&_code]:bg-[var(--color-line)]/30 [&_code]:px-1 [&_code]:py-0.5"
          dangerouslySetInnerHTML={{ __html: node.content }}
        />

        {node.sourceUrl && (
          <p className="font-mono text-[11px] mt-2 text-[var(--color-ink)]/60">
            Sumber:{" "}
            <a
              href={node.sourceUrl}
              className="text-[var(--color-tarum)] hover:underline underline-offset-2"
              rel="noopener noreferrer"
              target="_blank"
            >
              {node.sourceUrl}
            </a>
          </p>
        )}

        <div className="flex items-center flex-wrap gap-3 mt-2">
          <ReactionBar
            replyId={node.id}
            initialCounts={counts}
            userEmail=""
          />
          <FlagButton replyId={node.id} />
        </div>

        {node.children.length > 0 && (
          <div className="mt-6">
            <ReplyTree
              nodes={node.children}
              threadId={threadId}
              depth={Math.min(depth + 1, MAX_DEPTH)}
            />
          </div>
        )}

        <details className="mt-3">
          <summary className="font-mono text-[11px] uppercase tracking-wider text-[var(--color-ink)]/60 cursor-pointer hover:text-[var(--color-giri)]">
            Balas komentar ini
          </summary>
          <div className="mt-2">
            <ReplyForm threadId={threadId} parentId={node.id} compact />
          </div>
        </details>
      </div>
    </article>
  );
}