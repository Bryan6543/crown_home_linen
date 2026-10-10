import { createHmac, timingSafeEqual } from "crypto";
import type { AdminSession } from "@/lib/types";

const COOKIE = "chl_session";

export function sessionCookieName() {
  return COOKIE;
}

function secret() {
  return process.env.SESSION_SECRET || "dev-only-crown-home-linen-secret";
}

export function demoLogin() {
  const email = process.env.DEMO_ADMIN_EMAIL || "admin@crownhomelinen.com";
  const password = process.env.DEMO_ADMIN_PASSWORD || "CrownHome#2026";
  const usingDefault = !process.env.DEMO_ADMIN_PASSWORD;
  if (process.env.NODE_ENV === "production" && usingDefault) return null;
  return {
    email,
    password,
    showHint: process.env.NODE_ENV !== "production",
  };
}

export function signSession(email: string) {
  const payload = Buffer.from(
    JSON.stringify({
      email,
      role: "admin",
      mode: "demo",
      exp: Date.now() + 1000 * 60 * 60 * 24 * 7,
    }),
  ).toString("base64url");
  const mac = createHmac("sha256", secret()).update(payload).digest("base64url");
  return `${payload}.${mac}`;
}

export function readSession(token: string | undefined | null): AdminSession | null {
  if (!token) return null;
  const [payload, mac] = token.split(".");
  if (!payload || !mac) return null;
  const expected = createHmac("sha256", secret()).update(payload).digest("base64url");
  const left = Buffer.from(mac);
  const right = Buffer.from(expected);
  if (left.length !== right.length || !timingSafeEqual(left, right)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
      email?: string;
      role?: "admin" | "staff";
      exp?: number;
    };
    if (!data.email || !data.exp || data.exp < Date.now()) return null;
    if (data.role !== "admin" && data.role !== "staff") return null;
    return { email: data.email, role: data.role, mode: "demo" };
  } catch {
    return null;
  }
}
