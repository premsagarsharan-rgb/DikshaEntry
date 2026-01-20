import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { cookieName, getSessionByToken } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(cookieName())?.value;
  const sess = await getSessionByToken(token);

  if (!sess) return NextResponse.json({ authenticated: false });

  return NextResponse.json({ authenticated: true, ...sess });
}
