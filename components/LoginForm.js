"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginForm({ role }) {
  const router = useRouter();
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setMsg("");

    const r = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role, userId, password }),
    });

    const data = await r.json().catch(() => ({}));
    if (!r.ok) return setMsg(data.error || "Login failed");

    router.push(role === "admin" ? "/admin" : "/user");
  }

  return (
    <form onSubmit={onSubmit} className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
      <h1 className="text-xl font-semibold">{role === "admin" ? "Admin Login" : "User Login"}</h1>

      <div className="mt-4 space-y-3">
        <input className="w-full rounded-xl bg-zinc-950 border border-zinc-800 p-3"
          placeholder="Admin ID"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
        />
        <input className="w-full rounded-xl bg-zinc-950 border border-zinc-800 p-3"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {msg ? <div className="text-red-400 text-sm">{msg}</div> : null}
        <button className="w-full rounded-xl bg-white text-black font-semibold p-3">
          Login
        </button>
      </div>
    </form>
  );
}
