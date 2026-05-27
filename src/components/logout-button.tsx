"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={logout}
      className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[var(--payflow-border-light)] bg-white px-3 text-sm font-semibold text-[var(--payflow-text-secondary)] transition hover:bg-[var(--payflow-background-secondary)] hover:text-[var(--payflow-text-primary)] focus:outline-none focus:ring-4 focus:ring-[var(--payflow-primary-100)]"
    >
      <LogOut className="h-4 w-4" />
      Sair
    </button>
  );
}
