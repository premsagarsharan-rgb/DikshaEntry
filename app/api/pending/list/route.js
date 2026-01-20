import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { cookieName, getSessionByToken } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { tempDbNameForToday } from "@/lib/tempDb";

export const runtime = "nodejs";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(cookieName())?.value;
  const sess = await getSessionByToken(token);
  if (!sess) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const tempDb = await getDb(tempDbNameForToday());
  const q = { status: "pending" };

  // user sees only their own, admin sees all
  if (sess.role === "user") q.createdBy = sess.userId;

  const items = await tempDb
    .collection("pending")
    .find(q)
    .sort({ createdAt: -1 })
    .limit(50)
    .toArray();

  return NextResponse.json({
    items: items.map((x) => ({
      ...x,
      _id: x._id.toString(),
    })),
  });
}
