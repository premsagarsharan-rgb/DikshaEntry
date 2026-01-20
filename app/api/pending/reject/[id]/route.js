import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { cookies } from "next/headers";
import { cookieName, getSessionByToken } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { tempDbNameForToday } from "@/lib/tempDb";

export const runtime = "nodejs";

export async function DELETE(req, { params }) {
  const cookieStore = await cookies();
  const token = cookieStore.get(cookieName())?.value;
  const sess = await getSessionByToken(token);
  if (!sess) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = params.id;
  const tempDb = await getDb(tempDbNameForToday());
  const col = tempDb.collection("pending");

  const doc = await col.findOne({ _id: new ObjectId(id) });
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (sess.role === "user" && doc.createdBy !== sess.userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await col.deleteOne({ _id: new ObjectId(id) });
  return NextResponse.json({ ok: true });
}
