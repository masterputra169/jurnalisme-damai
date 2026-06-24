"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  CreateReplySchema,
  FlagReplySchema,
  needsFactSource,
  type CreateReplyInput,
  type FlagReplyInput,
} from "@/lib/validations/forum";
import { checkRateLimit, sanitizeHtml } from "@/lib/moderation/sanitize";

export type ActionResult<T = void> =
  | { ok: true; data: T; warning?: string }
  | { ok: false; error: string };

export async function createReply(
  input: CreateReplyInput,
): Promise<ActionResult<{ replyId: string }>> {
  const parsed = CreateReplySchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Input tidak valid" };
  }
  const data = parsed.data;

  // Rate limit — stricter for anonymous
  const isAnonymous = !data.authorEmail || data.authorEmail.trim() === "";
  const rlKey = isAnonymous
    ? `anon:${data.threadId}`
    : `${data.authorEmail}:${data.threadId}`;
  const rateLimitWindow = isAnonymous ? 30_000 : 10_000; // 30s anonymous, 10s logged-in
  const rateLimitMax = isAnonymous ? 1 : 1;
  if (!checkRateLimit(rlKey, rateLimitWindow, rateLimitMax)) {
    return {
      ok: false,
      error: isAnonymous
        ? "Tunggu 30 detik sebelum mengirim balasan lagi."
        : "Tunggu 10 detik sebelum mengirim balasan lagi di thread ini.",
    };
  }

  let authorId: string | null = null;
  if (!isAnonymous) {
    const author = await prisma.user.findUnique({ where: { email: data.authorEmail } });
    if (!author) {
      return { ok: false, error: "Akun tidak ditemukan. Login dulu untuk membalas." };
    }
    authorId = author.id;
  }

  const cleanHtml = sanitizeHtml(data.content);
  const cleanSource = data.sourceUrl?.trim() || null;

  // Warning (bukan blocking) untuk klaim faktual tanpa sumber — sesuai CONTENT-STRATEGY.md §3
  let warning: string | undefined;
  if (needsFactSource(cleanHtml) && !cleanSource) {
    warning =
      "Komentar Anda mengandung klaim numerik/statistik. Pertimbangkan untuk menambahkan tautan sumber agar argumen lebih kuat.";
  }

  const reply = await prisma.reply.create({
    data: {
      threadId: data.threadId,
      authorId,
      parentId: data.parentId ?? null,
      content: cleanHtml,
      sourceUrl: cleanSource,
    },
  });

  revalidatePath(`/forum/${data.threadId}`);

  return { ok: true, data: { replyId: reply.id }, warning };
}

export async function flagReply(input: FlagReplyInput): Promise<ActionResult> {
  const parsed = FlagReplySchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Input tidak valid" };
  }
  const data = parsed.data;

  const reply = await prisma.reply.findUnique({ where: { id: data.replyId } });
  if (!reply) return { ok: false, error: "Komentar tidak ditemukan." };

  // Anonymous or logged in
  let reporterId: string | null = null;
  if (data.reporterEmail && data.reporterEmail.trim() !== "") {
    const reporter = await prisma.user.findUnique({ where: { email: data.reporterEmail } });
    if (!reporter) return { ok: false, error: "Akun tidak ditemukan." };
    reporterId = reporter.id;
  }

  await prisma.report.create({
    data: {
      replyId: data.replyId,
      reporterId,
      reason: data.reason,
      status: "PENDING",
    },
  });

  revalidatePath(`/forum/${reply.threadId}`);
  revalidatePath(`/dashboard/moderasi`);

  return { ok: true, data: undefined };
}

const REACTION_TYPES = ["STRONG_ARGUMENT", "NEEDS_SOURCE", "OTHER_PERSPECTIVE"] as const;
type ReactionType = (typeof REACTION_TYPES)[number];

export async function toggleReaction(
  replyId: string,
  userEmail: string,
  type: ReactionType,
): Promise<ActionResult<{ active: boolean; count: number }>> {
  if (!REACTION_TYPES.includes(type)) {
    return { ok: false, error: "Jenis reaksi tidak valid." };
  }

  // Anonymous reactions — just increment count, no toggle
  const isAnonymous = !userEmail || userEmail.trim() === "";

  if (isAnonymous) {
    // Anonymous: just add a reaction (no toggle, no tracking)
    await prisma.reaction.create({
      data: { replyId, userId: null, type },
    });
    const count = await prisma.reaction.count({ where: { replyId, type } });
    const reply = await prisma.reply.findUnique({ where: { id: replyId } });
    if (reply) revalidatePath(`/forum/${reply.threadId}`);
    return { ok: true, data: { active: true, count } };
  }

  const user = await prisma.user.findUnique({ where: { email: userEmail } });
  if (!user) return { ok: false, error: "Akun tidak ditemukan." };

  const existing = await prisma.reaction.findUnique({
    where: { replyId_userId_type: { replyId, userId: user.id, type } },
  });

  if (existing) {
    await prisma.reaction.delete({ where: { id: existing.id } });
  } else {
    await prisma.reaction.create({ data: { replyId, userId: user.id, type } });
  }

  const count = await prisma.reaction.count({ where: { replyId, type } });
  const reply = await prisma.reply.findUnique({ where: { id: replyId } });
  if (reply) revalidatePath(`/forum/${reply.threadId}`);

  return { ok: true, data: { active: !existing, count } };
}