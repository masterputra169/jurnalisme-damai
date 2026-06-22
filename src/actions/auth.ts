"use server";

import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

const COOKIE_NAME = "anyaman_uid";

export type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export async function getCurrentUser() {
  const store = await cookies();
  const uid = store.get(COOKIE_NAME)?.value;
  if (!uid) return null;
  return prisma.user.findUnique({
    where: { id: uid },
    select: { id: true, name: true, email: true, role: true },
  });
}

export async function requireRole(roles: string[]) {
  const user = await getCurrentUser();
  if (!user || !roles.includes(user.role)) return null;
  return user;
}

export async function login(email: string): Promise<ActionResult<{ name: string; role: string }>> {
  const user = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
  if (!user) return { ok: false, error: "Email tidak terdaftar di sistem demo." };

  const store = await cookies();
  store.set(COOKIE_NAME, user.id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  return { ok: true, data: { name: user.name, role: user.role } };
}

export async function logout(): Promise<ActionResult> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
  return { ok: true, data: undefined };
}