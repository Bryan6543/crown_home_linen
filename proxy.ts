import { NextResponse, type NextRequest } from "next/server";
import { readSession, sessionCookieName } from "@/lib/session";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { updateSupabaseSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  if (isSupabaseConfigured()) return updateSupabaseSession(request);

  const path = request.nextUrl.pathname;
  const isAdmin = path.startsWith("/admin");
  const isLogin = path.startsWith("/admin/login");
  const session = readSession(request.cookies.get(sessionCookieName())?.value);

  if (isAdmin && !isLogin && !session) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("next", path);
    return NextResponse.redirect(url);
  }

  if (isLogin && session) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
