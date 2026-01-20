import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { cookies } from "next/headers";
import { cookieName, getSessionByToken } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";

export const runtime = "nodejs";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(cookieName())?.value;
    const sess = await getSessionByToken(token);

    if (!sess) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const metaDb = await getDb(process.env.APP_META_DB || "appmeta");

    const formToken = nanoid(48);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 min

    await metaDb.collection("formSessions").insertOne({
      formToken,
      createdBy: sess.userId,
      createdByRole: sess.role,
      createdAt: new Date(),
      expiresAt,
    });

    const url = `/customer/form?token=${encodeURIComponent(formToken)}`;
    return NextResponse.json({ ok: true, url, expiresAt });
  } catch (e) {
    console.error("[form-session/create] error", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
