import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { getDb } from "@/lib/mongodb";
import { cookieName, createSession, getSessionByToken } from "@/lib/auth";
import { ensureIndexes } from "@/lib/ensureIndexes";

export const runtime = "nodejs";

export async function POST(req) {
  await ensureIndexes();

  try {
    const body = await req.json();
    const { role, userId, password } = body || {};

    if (!role || !userId || !password) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // BLOCK if already logged in
    const cookieStore = await cookies();
    const existing = cookieStore.get(cookieName())?.value;
    if (existing) {
      const sess = await getSessionByToken(existing);
      if (sess) {
        return NextResponse.json(
          { error: "Already logged in. Logout first." },
          { status: 409 }
        );
      }
    }

    const metaDb = await getDb(process.env.APP_META_DB || "appmeta");
    const user = await metaDb.collection("users").findOne({ userId, role });

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const { token, expiresAt } = await createSession({ userId, role });

    cookieStore.set({
      name: cookieName(),
      value: token,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      expires: expiresAt,
    });

    return NextResponse.json({ ok: true, role, userId });
  } catch (e) {
    console.error("[auth/login] error", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
