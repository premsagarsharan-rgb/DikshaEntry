"use client";

import { useEffect, useState } from "react";
import TopBar from "@/components/TopBar";
import RecentPendingModal from "@/components/RecentPendingModal";
import SendFormCard from "@/components/SendFormCard";
import Link from "next/link";

export default function AdminPage() {
  // State for Admin User Management
  const [users, setUsers] = useState([]);
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");

  // State for Operations (Same as User)
  const [pendingOpen, setPendingOpen] = useState(false);

  // Load Users logic
  async function loadUsers() {
    const r = await fetch("/api/admin/users");
    const d = await r.json().catch(() => ({}));
    if (!r.ok) return alert(d.error || "Failed");
    setUsers(d.users || []);
  }

  useEffect(() => { loadUsers(); }, []);

  // Create User logic
  async function createUser() {
    const r = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, password, role }),
    });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) return alert(d.error || "Create failed");
    setUserId(""); setPassword("");
    loadUsers();
  }

  // Delete User logic
  async function del(u) {
    if (!confirm(`Delete ${u.userId}?`)) return;
    const r = await fetch("/api/admin/users", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: u.userId }),
    });
    if (!r.ok) {
      const d = await r.json().catch(() => ({}));
      return alert(d.error || "Delete failed");
    }
    loadUsers();
  }

  return (
    <main className="min-h-screen p-6 max-w-6xl mx-auto">
      <TopBar title="Admin Dashboard (Full Access)" />

      {/* SECTION 1: OPERATIONS (Devotee Management) */}
      <div className="mb-10">
        <h2 className="text-2xl font-bold mb-6 text-zinc-100 border-b border-zinc-800 pb-2">
          Operations & Data Entry
        </h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* Card 1: Recent Pending (Admin sees ALL pending) */}
          <button
            onClick={() => setPendingOpen(true)}
            className="text-left rounded-2xl border border-blue-900/30 bg-blue-950/20 p-8 hover:bg-blue-900/30 transition relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition">
              <span className="text-6xl">⏳</span>
            </div>
            <h2 className="text-xl font-semibold text-blue-200">Recent Pending (All)</h2>
            <p className="text-zinc-400 mt-2">View / Edit / Reject / Submit anyone's entry</p>
          </button>

          {/* Card 2: Add Devotee Wrapper */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-8">
            <h2 className="text-xl font-semibold">Add Devotee</h2>
            <p className="text-zinc-400 mt-2">Send Form (QR) OR Add Manual</p>

            <div className="mt-4 grid lg:grid-cols-2 gap-4">
              {/* QR Code Logic */}
              <SendFormCard />
              
              {/* Manual Entry Logic */}
              <Link href="/manual" className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 hover:bg-zinc-900 transition flex flex-col justify-center">
                <h3 className="text-lg font-semibold">Add Manual</h3>
                <p className="text-zinc-400 text-sm mt-1">Direct permanent entry</p>
                <div className="mt-4 inline-block text-center rounded-xl bg-white text-black font-semibold px-4 py-2">
                  Open Form
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: SYSTEM MANAGEMENT (Create/Delete Users) */}
      <div>
        <h2 className="text-2xl font-bold mb-6 text-zinc-100 border-b border-zinc-800 pb-2">
          System Management
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Create User Form */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 h-fit">
            <h2 className="text-lg font-semibold mb-4">Create New User</h2>
            <div className="space-y-3">
              <input className="w-full rounded-xl bg-zinc-950 border border-zinc-800 p-3"
                placeholder="UserId"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
              />
              <input className="w-full rounded-xl bg-zinc-950 border border-zinc-800 p-3"
                placeholder="Password"
                value={password}
                type="password"
                onChange={(e) => setPassword(e.target.value)}
              />
              <select className="w-full rounded-xl bg-zinc-950 border border-zinc-800 p-3"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
              <button onClick={createUser} className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-4 py-3 transition">
                Create Account
              </button>
            </div>
          </div>

          {/* User List */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
            <h2 className="text-lg font-semibold mb-4">Existing Users</h2>
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {users.map((u) => (
                <div key={u._id} className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-950 p-3">
                  <div>
                    <div className="font-semibold text-zinc-200">{u.userId}</div>
                    <div className="text-xs text-zinc-500 uppercase font-bold tracking-wider">{u.role}</div>
                  </div>
                  {u.userId !== "admin" && (
                    <button onClick={() => del(u)} className="text-red-400 hover:text-red-300 text-sm px-3 py-1 bg-red-900/20 rounded-lg transition">
                      Delete
                    </button>
                  )}
                </div>
              ))}
              {users.length === 0 && <div className="text-zinc-500">No users found.</div>}
            </div>
          </div>
        </div>
      </div>

      {/* Reuse the SAME Modal logic as User, so Submit flow is identical */}
      <RecentPendingModal open={pendingOpen} onClose={() => setPendingOpen(false)} />
    </main>
  );
}
