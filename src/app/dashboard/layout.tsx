import Link from "next/link";
import Image from "next/image";
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
    <main className="min-h-screen bg-[var(--payflow-background-primary)] text-[var(--payflow-text-primary)]">
      <header className="sticky top-0 z-20 border-b border-[var(--payflow-border-divider)] bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex min-h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link
            href="/dashboard"
            className="flex min-w-0 items-center gap-3 font-semibold text-[var(--payflow-text-primary)]"
          >
            <Image
              src="/payflow-mark.svg"
              alt="PayFlow"
              width={40}
              height={40}
              className="h-10 w-10 shrink-0"
            />
            <span className="truncate">PayFlow</span>
          </Link>
          <div className="flex shrink-0 items-center gap-3">
            <span className="hidden max-w-56 truncate rounded-lg border border-[var(--payflow-border-light)] bg-white px-3 py-2 text-sm font-medium text-[var(--payflow-text-secondary)] sm:inline">
              {user.email}
            </span>
            <LogoutButton />
          </div>
        </div>
      </header>

      <section className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:py-8">{children}</section>
    </main>
  );
}
