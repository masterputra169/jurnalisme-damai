import Link from "next/link";
import { LoginForm } from "./LoginForm";
import { WeaveDivider } from "@/components/weave/WeaveDivider";

export default function LoginPage() {
  return (
    <main className="mx-auto max-w-md px-6 py-20">
      <div className="text-center mb-10">
        <p className="font-mono text-[11px] uppercase tracking-wider text-[var(--color-tarum)] mb-2">
          Masuk
        </p>
        <h1 className="font-display text-[36px] leading-tight mb-3">
          Masuk ke akun Anda
        </h1>
        <p className="font-body text-[var(--color-ink)]/70">
          Email dan password untuk login. Akun seed bisa login dengan email saja.
        </p>
      </div>

      <div className="mb-6">
        <WeaveDivider variant="tarum" />
      </div>

      <LoginForm />

      <p className="mt-8 text-center">
        <Link
          href="/"
          className="font-mono text-xs uppercase tracking-wider text-[var(--color-ink)]/60 hover:text-[var(--color-tarum)] transition-colors"
        >
          ← Kembali ke beranda
        </Link>
      </p>
    </main>
  );
}
