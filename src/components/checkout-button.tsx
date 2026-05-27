"use client";

import { CreditCard, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type CheckoutButtonProps = {
  planSlug: "pro" | "business";
};

export function CheckoutButton({ planSlug }: CheckoutButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function startCheckout() {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planSlug }),
      });
      const data = (await response.json()) as { checkoutUrl?: string; error?: string };

      if (response.status === 401) {
        router.push("/login?next=/dashboard");
        return;
      }

      if (!response.ok || !data.checkoutUrl) {
        setError(data.error ?? "Nao foi possivel iniciar o checkout.");
        return;
      }

      window.location.href = data.checkoutUrl;
    } catch {
      setError("Nao foi possivel iniciar a assinatura.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={startCheckout}
        disabled={isLoading}
        className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[var(--payflow-primary-800)] px-4 text-sm font-semibold text-white shadow-[0_18px_42px_rgba(0,131,143,0.2)] transition hover:bg-[var(--payflow-primary-900)] focus:outline-none focus:ring-4 focus:ring-[var(--payflow-primary-200)] disabled:opacity-70"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <CreditCard className="h-4 w-4" />
        )}
        Assinar plano
      </button>
      {error ? (
        <p className="rounded-lg border border-[color-mix(in_srgb,var(--payflow-error)_28%,white)] bg-[color-mix(in_srgb,var(--payflow-error)_8%,white)] px-3 py-2 text-sm text-[var(--payflow-error)]">
          {error}
        </p>
      ) : null}
    </div>
  );
}
