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

// Warna aksen per level kedalaman — bergantian tarum/giri
const ACCENT: string[] = [
  "var(--color-tarum)",
  "var(--color-giri)",
  "var(--color-waspada)",
  "var(--color-tarum)",
  "var(--color-giri)",
];

export function ReplyTree({ nodes, threadId, userEmail, depth = 0 }: ReplyTreeProps) {
  return (
    <div className={depth === 0 ? "space-y-6" : "mt-4 space-y-4"}>
      {nodes.map((node) => (
        <ReplyNodeView
          key={node.id}
          node={node}
          threadId={threadId}
          userEmail={userEmail}
          depth={depth}
        />
      ))}
    </div>
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
  const [collapsed, setCollapsed] = useState(false);

  const counts: Record<string, number> = {};
  for (const r of node.reactions) {
    counts[r.type] = (counts[r.type] ?? 0) + 1;
  }

  const hasSource = !!node.sourceUrl;
  const effectiveDepth = Math.min(depth, MAX_DEPTH);
  const accent = ACCENT[effectiveDepth % ACCENT.length];
  const isNested = depth > 0;

  return (
    <div
      style={isNested ? { borderLeft: `2px solid ${accent}`, paddingLeft: "16px" } : undefined}
    >
      {/* Komentar utama */}
      <article
        className={[
          "group relative",
          depth === 0
            ? "border border-[var(--color-line)] bg-[var(--color-paper)] hover:border-[var(--color-ink)]/20 transition-colors"
            : "",
        ].join(" ")}
        aria-label={`Komentar oleh ${node.author?.name ?? "Anonim"}`}
      >
        {/* Strip aksen kiri untuk top-level */}
        {depth === 0 && (
          <div
            className="absolute left-0 top-0 bottom-0 w-[3px]"
            style={{ background: accent }}
          />
        )}

        <div className={depth === 0 ? "pl-5 pr-4 py-5" : "py-2"}>
          {/* Header: avatar + meta */}
          <header className="flex items-start gap-3 mb-3">
            {/* Avatar monogram */}
            <div
              className="flex-shrink-0 w-8 h-8 flex items-center justify-center font-mono text-[11px] font-bold uppercase"
              style={{ background: `${accent}22`, color: accent }}
            >
              {(node.author?.name ?? "A").slice(0, 1)}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-display text-[14px] font-semibold leading-tight">
                  {node.author?.name ?? "Anonim"}
                </span>
                <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--color-ink)]/45">
                  {formatTanggalPendek(node.createdAt)}
                </span>
                {hasSource && <Badge tone="giri">Dengan sumber</Badge>}
                {node.isHidden && <Badge tone="waspada">Disembunyikan</Badge>}
              </div>
            </div>

            {/* Collapse toggle jika ada anak */}
            {node.children.length > 0 && (
              <button
                type="button"
                onClick={() => setCollapsed((v) => !v)}
                className="flex-shrink-0 font-mono text-[10px] uppercase tracking-wider text-[var(--color-ink)]/40 hover:text-[var(--color-ink)] transition-colors"
                aria-expanded={!collapsed}
                title={collapsed ? "Tampilkan balasan" : "Sembunyikan balasan"}
              >
                {collapsed ? `+${node.children.length}` : "−"}
              </button>
            )}
          </header>

          {/* Konten */}
          {node.isHidden ? (
            <p className="font-body text-[14px] italic text-[var(--color-ink)]/35 mb-3 pl-11">
              Komentar ini disembunyikan oleh moderator.
            </p>
          ) : (
            <div
              className="font-body text-[15px] leading-[1.7] text-[var(--color-ink)]/88 mb-3 pl-11
                [&_a]:text-[var(--color-tarum)] [&_a]:underline [&_a]:underline-offset-2
                [&_blockquote]:border-l-2 [&_blockquote]:border-[var(--color-line)] [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:text-[var(--color-ink)]/60
                [&_code]:font-mono [&_code]:text-[13px] [&_code]:bg-[var(--color-line)]/50 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded
                [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5
                [&_p+p]:mt-2"
              dangerouslySetInnerHTML={{ __html: node.content }}
            />
          )}

          {/* Sumber */}
          {node.sourceUrl && !node.isHidden && (
            <p className="font-mono text-[10px] mt-1 mb-3 pl-11 text-[var(--color-ink)]/45">
              Sumber:{" "}
              <a
                href={node.sourceUrl}
                className="text-[var(--color-tarum)] hover:underline underline-offset-2 break-all"
                rel="noopener noreferrer"
                target="_blank"
              >
                {node.sourceUrl}
              </a>
            </p>
          )}

          {/* Action row */}
          <div className="flex items-center flex-wrap gap-2 pl-11">
            <ReactionBar
              replyId={node.id}
              initialCounts={counts}
              userEmail={userEmail ?? ""}
            />
            <div className="flex items-center gap-3 ml-auto">
              <FlagButton replyId={node.id} />
              <button
                type="button"
                onClick={() => setShowReply((v) => !v)}
                className="font-mono text-[10px] uppercase tracking-wider px-2 py-1 border transition-colors"
                style={{
                  borderColor: showReply ? accent : "var(--color-line)",
                  color: showReply ? accent : "var(--color-ink)",
                }}
                aria-expanded={showReply}
              >
                {showReply ? "Tutup" : "↩ Balas"}
              </button>
            </div>
          </div>

          {/* Form balas inline */}
          {showReply && (
            <div className="mt-4 pt-4 pl-11 border-t border-[var(--color-line)]/50">
              <ReplyForm
                threadId={threadId}
                parentId={node.id}
                defaultEmail={userEmail ?? ""}
                compact
              />
            </div>
          )}
        </div>
      </article>

      {/* Anak-anak reply — collapsible */}
      {!collapsed && node.children.length > 0 && (
        <div className="mt-3">
          <ReplyTree
            nodes={node.children}
            threadId={threadId}
            userEmail={userEmail}
            depth={Math.min(depth + 1, MAX_DEPTH)}
          />
        </div>
      )}
    </div>
  );
}
