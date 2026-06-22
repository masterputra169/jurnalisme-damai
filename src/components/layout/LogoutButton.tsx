"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { logout } from "@/actions/auth";

export function LogoutButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const handleClick = () => {
    startTransition(async () => {
      await logout();
      router.refresh();
      router.push("/");
    });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      className="font-mono text-xs uppercase tracking-wider text-[var(--color-ink)]/60 hover:text-[var(--color-waspada)] disabled:opacity-50"
    >
      Keluar
    </button>
  );
}