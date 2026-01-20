import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { cookieName, getSessionByToken } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";

export const runtime = "nodejs";

async function requireAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get(cookieName())?.value;
  const sess = await getSessionByToken(token);
  if (!sess || sess.role !== "admin") return null;
  return sess;
}

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const metaDb = await getDb(process.env.APP_META_DB || "appmeta");
  const users = await metaDb
    .collection("users")
    .find({}, { projection: { passwordHash: 0 } })
    .sort({ createdAt: -1 })
    .toArray();

  return NextResponse.json({ users });
}

export async function POST(req) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const { userId, password, role } = body || {};
  if (!userId || !password || !role) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  if (!["user", "admin"].includes(role)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  const metaDb = await getDb(process.env.APP_META_DB || "appmeta");
  const passwordHash = await bcrypt.hash(password, 10);

  try {
    await metaDb.collection("users").insertOne({
      userId,
      role,
      passwordHash,
      createdAt: new Date(),
      createdBy: admin.userId,
    });
  } catch (e) {
    console.error("[admin/users POST] error", e);
    return NextResponse.json({ error: "UserId already exists?" }, { status: 409 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(req) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const { userId } = body || {};
  if (!userId) return NextResponse.json({ error: "Missing userId" }, { status: 400 });

  const metaDb = await getDb(process.env.APP_META_DB || "appmeta");
  await metaDb.collection("users").deleteOne({ userId });

  return NextResponse.json({ ok: true });
}
