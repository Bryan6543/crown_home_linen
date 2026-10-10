import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { readSession, sessionCookieName } from "@/lib/session";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import type { AdminSession } from "@/lib/types";

export async function getAdminSession(): Promise<AdminSession | null> {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    if (!data.user) return null;
    const { data: profile } = await supabase.from("profiles").select("role, email").eq("id", data.user.id).maybeSingle();
    const role = profile?.role;
    if (role !== "admin" && role !== "staff") return null;
    return { email: profile?.email || data.user.email || "", role, mode: "supabase" };
  }
  const token = (await cookies()).get(sessionCookieName())?.value;
  return readSession(token);
}

export async function requireAdmin() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  return session;
}
