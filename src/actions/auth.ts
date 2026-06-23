"use server";

import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { RegisterSchema, LoginSchema } from "@/lib/validations/auth";
import type { Role } from "@prisma/client";

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

export async function register(
  name: string,
  email: string,
  password: string,
): Promise<ActionResult<{ name: string; role: string }>> {
  const parsed = RegisterSchema.safeParse({ name, email, password });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Input tidak valid" };
  }

  const normalizedEmail = parsed.data.email.trim().toLowerCase();

  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existing) {
    return { ok: false, error: "Email sudah terdaftar. Silakan login." };
  }

  const hashed = await bcrypt.hash(parsed.data.password, 10);

  const user = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: normalizedEmail,
      passwordHash: hashed,
      role: "READER" as Role,
    },
  });

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

export async function login(
  email: string,
  password: string,
): Promise<ActionResult<{ name: string; role: string }>> {
  const parsed = LoginSchema.safeParse({ email, password });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Input tidak valid" };
  }

  const normalizedEmail = parsed.data.email.trim().toLowerCase();

  const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (!user) {
    return { ok: false, error: "Email atau password salah." };
  }

  // Fallback: kalau user dari seed (passwordHash null), login pakai email saja
  if (!user.passwordHash) {
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

  const match = await bcrypt.compare(parsed.data.password, user.passwordHash);
  if (!match) {
    return { ok: false, error: "Email atau password salah." };
  }

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