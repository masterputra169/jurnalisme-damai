import Link from "next/link";
import { getCurrentUser } from "@/actions/auth";
import { LogoutButton } from "./LogoutButton";

export async function AccountMenu() {
  const user = await getCurrentUser();
  if (!user) {
    return (
      <Link
        href="/login"
        className="font-mono text-xs uppercase tracking-wider text-[var(--color-ink)] hover:text-[var(--color-tarum)] transition-colors"
      >
        Masuk
      </Link>
    );
  }

  const isStaff = user.role === "EDITOR" || user.role === "CONTRIBUTOR";

  return (
    <div className="flex items-center gap-3 font-mono text-xs uppercase tracking-wider">
      <span className="text-[var(--color-ink)]/80 hidden sm:inline">
        {user.name}
      </span>
      <span className="text-[var(--color-ink)]/40 hidden sm:inline">·</span>
      <span className="text-[var(--color-kunyit)]">{user.role}</span>
      {isStaff && (
        <Link
          href="/dashboard/artikel"
          className="text-[var(--color-ink)] hover:text-[var(--color-tarum)] transition-colors"
        >
          Dashboard
        </Link>
      )}
      {user.role === "EDITOR" && (
        <Link
          href="/dashboard/moderasi"
          className="text-[var(--color-waspada)] hover:underline underline-offset-2"
        >
          Moderasi
        </Link>
      )}
      <LogoutButton />
    </div>
  );
}