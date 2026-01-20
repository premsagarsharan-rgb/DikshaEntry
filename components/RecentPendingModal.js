"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

function lsKey(id) {
  return `pending_edit_${id}`;
}

export default function RecentPendingModal({ open, onClose }) {
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [msg, setMsg] = useState("");

  async function load() {
    setMsg("");
    const r = await fetch("/api/pending/list");
    const d = await r.json().catch(() => ({}));
    if (!r.ok) return setMsg(d.error || "Failed to load");
    setItems(d.items || []);
  }

  useEffect(() => {
    if (open) load();
  }, [open]);

  async function reject(id) {
    if (!confirm("Reject this pending entry?")) return;
    const r = await fetch(`/api/pending/reject/${id}`, { method: "DELETE" });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) return alert(d.error || "Reject failed");
    localStorage.removeItem(lsKey(id));
    load();
  }

  async function submit(id) {
    // CORE RULE: submit uses ONLY localStorage edited data
    const raw = localStorage.getItem(lsKey(id));
    if (!raw) {
      alert("Pehle Edit karke Save karo (LocalStorage data missing).");
      return;
    }

    const editedData = JSON.parse(raw);

    // Pre-print verification (simple)
    const ok = confirm(
      `Final check:\nName: ${editedData.fullName}\nMobile: ${editedData.mobileNumber}\n\nConfirm submit?`
    );
    if (!ok) return;

    const r = await fetch(`/api/pending/submit/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ editedData }),
    });

    if (!r.ok) {
      const d = await r.json().catch(() => ({}));
      alert(d.error || "Submit failed");
      return;
    }

    // download docx
    const blob = await r.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "print.docx";
    a.click();
    window.URL.revokeObjectURL(url);

    // cleanup local storage
    localStorage.removeItem(lsKey(id));
    load();
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-3xl rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Recent Pending</h3>
          <button onClick={onClose} className="text-zinc-300 hover:text-white">✕</button>
        </div>

        {msg ? <div className="text-red-400 text-sm mt-3">{msg}</div> : null}

        <div className="mt-4 grid gap-3">
          {items.map((it) => (
            <div key={it._id} className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
              <div className="font-semibold">{it.fullName}</div>
              <div className="text-sm text-zinc-400">
                Mobile: {it.mobileNumber} • ID: {it.idType} {it.idNumber}
              </div>

              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => router.push(`/pending/edit/${it._id}`)}
                  className="rounded-lg border border-zinc-700 px-3 py-1 hover:bg-zinc-800"
                >
                  Edit
                </button>
                <button
                  onClick={() => reject(it._id)}
                  className="rounded-lg border border-red-700 px-3 py-1 hover:bg-red-900/30"
                >
                  Reject
                </button>
                <button
                  onClick={() => submit(it._id)}
                  className="rounded-lg bg-white text-black px-3 py-1 font-semibold"
                >
                  Submit
                </button>
              </div>

              <div className="text-xs text-zinc-500 mt-2">
                Tip: Edit page pe "Save" karoge tabhi Submit chalega.
              </div>
            </div>
          ))}
          {!items.length ? (
            <div className="text-zinc-400 text-sm">No pending records for today.</div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
