import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { tempDbNameForToday } from "@/lib/tempDb";

export const runtime = "nodejs";

function basicValidate(dev) {
  if (!dev?.fullName) return "Full Name required";
  if (!dev?.relation) return "Relation required";
  if (!dev?.relationName) return "Relation Name required";
  if (!dev?.gender) return "Gender required";
  if (!dev?.maritalStatus) return "Marital Status required";
  if (!dev?.address) return "Address required";
  if (!dev?.mobileNumber) return "Mobile Number required";
  if (!dev?.idType) return "ID Type required";
  if (!dev?.idNumber) return "ID Number required";
  if (!dev?.confirm) return "Confirm checkbox required";
  return null;
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { token, data } = body || {};

    if (!token) return NextResponse.json({ error: "Missing token" }, { status: 400 });

    const metaDb = await getDb(process.env.APP_META_DB || "appmeta");
    const fsess = await metaDb.collection("formSessions").findOne({ formToken: token });

    if (!fsess) return NextResponse.json({ error: "Invalid/expired token" }, { status: 401 });
    if (new Date(fsess.expiresAt).getTime() <= Date.now()) {
      return NextResponse.json({ error: "Token expired" }, { status: 401 });
    }

    const err = basicValidate(data);
    if (err) return NextResponse.json({ error: err }, { status: 400 });

    // TEMP DB per date
    const tempDb = await getDb(tempDbNameForToday());
    const pendingCol = tempDb.collection("pending");

    const doc = {
      ...data,
      confirm: true,
      createdBy: fsess.createdBy,
      source: "qr",
      createdAt: new Date(),
      status: "pending",
    };

    const r = await pendingCol.insertOne(doc);

    // expire token immediately after submit
    await metaDb.collection("formSessions").deleteOne({ formToken: token });

    return NextResponse.json({ ok: true, insertedId: r.insertedId.toString() });
  } catch (e) {
    console.error("[customer/submit] error", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
