"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export type ThreadResult =
  | { ok: true; data: { threadId: string } }
  | { ok: false; error: string };

export async function ensureThreadForArticle(
  articleId: string,
  articleTitle: string,
  articleSlug: string,
): Promise<ThreadResult> {
  try {
    const existing = await prisma.thread.findUnique({
      where: { articleId },
      select: { id: true },
    });
    if (existing) {
      return { ok: true, data: { threadId: existing.id } };
    }

    const thread = await prisma.thread.create({
      data: {
        title: `Diskusi: ${articleTitle}`,
        articleId,
      },
    });

    revalidatePath(`/artikel/${articleSlug}`);
    revalidatePath("/forum");

    return { ok: true, data: { threadId: thread.id } };
  } catch (err) {
    if ((err as { code?: string }).code === "P2002") {
      const existing = await prisma.thread.findUnique({ where: { articleId } });
      if (existing) return { ok: true, data: { threadId: existing.id } };
    }
    return { ok: false, error: "Gagal membuat thread diskusi." };
  }
}
