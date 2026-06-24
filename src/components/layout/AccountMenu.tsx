import Link from "next/link";
import { getCurrentUser } from "@/actions/auth";
import { AccountDropdown } from "./AccountDropdown";

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
    <AccountDropdown
      userName={user.name}
      userRole={user.role}
      isStaff={isStaff}
      isEditor={user.role === "EDITOR"}
    />
  );
}