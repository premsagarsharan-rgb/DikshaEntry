"use client";

import TopBar from "@/components/TopBar";
import DevoteeForm from "@/components/DevoteeForm";

export default function ManualPage() {
  async function submitManual(data) {
    const r = await fetch("/api/manual/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data }),
    });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) return alert(d.error || "Failed");
    alert("Saved to Permanent DB.");
  }

  return (
    <main className="min-h-screen p-6 max-w-5xl mx-auto">
      <TopBar title="Add Manual (Permanent)" />
      <DevoteeForm
        initialData={{ relation: "Husband", idType: "Aadhaar", confirm: false, family: [] }}
        onSave={submitManual}
        saveLabel="Submit (Permanent)"
      />
    </main>
  );
}
