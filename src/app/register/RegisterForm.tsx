"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { register } from "@/actions/auth";

export function RegisterForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Password dan konfirmasi tidak cocok.");
      return;
    }

    startTransition(async () => {
      const result = await register(name, email, password);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.refresh();
      router.push("/");
    });
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <Input
          label="Nama"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nama lengkap Anda"
          required
          error={error ?? undefined}
        />
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email@contoh.id"
          required
        />
        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Minimal 8 karakter"
          minLength={8}
          required
        />
        <Input
          label="Konfirmasi Password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Ulangi password"
          minLength={8}
          required
        />
        {password !== confirmPassword && confirmPassword.length > 0 && (
          <p className="text-sm text-[var(--color-waspada)]">
            Password dan konfirmasi tidak cocok.
          </p>
        )}
        <Button type="submit" disabled={pending}>
          {pending ? "Memproses..." : "Daftar"}
        </Button>
      </form>

      <p className="mt-6 font-body text-sm text-[var(--color-ink)]/70">
        Sudah punya akun?{" "}
        <Link
          href="/login"
          className="text-[var(--color-tarum)] hover:underline underline-offset-2"
        >
          Masuk di sini
        </Link>
      </p>
    </>
  );
}