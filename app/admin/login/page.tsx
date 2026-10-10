import Link from "next/link";
import { loginAction, signupAction } from "@/app/actions/auth";
import { demoLogin } from "@/lib/session";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; notice?: string; next?: string }>;
}) {
  const params = await searchParams;
  const supabase = isSupabaseConfigured();
  const demo = demoLogin();

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-16">
      <Link href="/" className="font-serif text-4xl tracking-[0.12em]">
        CROWN
      </Link>
      <p className="mt-2 text-sm text-muted">House book</p>
      {params.error ? <p className="mt-6 text-sm text-danger">{params.error}</p> : null}
      {params.notice ? <p className="mt-6 text-sm text-ok">{params.notice}</p> : null}
      <form action={loginAction} className="mt-8 space-y-3">
        <input type="hidden" name="next" value={params.next || "/admin"} />
        <input name="email" type="email" required placeholder="Email" className="field" defaultValue={demo?.showHint ? demo.email : ""} />
        <input name="password" type="password" required placeholder="Password" className="field" />
        <button className="btn-ink w-full" type="submit">
          Sign in
        </button>
      </form>
      {!supabase && demo?.showHint ? (
        <p className="mt-4 text-xs leading-5 text-muted">
          Local book. Email {demo.email}. Password {demo.password}. This hint is hidden in production.
        </p>
      ) : null}
      {supabase ? (
        <form action={signupAction} className="mt-10 space-y-3 border-t border-line pt-8">
          <p className="text-sm leading-6">The first confirmed account becomes the owner. Later accounts stay customers until an owner sets their role to staff.</p>
          <input name="name" placeholder="Name" className="field" />
          <input name="email" type="email" required placeholder="Email" className="field" />
          <input name="password" type="password" required minLength={8} placeholder="Password" className="field" />
          <button className="btn-line w-full" type="submit">
            Create the owner account
          </button>
        </form>
      ) : null}
    </div>
  );
}
