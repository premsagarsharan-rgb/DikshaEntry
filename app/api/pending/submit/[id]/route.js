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
    const cookieStore = await cookies();
    const token = cookieStore.get(cookieName())?.value;
    const sess = await getSessionByToken(token);
    if (!sess) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const id = params.id;
    const body = await req.json();
    const editedData = body?.editedData;

    // IMPORTANT: submit uses ONLY client supplied localStorage edited data
    const err = validateEditedData(editedData);
    if (err) return NextResponse.json({ error: err }, { status: 400 });

    const tempDb = await getDb(tempDbNameForToday());
    const pendingCol = tempDb.collection("pending");

    // still verify ownership
    const pendingDoc = await pendingCol.findOne({ _id: new ObjectId(id) });
    if (!pendingDoc) return NextResponse.json({ error: "Pending not found" }, { status: 404 });

    if (sess.role === "user" && pendingDoc.createdBy !== sess.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 1) Generate DOCX from TEMPLATE (fill blanks)
    const docxBuffer = renderDevoteeDocx(editedData);

    // 2) Insert into permanent "Sitting" DB
    const sittingDb = await getDb(process.env.SITTING_DB || "sitting");
    await sittingDb.collection("devotees").insertOne({
      ...editedData,
      approvedBy: sess.userId,
      approvedRole: sess.role,
      approvedAt: new Date(),
      source: "pending",
    });

    // 3) Delete from temp pending
    await pendingCol.deleteOne({ _id: new ObjectId(id) });

    // 4) Return DOCX file to client for print
    const fileName = `Devotee_${(editedData.fullName || "Print").replaceAll(" ", "_")}.docx`;

    return new Response(docxBuffer, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch (e) {
    console.error("[pending/submit] error", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
