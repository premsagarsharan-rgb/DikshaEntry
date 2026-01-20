import Link from "next/link";

export default function Landing() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="grid md:grid-cols-2 gap-6 w-full max-w-4xl">
        <Link href="/login/admin" className="rounded-2xl border border-zinc-800 bg-zinc-900 p-8 hover:bg-zinc-800 transition">
          <h2 className="text-2xl font-semibold">Admin Panel</h2>
          <p className="text-zinc-400 mt-2">Login as Admin</p>
        </Link>

        <Link href="/login/user" className="rounded-2xl border border-zinc-800 bg-zinc-900 p-8 hover:bg-zinc-800 transition">
          <h2 className="text-2xl font-semibold">User Panel</h2>
          <p className="text-zinc-400 mt-2">Login as User</p>
        </Link>
      </div>
    </main>
  );
}
