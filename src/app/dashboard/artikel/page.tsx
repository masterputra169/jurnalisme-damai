import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/actions/auth";
import { Badge } from "@/components/ui/Badge";
import { formatTanggal } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function DashboardArtikelPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "EDITOR" && user.role !== "CONTRIBUTOR") redirect("/");

  const articles = await prisma.article.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      category: { select: { name: true } },
      author: { select: { name: true } },
      _count: { select: { viewpoints: true } },
    },
  });

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <div className="flex items-center gap-3 mb-3">
        <Badge tone="tarum">Dashboard Editor</Badge>
      </div>
      <h1 className="font-display text-[36px] leading-tight mb-2">
        Daftar Artikel
      </h1>
      <p className="font-body text-[var(--color-ink)]/80 mb-10 max-w-[68ch]">
        Kelola artikel portal. Setiap artikel kontroversial wajib memiliki
        minimal 2 entri Sudut Pandang Berimbang sebelum dipublikasikan.
      </p>

      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--color-line)] text-left font-mono text-[11px] uppercase tracking-wider text-[var(--color-ink)]/60">
            <th className="py-3 pr-4">Judul</th>
            <th className="py-3 pr-4">Kategori</th>
            <th className="py-3 pr-4">Status</th>
            <th className="py-3 pr-4">Sudut Pandang</th>
            <th className="py-3 pr-4">Diubah</th>
            <th className="py-3 pr-4">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {articles.map((a) => (
            <tr key={a.id} className="border-b border-[var(--color-line)]">
              <td className="py-3 pr-4 font-display">
                <Link
                  href={`/artikel/${a.slug}`}
                  className="hover:text-[var(--color-tarum)] transition-colors"
                >
                  {a.title}
                </Link>
              </td>
              <td className="py-3 pr-4 font-mono text-xs">{a.category.name}</td>
              <td className="py-3 pr-4">
                <Badge tone={a.status === "PUBLISHED" ? "giri" : "neutral"}>
                  {a.status}
                </Badge>
              </td>
              <td className="py-3 pr-4 font-mono text-xs">
                {a._count.viewpoints} entri
                {a._count.viewpoints < 2 && (
                  <span className="ml-2 text-[var(--color-waspada)]">· butuh 2+</span>
                )}
              </td>
              <td className="py-3 pr-4 font-mono text-xs text-[var(--color-ink)]/60">
                {formatTanggal(a.updatedAt)}
              </td>
              <td className="py-3 pr-4">
                <Link
                  href={`/artikel/${a.slug}`}
                  className="font-mono text-xs text-[var(--color-tarum)] hover:underline"
                >
                  Lihat →
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="font-body text-sm text-[var(--color-ink)]/70 mt-10 italic">
        Catatan: untuk tugas kuliah ini, editor artikel baru dilakukan lewat
        Prisma Studio / seed ulang. Form publish UI sengaja tidak dibangun agar
        scope tetap terjaga (lihat PRD.md §6.5).
      </p>
    </main>
  );
}