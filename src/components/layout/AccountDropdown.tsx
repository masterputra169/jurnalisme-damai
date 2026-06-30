"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { logout } from "@/actions/auth";

interface AccountDropdownProps {
  userName: string;
  userRole: string;
  isStaff: boolean;
  isEditor: boolean;
}

export function AccountDropdown({ userName, userRole, isStaff, isEditor }: AccountDropdownProps) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const handleLogout = () => {
    startTransition(async () => {
      await logout();
      setOpen(false);
      router.refresh();
      router.push("/");
    });
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="font-mono text-xs uppercase tracking-wider text-[var(--color-ink)] hover:text-[var(--color-tarum)] transition-colors flex items-center gap-1"
      >
        <span className="hidden sm:inline">{userName}</span>
        <span className="sm:hidden">Akun</span>
        <svg className="w-3 h-3 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-56 border border-[var(--color-line)] bg-[var(--color-paper)] shadow-lg z-50 font-mono text-xs">
            <div className="px-4 py-3 border-b border-[var(--color-line)]">
              <p className="text-[var(--color-ink)]/80">{userName}</p>
              <p className="text-[var(--color-kunyit)] uppercase">{userRole}</p>
            </div>
            <div className="py-2">
              {isStaff && (
                <Link
                  href="/dashboard/artikel"
                  className="block px-4 py-2 text-[var(--color-ink)] hover:bg-[var(--color-paper-dark)] transition-colors"
                  onClick={() => setOpen(false)}
                >
                  Dashboard
                </Link>
              )}
              {isEditor && (
                <Link
                  href="/dashboard/moderasi"
                  className="block px-4 py-2 text-[var(--color-waspada)] hover:bg-[var(--color-paper-dark)] transition-colors"
                  onClick={() => setOpen(false)}
                >
                  Moderasi
                </Link>
              )}
              <button
                type="button"
                onClick={handleLogout}
                disabled={pending}
                className="w-full text-left px-4 py-2 text-[var(--color-ink)] hover:bg-[var(--color-paper-dark)] transition-colors border-t border-[var(--color-line)] disabled:opacity-50"
              >
                {pending ? "Keluar..." : "Keluar"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
