import type { Metadata } from "next";
import { RegisterForm } from "./RegisterForm";

export const metadata: Metadata = {
  title: "Daftar Akun Baru",
  description: "Buat akun baru untuk bergabung dengan portal Anyaman.",
};

export default function RegisterPage() {
  return (
    <main className="mx-auto max-w-md px-6 py-16">
      <p className="font-mono text-[11px] uppercase tracking-wider text-[var(--color-giri)] mb-2">
        Daftar
      </p>
      <h1 className="font-display text-[32px] leading-tight mb-2">
        Buat akun baru
      </h1>
      <p className="font-body text-[var(--color-ink)]/80 mb-8">
        Akun baru akan mendapat role &ldquo;Pembaca&rdquo; secara default.
        Kontributor dan Editor ditugaskan oleh admin.
      </p>

      <RegisterForm />
    </main>
  );
}