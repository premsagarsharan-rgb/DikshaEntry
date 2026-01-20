import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { cookieName, destroySession } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(cookieName())?.value;

    await destroySession(token);

    cookieStore.set({
      name: cookieName(),
      value: "",
      httpOnly: true,
      expires: new Date(0),
      path: "/",
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[auth/logout] error", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
