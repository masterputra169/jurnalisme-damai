import { prisma } from "@/lib/prisma";

export type ThreadListItem = {
  id: string;
  title: string;
  createdAt: Date;
  isLocked: boolean;
  article: { title: string; slug: string } | null;
  _count: { replies: number };
};

export async function getAllThreads() {
  const threads = await prisma.thread.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      article: { select: { title: true, slug: true } },
      _count: { select: { replies: true } },
    },
  });
  return threads;
}

export type ReplyNode = {
  id: string;
  content: string;
  sourceUrl: string | null;
  createdAt: Date;
  isHidden: boolean;
  author: { name: string } | null;
  reactions: { type: string; _count?: number }[];
  children: ReplyNode[];
};

export async function getThreadDetail(threadId: string) {
  const thread = await prisma.thread.findUnique({
    where: { id: threadId },
    include: {
      article: { select: { title: true, slug: true } },
      replies: {
        orderBy: { createdAt: "asc" },
        include: {
          author: { select: { name: true } },
          reactions: { select: { type: true } },
        },
      },
    },
  });
  if (!thread) return null;

  // bangun tree
  const byId = new Map<string, ReplyNode>();
  for (const r of thread.replies) {
    byId.set(r.id, {
      id: r.id,
      content: r.content,
      sourceUrl: r.sourceUrl,
      createdAt: r.createdAt,
      isHidden: r.isHidden,
      author: r.author,
      reactions: r.reactions,
      children: [],
    });
  }
  const roots: ReplyNode[] = [];
  for (const r of thread.replies) {
    const node = byId.get(r.id)!;
    if (r.parentId && byId.has(r.parentId)) {
      byId.get(r.parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  }
  return { thread, roots };
}