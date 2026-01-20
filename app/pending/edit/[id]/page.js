"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import TopBar from "@/components/TopBar";
import DevoteeForm from "@/components/DevoteeForm";

function lsKey(id) {
  return `pending_edit_${id}`;
}

export default function PendingEditPage() {
  const { id } = useParams();
  const router = useRouter();
  const [doc, setDoc] = useState(null);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    async function load() {
      setMsg("");
      const r = await fetch(`/api/pending/get/${id}`);
      const d = await r.json().catch(() => ({}));
      if (!r.ok) return setMsg(d.error || "Load failed");
      setDoc(d.doc);
    }
    if (id) load();
  }, [id]);

  function saveToLocalStorage(data) {
    localStorage.setItem(lsKey(id), JSON.stringify(data));
    alert("Saved to LocalStorage. Ab Submit button se final kar sakte ho.");
    router.push("/user");
  }

  return (
    <main className="min-h-screen p-6 max-w-5xl mx-auto">
      <TopBar title={`Edit Pending: ${id}`} />
      {msg ? <div className="text-red-400">{msg}</div> : null}
      {doc ? <DevoteeForm initialData={doc} onSave={saveToLocalStorage} saveLabel="Save (LocalStorage)" /> : null}
    </main>
  );
}
