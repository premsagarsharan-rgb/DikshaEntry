import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { cookies } from "next/headers";
import { cookieName, getSessionByToken } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { tempDbNameForToday } from "@/lib/tempDb";

export const runtime = "nodejs";

export async function GET(req, { params }) {
  const cookieStore = await cookies();
  const token = cookieStore.get(cookieName())?.value;
  const sess = await getSessionByToken(token);
  if (!sess) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = params.id;
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const tempDb = await getDb(tempDbNameForToday());
  const doc = await tempDb.collection("pending").findOne({ _id: new ObjectId(id) });

  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (sess.role === "user" && doc.createdBy !== sess.userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  doc._id = doc._id.toString();
  return NextResponse.json({ doc });
}
