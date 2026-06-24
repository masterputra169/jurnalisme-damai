import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/actions/auth";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatTanggal } from "@/lib/format";

export const dynamic = "force-dynamic";

async function handleDecision(formData: FormData) {
  "use server";
  const reportId = String(formData.get("reportId") ?? "");
  const replyId = String(formData.get("replyId") ?? "");
  const status = String(formData.get("status") ?? "") as
    | "DISMISSED"
    | "ACTIONED"
    | "REVIEWED";
  if (!reportId || !replyId || !status) return;
  const user = await getCurrentUser();
  if (!user || user.role !== "EDITOR") {
    throw new Error("Tidak diizinkan.");
  }
  await prisma.report.update({ where: { id: reportId }, data: { status } });

  if (status === "ACTIONED") {
    await prisma.reply.update({ where: { id: replyId }, data: { isHidden: true } });
  } else if (status === "DISMISSED") {
    await prisma.reply.update({ where: { id: replyId }, data: { isHidden: false } });
  }

  const reply = await prisma.reply.findUnique({ where: { id: replyId } });
  if (reply) revalidatePath(`/forum/${reply.threadId}`);
  revalidatePath("/dashboard/moderasi");
}

export default async function ModerasiPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "EDITOR") redirect("/");

  const reports = await prisma.report.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      reply: {
        include: {
          author: { select: { name: true } },
          thread: { select: { id: true, title: true } },
        },
      },
      reporter: { select: { name: true } },
    },
  });

  const pending = reports.filter((r) => r.status === "PENDING");
  const done = reports.filter((r) => r.status !== "PENDING");

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <div className="flex items-center gap-3 mb-3">
        <Badge tone="waspada">Dashboard Moderasi</Badge>
        <span className="font-mono text-[11px] uppercase tracking-wider text-[var(--color-ink)]/60">
          {pending.length} menunggu tinjauan
        </span>
      </div>
      <h1 className="font-display text-[36px] leading-tight mb-2">
        Antrian Laporan
      </h1>
      <p className="font-body text-[var(--color-ink)]/80 mb-10 max-w-[68ch]">
        Sesuai SOP Moderasi (§4 CONTENT-STRATEGY.md): cek apakah pelanggaran
        terhadap &ldquo;Tidak boleh&rdquo; di §3, atau sekadar kritik tajam
        yang sah. Tidak ada hard delete — keputusan tercatat untuk audit.
      </p>

      <section>
        <h2 className="font-display text-[20px] mb-4 pb-2 border-b border-[var(--color-waspada)]">
          Menunggu keputusan
        </h2>
        {pending.length === 0 ? (
          <p className="font-body italic text-[var(--color-ink)]/70">
            Antrian kosong. Tidak ada laporan yang menunggu.
          </p>
        ) : (
          <ul className="space-y-6">
            {pending.map((r) => (
              <li
                key={r.id}
                className="border border-[var(--color-line)] p-5"
              >
                <header className="flex items-center gap-3 flex-wrap mb-3">
                  <Badge tone="waspada">{r.status}</Badge>
                  <span className="font-mono text-[11px] uppercase tracking-wider text-[var(--color-ink)]/60">
                    {formatTanggal(r.createdAt)}
                  </span>
                  <span className="font-mono text-[11px] text-[var(--color-ink)]/70">
                    oleh pelapor: {r.reporter.name}
                  </span>
                </header>
                <p className="font-body mb-3">
                  <strong>Alasan:</strong> {r.reason}
                </p>
                <article className="bg-[var(--color-paper)] border-l-2 border-[var(--color-waspada)] pl-4 py-2 mb-4">
                  <p className="font-mono text-[11px] uppercase tracking-wider text-[var(--color-ink)]/60 mb-1">
                    Komentar yang dilaporkan — oleh {r.reply.author?.name ?? "Anonymous"}
                  </p>
                  <div
                    className="font-body text-[15px] [&_a]:text-[var(--color-tarum)] [&_a]:underline [&_blockquote]:border-l-2 [&_blockquote]:border-[var(--color-line)] [&_blockquote]:pl-3 [&_blockquote]:italic"
                    dangerouslySetInnerHTML={{ __html: r.reply.content }}
                  />
                </article>
                <p className="font-mono text-[11px] text-[var(--color-ink)]/60 mb-3">
                  Thread:{" "}
                  <a
                    href={`/forum/${r.reply.thread.id}`}
                    className="text-[var(--color-tarum)] hover:underline"
                  >
                    {r.reply.thread.title}
                  </a>
                </p>
                <form action={handleDecision} className="flex gap-2">
                  <input type="hidden" name="reportId" value={r.id} />
                  <input type="hidden" name="replyId" value={r.reply.id} />
                  <Button type="submit" name="status" value="DISMISSED" variant="secondary">
                    Dismissed (kritik sah)
                  </Button>
                  <Button type="submit" name="status" value="ACTIONED" variant="danger">
                    Actioned (sembunyikan)
                  </Button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>

      {done.length > 0 && (
        <section className="mt-12">
          <h2 className="font-display text-[20px] mb-4 pb-2 border-b border-[var(--color-line)]">
            Riwayat keputusan
          </h2>
          <ul className="space-y-3">
            {done.map((r) => (
              <li
                key={r.id}
                className="border-l-2 border-[var(--color-line)] pl-4 py-2 flex items-center gap-3 flex-wrap"
              >
                <Badge
                  tone={r.status === "ACTIONED" ? "waspada" : "giri"}
                >
                  {r.status}
                </Badge>
                <span className="font-body text-sm">
                  Laporan oleh {r.reporter.name} atas komentar {r.reply.author?.name ?? "Anonymous"}
                </span>
                <span className="font-mono text-[11px] text-[var(--color-ink)]/60">
                  · {formatTanggal(r.createdAt)}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}