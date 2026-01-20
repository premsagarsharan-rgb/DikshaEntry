import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { cookieName, getSessionByToken } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";

export const runtime = "nodejs";

export async function POST(req) {
  const cookieStore = await cookies();
  const token = cookieStore.get(cookieName())?.value;
  const sess = await getSessionByToken(token);
  if (!sess) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const data = body?.data;

  if (!data?.fullName) return NextResponse.json({ error: "Full Name required" }, { status: 400 });

  const sittingDb = await getDb(process.env.SITTING_DB || "sitting");
  await sittingDb.collection("devotees").insertOne({
    ...data,
    createdBy: sess.userId,
    createdRole: sess.role,
    createdAt: new Date(),
    source: "manual",
  });

  return NextResponse.json({ ok: true });
}
