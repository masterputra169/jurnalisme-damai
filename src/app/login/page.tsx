import Link from "next/link";
import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  return (
    <main className="mx-auto max-w-md px-6 py-16">
      <p className="font-mono text-[11px] uppercase tracking-wider text-[var(--color-tarum)] mb-2">
        Masuk
      </p>
      <h1 className="font-display text-[32px] leading-tight mb-2">
        Masuk ke akun Anda
      </h1>
      <p className="font-body text-[var(--color-ink)]/80 mb-8">
        Untuk tugas kuliah ini, login cukup dengan email akun demo. Untuk
        produksi, sistem akan menggunakan Auth.js dengan bcrypt.
      </p>

      <LoginForm />

      <p className="font-mono text-[11px] mt-8 text-[var(--color-ink)]/60">
        Akun demo (lihat seed):{" "}
        <code>editor@anyaman.id</code>,{" "}
        <code>kontributor@anyaman.id</code>,{" "}
        <code>pembaca@anyaman.id</code>,{" "}
        <code>daniel@anyaman.id</code>.
      </p>

      <p className="mt-6">
        <Link
          href="/"
          className="font-mono text-sm uppercase tracking-wider text-[var(--color-ink)]/70 hover:text-[var(--color-tarum)]"
        >
          ← Kembali ke beranda
        </Link>
      </p>
    </main>
  );
}