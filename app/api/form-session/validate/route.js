import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

export const runtime = "nodejs";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) return NextResponse.json({ valid: false });

  const metaDb = await getDb(process.env.APP_META_DB || "appmeta");
  const sess = await metaDb.collection("formSessions").findOne({ formToken: token });

  if (!sess) return NextResponse.json({ valid: false });
  if (new Date(sess.expiresAt).getTime() <= Date.now()) return NextResponse.json({ valid: false });

  return NextResponse.json({ valid: true, createdBy: sess.createdBy });
}
