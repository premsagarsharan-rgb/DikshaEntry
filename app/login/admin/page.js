import LoginForm from "@/components/LoginForm";

export default function AdminLogin() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <LoginForm role="admin" />
    </main>
  );
}
