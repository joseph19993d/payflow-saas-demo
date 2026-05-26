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
        router.push("/login?next=/pricing");
        return;
      }

      if (!response.ok || !data.checkoutUrl) {
        setError(data.error ?? "Nao foi possivel iniciar o checkout.");
        return;
      }

      window.location.href = data.checkoutUrl;
    } catch {
      setError("Falha ao conectar com o servidor.");
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
        className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-70"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <CreditCard className="h-4 w-4" />
        )}
        Assinar com Mercado Pago
      </button>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
