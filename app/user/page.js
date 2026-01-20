"use client";

import { useState } from "react";
import TopBar from "@/components/TopBar";
import RecentPendingModal from "@/components/RecentPendingModal";
import SendFormCard from "@/components/SendFormCard";
import Link from "next/link";

export default function UserHome() {
  const [pendingOpen, setPendingOpen] = useState(false);

  return (
    <main className="min-h-screen p-6 max-w-5xl mx-auto">
      <TopBar title="User Home" />

      {/* Home cards */}
      <div className="grid md:grid-cols-2 gap-6">
        <button
          onClick={() => setPendingOpen(true)}
          className="text-left rounded-2xl border border-zinc-800 bg-zinc-900 p-8 hover:bg-zinc-800 transition"
        >
          <h2 className="text-xl font-semibold">Recent Pending</h2>
          <p className="text-zinc-400 mt-2">View / Edit / Reject / Submit</p>
        </button>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-8">
          <h2 className="text-xl font-semibold">Add Devotee</h2>
          <p className="text-zinc-400 mt-2">Send Form (QR) OR Add Manual</p>

          <div className="mt-4 grid md:grid-cols-2 gap-4">
            <SendFormCard />
            <Link href="/manual" className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 hover:bg-zinc-900 transition">
              <h3 className="text-lg font-semibold">Add Manual</h3>
              <p className="text-zinc-400 text-sm mt-1">Direct permanent entry</p>
              <div className="mt-4 inline-block rounded-xl bg-white text-black font-semibold px-4 py-2">
                Open Form
              </div>
            </Link>
          </div>
        </div>
      </div>

      <RecentPendingModal open={pendingOpen} onClose={() => setPendingOpen(false)} />
    </main>
  );
}
