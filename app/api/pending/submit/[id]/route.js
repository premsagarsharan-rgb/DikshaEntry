import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { cookieName, getSessionByToken } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { tempDbNameForToday } from "@/lib/tempDb";
import { renderDevoteeDocx } from "@/lib/docx";

export const runtime = "nodejs";

function validateEditedData(d) {
  if (!d) return "Missing editedData";
  if (!d.fullName) return "Full Name required";
  if (!d.mobileNumber) return "Mobile Number required";
  if (!d.confirm) return "Confirm required";
  return null;
}

export async function POST(req, { params }) {
  try {
    const token = cookies().get(cookieName())?.value;
    const sess = await getSessionByToken(token);
    if (!sess)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { editedData } = await req.json();
    const err = validateEditedData(editedData);
    if (err)
      return NextResponse.json({ error: err }, { status: 400 });

    const tempDb = await getDb(tempDbNameForToday());
    const pendingCol = tempDb.collection("pending");

    const pendingDoc = await pendingCol.findOne({
      _id: new ObjectId(params.id),
    });
    if (!pendingDoc)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (
      sess.role === "user" &&
      pendingDoc.createdBy !== sess.userId
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const docxBuffer = renderDevoteeDocx(editedData);

    const sittingDb = await getDb(process.env.SITTING_DB || "sitting");
    await sittingDb.collection("devotees").insertOne({
      ...editedData,
      approvedBy: sess.userId,
      approvedAt: new Date(),
    });

    await pendingCol.deleteOne({ _id: pendingDoc._id });

    return new Response(docxBuffer, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="Devotee_${editedData.fullName}.docx"`,
      },
    });
  } catch (e) {
    console.error("[pending/submit]", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
