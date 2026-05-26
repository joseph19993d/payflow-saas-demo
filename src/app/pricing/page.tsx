import type { Metadata } from "next";

import { PlanCard } from "@/components/plan-card";
import { SiteHeader } from "@/components/site-header";
import { getActivePlans } from "@/lib/plans";

export const metadata: Metadata = {
  title: "Precos",
};

export const dynamic = "force-dynamic";

export default async function PricingPage() {
  const plans = await getActivePlans();

  return (
    <main className="min-h-screen bg-slate-50">
      <SiteHeader />

      <section className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6">
        <div className="max-w-3xl">
          <p className="text-sm font-bold uppercase tracking-normal text-blue-700">Planos</p>
          <h1 className="mt-3 text-4xl font-bold text-slate-950">
            Escolha um plano e simule o checkout.
          </h1>
          <p className="mt-4 text-lg leading-8 text-slate-600">
            Os planos pagos iniciam uma preferencia no Mercado Pago. O dashboard so muda para plano
            ativo quando o webhook confirma o pagamento.
          </p>
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {plans.map((plan) => (
            <PlanCard key={plan.id} plan={plan} />
          ))}
        </div>
      </section>
    </main>
  );
}
