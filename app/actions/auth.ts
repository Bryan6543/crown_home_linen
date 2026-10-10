"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { demoLogin, signSession, sessionCookieName } from "@/lib/session";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  const next = String(formData.get("next") || "/admin");
  const destination = next.startsWith("/admin") ? next : "/admin";

  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) redirect(`/admin/login?error=${encodeURIComponent(error.message)}`);
    redirect(destination);
  }

  const demo = demoLogin();
  if (!demo || email !== demo.email.toLowerCase() || password !== demo.password) {
    redirect("/admin/login?error=Those%20details%20do%20not%20match%20the%20house%20book.");
  }
  const store = await cookies();
  store.set(sessionCookieName(), signSession(email), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  redirect(destination);
}

export async function signupAction(formData: FormData) {
  if (!isSupabaseConfigured()) {
    redirect("/admin/login?error=Create%20the%20owner%20account%20after%20Supabase%20is%20connected.");
  }
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  const name = String(formData.get("name") || "").trim();
  if (password.length < 8) redirect("/admin/login?error=Use%20at%20least%208%20characters.&mode=signup");
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: name } },
  });
  if (error) redirect(`/admin/login?error=${encodeURIComponent(error.message)}&mode=signup`);
  if (!data.session) {
    redirect("/admin/login?notice=Confirm%20the%20email%2C%20then%20sign%20in.%20The%20first%20confirmed%20account%20is%20the%20owner.&mode=signup");
  }
  redirect("/admin");
}

export async function logoutAction() {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  const store = await cookies();
  store.delete(sessionCookieName());
  redirect("/admin/login");
}
