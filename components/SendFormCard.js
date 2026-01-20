"use client";

import { useState } from "react";
// FIX: Named import use karo, default nahi
import { QRCodeCanvas } from "qrcode.react";

export default function SendFormCard() {
  const [url, setUrl] = useState("");
  const [err, setErr] = useState("");

  async function generate() {
    setErr("");
    const r = await fetch("/api/form-session/create", { method: "POST" });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) return setErr(data.error || "Failed");

    // full absolute URL for QR
    const full = window.location.origin + data.url;
    setUrl(full);
  }

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
      <h3 className="text-lg font-semibold">Send Form (QR)</h3>
      <p className="text-zinc-400 text-sm mt-1">Generate QR → customer scans → only form access</p>

      <button onClick={generate} className="mt-4 rounded-xl bg-white text-black font-semibold px-4 py-2">
        Generate QR
      </button>

      {err ? <div className="text-red-400 text-sm mt-3">{err}</div> : null}

      {url ? (
        <div className="mt-5 flex flex-col items-center gap-2">
          <div className="bg-white p-3 rounded-xl">
            {/* FIX: QRCodeCanvas component use kiya */}
            <QRCodeCanvas value={url} size={200} />
          </div>
          <div className="text-xs text-zinc-400 break-all text-center">{url}</div>
        </div>
      ) : null}
    </div>
  );
}
