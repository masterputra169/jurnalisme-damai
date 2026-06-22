export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-[var(--color-line)]">
      <div className="mx-auto max-w-6xl px-6 py-10 grid gap-8 md:grid-cols-3 font-mono text-xs text-[var(--color-ink)]/70">
        <div>
          <p className="uppercase tracking-wider mb-2">Anyaman</p>
          <p className="font-body text-sm leading-relaxed">
            Portal jurnalisme damai & forum diskusi untuk kebhinekaan Indonesia.
          </p>
        </div>
        <div>
          <p className="uppercase tracking-wider mb-2">Tentang</p>
          <ul className="space-y-1">
            <li><a href="/tentang" className="hover:text-[var(--color-tarum)]">Metodologi</a></li>
            <li><a href="/tentang#pancasila" className="hover:text-[var(--color-tarum)]">Pemetaan Pancasila</a></li>
          </ul>
        </div>
        <div>
          <p className="uppercase tracking-wider mb-2">Tugas</p>
          <p className="font-body text-sm leading-relaxed">
            Dibuat untuk mata kuliah Pancasila — penerapan nilai dalam produk digital.
          </p>
        </div>
      </div>
    </footer>
  );
}