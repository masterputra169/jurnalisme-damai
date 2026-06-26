"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { ReactionBar } from "@/components/forum/ReactionBar";
import { FlagButton, ReplyForm } from "@/components/forum/ReplyForm";
import type { ReplyNode } from "@/lib/forum";
import { formatTanggalPendek } from "@/lib/format";

interface ReplyTreeProps {
  nodes: ReplyNode[];
  threadId: string;
  userEmail?: string;
  depth?: number;
}

const MAX_DEPTH = 5;
const INDENT_PX = 20;

const DEPTH_COLORS = [
  "var(--color-tarum)",
  "var(--color-giri)",
  "var(--color-waspada)",
  "var(--color-tarum)",
  "var(--color-giri)",
];

export function ReplyTree({ nodes, threadId, userEmail, depth = 0 }: ReplyTreeProps) {
  return (
    <ul className="space-y-0">
      {nodes.map((node) => (
        <li key={node.id}>
          <ReplyNodeView
            node={node}
            threadId={threadId}
            userEmail={userEmail}
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
  userEmail,
  depth,
}: {
  node: ReplyNode;
  threadId: string;
  userEmail?: string;
  depth: number;
}) {
  const [showReply, setShowReply] = useState(false);

  const counts: Record<string, number> = {};
  for (const r of node.reactions) {
    counts[r.type] = (counts[r.type] ?? 0) + 1;
  }

  const hasSource = !!node.sourceUrl;
  const effectiveDepth = Math.min(depth, MAX_DEPTH);
  const borderColor = DEPTH_COLORS[effectiveDepth % DEPTH_COLORS.length];
  const indentLeft = effectiveDepth * INDENT_PX;

  return (
    <article aria-label={`Komentar oleh ${node.author?.name ?? "Anonim"}`}>
      {/* Main comment card */}
      <div
        className="border-l-2 py-4 pr-2 transition-colors"
        style={{
          marginLeft: `${indentLeft}px`,
          borderColor,
          paddingLeft: "16px",
        }}
      >
        {/* Header */}
        <header className="flex items-center gap-2 mb-2 flex-wrap">
          <span className="font-display text-[13px] font-semibold tracking-tight">
            {node.author?.name ?? "Anonim"}
          </span>
          <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--color-ink)]/50">
            {formatTanggalPendek(node.createdAt)}
          </span>
          {hasSource && (
            <Badge tone="giri" className="text-[10px]">
              Dengan sumber
            </Badge>
          )}
          {node.isHidden && (
            <Badge tone="waspada" className="text-[10px]">
              Disembunyikan
            </Badge>
          )}
        </header>

        {/* Content */}
        {node.isHidden ? (
          <p className="font-body text-[14px] italic text-[var(--color-ink)]/40 mb-2">
            Komentar ini disembunyikan oleh moderator.
          </p>
        ) : (
          <div
            className="font-body text-[15px] leading-relaxed text-[var(--color-ink)]/90 mb-2
              [&_a]:text-[var(--color-tarum)] [&_a]:underline [&_a]:underline-offset-2
              [&_blockquote]:border-l-2 [&_blockquote]:border-[var(--color-line)] [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:text-[var(--color-ink)]/70
              [&_code]:font-mono [&_code]:text-[13px] [&_code]:bg-[var(--color-line)]/40 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded-sm
              [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5
              [&_p+p]:mt-2"
            dangerouslySetInnerHTML={{ __html: node.content }}
          />
        )}

        {/* Source link */}
        {node.sourceUrl && !node.isHidden && (
          <p className="font-mono text-[10px] mt-1 mb-2 text-[var(--color-ink)]/50">
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

        {/* Actions row */}
        <div className="flex items-center flex-wrap gap-3 mt-1">
          <ReactionBar
            replyId={node.id}
            initialCounts={counts}
            userEmail={userEmail ?? ""}
          />
          <div className="flex items-center gap-2 ml-auto">
            <FlagButton replyId={node.id} />
            <button
              type="button"
              onClick={() => setShowReply((v) => !v)}
              className="font-mono text-[10px] uppercase tracking-wider text-[var(--color-ink)]/50 hover:text-[var(--color-giri)] transition-colors"
              aria-expanded={showReply}
            >
              {showReply ? "Tutup" : "Balas"}
            </button>
          </div>
        </div>

        {/* Inline reply form */}
        {showReply && (
          <div className="mt-3 pt-3 border-t border-[var(--color-line)]/60">
            <ReplyForm
              threadId={threadId}
              parentId={node.id}
              defaultEmail={userEmail ?? ""}
              compact
            />
          </div>
        )}
      </div>

      {/* Children */}
      {node.children.length > 0 && (
        <ReplyTree
          nodes={node.children}
          threadId={threadId}
          userEmail={userEmail}
          depth={Math.min(depth + 1, MAX_DEPTH)}
        />
      )}
    </article>
  );
}
