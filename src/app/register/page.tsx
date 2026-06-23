import type { Metadata } from "next";
import { RegisterForm } from "./RegisterForm";
import { WeaveDivider } from "@/components/weave/WeaveDivider";

export const metadata: Metadata = {
  title: "Daftar Akun Baru",
  description: "Buat akun baru untuk bergabung dengan portal Anyaman.",
};

export default function RegisterPage() {
  return (
    <main className="mx-auto max-w-md px-6 py-20">
      <div className="text-center mb-10">
        <p className="font-mono text-[11px] uppercase tracking-wider text-[var(--color-giri)] mb-2">
          Daftar
        </p>
        <h1 className="font-display text-[36px] leading-tight mb-3">
          Buat akun baru
        </h1>
        <p className="font-body text-[var(--color-ink)]/70">
          Role &ldquo;Pembaca&rdquo; secara default. Kontributor dan Editor ditugaskan admin.
        </p>
      </div>

      <div className="mb-6">
        <WeaveDivider variant="giri" />
      </div>

      <RegisterForm />
    </main>
  );
}
