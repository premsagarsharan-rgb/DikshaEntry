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
    try {
      const r = await fetch("/api/pending/list");
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Failed to load");
      setItems(d.items || []);
    } catch (e) {
      setMsg(e.message);
    }
  }

  useEffect(() => {
    if (open) load();
  }, [open]);

  async function reject(id) {
    if (!confirm("Reject this pending entry?")) return;

    const r = await fetch(`/api/pending/reject/${id}`, { method: "DELETE" });
    if (!r.ok) {
      const d = await r.json().catch(() => ({}));
      alert(d.error || "Reject failed");
      return;
    }

    localStorage.removeItem(lsKey(id));
    load();
  }

  async function submit(id) {
    const raw = localStorage.getItem(lsKey(id));
    if (!raw) {
      alert("Pehle Edit karke Save karo");
      return;
    }

    const editedData = JSON.parse(raw);

    if (!editedData.confirm) {
      alert("Confirm checkbox tick karo");
      return;
    }

    const ok = confirm(
      `Final check:\nName: ${editedData.fullName}\nMobile: ${editedData.mobileNumber}\n\nSubmit?`
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

    const blob = await r.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "print.docx";
    a.click();
    URL.revokeObjectURL(url);

    localStorage.removeItem(lsKey(id));
    load();
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-3xl rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Recent Pending</h3>
          <button onClick={onClose}>✕</button>
        </div>

        {msg && <div className="text-red-400 mt-3">{msg}</div>}

        <div className="mt-4 grid gap-3">
          {items.map((it) => {
            const isSaved = !!localStorage.getItem(lsKey(it._id));

            return (
              <div
                key={it._id}
                className={`rounded-xl border p-4 transition
                  ${
                    isSaved
                      ? "border-green-500 bg-green-500/5"
                      : "border-zinc-700"
                  }`}
              >
                <div className="font-semibold">{it.fullName}</div>
                <div className="text-sm text-zinc-400">
                  Mobile: {it.mobileNumber}
                </div>

                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => router.push(`/pending/edit/${it._id}`)}
                    className="px-3 py-1 rounded bg-zinc-800"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => reject(it._id)}
                    className="px-3 py-1 rounded bg-red-600/80"
                  >
                    Reject
                  </button>

                  <button
                    onClick={() => submit(it._id)}
                    className={`px-3 py-1 rounded font-semibold
                      ${
                        isSaved
                          ? "bg-green-600 text-white"
                          : "bg-zinc-700 text-zinc-300"
                      }`}
                  >
                    Submit
                  </button>
                </div>
              </div>
            );
          })}

          {!items.length && (
            <div className="text-zinc-400 text-sm">
              No pending records.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
