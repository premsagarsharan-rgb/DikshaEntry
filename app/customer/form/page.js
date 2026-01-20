import { Suspense } from "react";
import CustomerFormClient from "./CustomerFormClient";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6">Loading form…</div>}>
      <CustomerFormClient />
    </Suspense>
  );
}
