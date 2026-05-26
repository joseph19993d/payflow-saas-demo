import Link from "next/link";
import { redirect } from "next/navigation";

import { LogoutButton } from "@/components/logout-button";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?next=/dashboard");
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex min-h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link href="/dashboard" className="flex items-center gap-3 font-semibold text-slate-950">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-slate-950 text-sm font-bold text-white">
              PF
            </span>
            <span>PayFlow Dashboard</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-slate-600 sm:inline">{user.email}</span>
            <LogoutButton />
          </div>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[220px_1fr]">
        <aside className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
          <nav className="grid gap-1 text-sm font-medium text-slate-700">
            <Link
              className="rounded-lg px-3 py-2 hover:bg-slate-100 hover:text-slate-950"
              href="/dashboard"
            >
              Visao geral
            </Link>
            <Link
              className="rounded-lg px-3 py-2 hover:bg-slate-100 hover:text-slate-950"
              href="/dashboard/billing"
            >
              Billing
            </Link>
            <Link
              className="rounded-lg px-3 py-2 hover:bg-slate-100 hover:text-slate-950"
              href="/pricing"
            >
              Trocar plano
            </Link>
          </nav>
        </aside>
        <section>{children}</section>
      </div>
    </main>
  );
}
