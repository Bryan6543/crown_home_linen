import { NextResponse } from "next/server";
import { unsubscribeByToken } from "@/lib/repo";

export async function POST(request: Request) {
  const url = new URL(request.url);
  let token = url.searchParams.get("token") || "";
  if (!token) {
    const body = (await request.json().catch(() => null)) as { token?: string } | null;
    token = body?.token || "";
  }
  if (!token) return NextResponse.json({ error: "Missing token." }, { status: 400 });
  const result = await unsubscribeByToken(token);
  if (result === "missing") return NextResponse.json({ error: "This link is not on the list." }, { status: 404 });
  return NextResponse.json({ result });
}
