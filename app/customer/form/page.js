"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import DevoteeForm from "@/components/DevoteeForm";

export default function CustomerFormPage() {
  const sp = useSearchParams();
  const token = sp.get("token");

  const [valid, setValid] = useState(false);
  const [msg, setMsg] = useState("Validating link...");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    async function validate() {
      if (!token) {
        setMsg("Missing token");
        return;
      }
      const r = await fetch(`/api/form-session/validate?token=${encodeURIComponent(token)}`);
      const d = await r.json().catch(() => ({}));
      if (!d.valid) {
        setMsg("Link expired/invalid. Please ask for a new QR.");
        setValid(false);
        return;
      }
      setValid(true);
      setMsg("");
    }
    validate();
  }, [token]);

  async function submitCustomer(data) {
    const r = await fetch("/api/customer/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, data }),
    });

    const d = await r.json().catch(() => ({}));
    if (!r.ok) {
      alert(d.error || "Submit failed");
      return;
    }

    setSubmitted(true);
  }

  return (
    <main className="min-h-screen p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Devotee Form</h1>
      {msg ? <div className="text-zinc-300 mb-4">{msg}</div> : null}

      {submitted ? (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          Submitted successfully. You can close this page now.
        </div>
      ) : valid ? (
        <DevoteeForm initialData={{ relation: "Husband", idType: "Aadhaar", confirm: false, family: [] }} onSave={submitCustomer} saveLabel="Submit" />
      ) : null}
    </main>
  );
}
