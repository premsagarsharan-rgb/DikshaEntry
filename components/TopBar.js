"use client";

import { useRouter } from "next/navigation";

export default function TopBar({ title }) {
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  }

  return (
    <div className="flex items-center justify-between mb-6">
      <h1 className="text-2xl font-semibold">{title}</h1>
      <button onClick={logout} className="rounded-xl border border-zinc-700 px-4 py-2 hover:bg-zinc-900">
        Logout
      </button>
    </div>
  );
}
