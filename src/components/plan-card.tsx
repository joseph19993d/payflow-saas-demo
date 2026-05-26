import Link from "next/link";
import { Check } from "lucide-react";

import { CheckoutButton } from "@/components/checkout-button";
import { formatCurrency } from "@/lib/format";

type PlanCardProps = {
  plan: {
    slug: string;
    name: string;
    description: string;
    priceCents: number;
    currency: string;
    features: string[];
  };
};

export function PlanCard({ plan }: PlanCardProps) {
  const isFree = plan.priceCents === 0;
  const isFeatured = plan.slug === "pro";

  return (
    <article
      className={`flex h-full flex-col rounded-lg border bg-white p-6 shadow-sm ${
        isFeatured ? "border-blue-300 ring-4 ring-blue-50" : "border-slate-200"
      }`}
    >
      <div>
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-xl font-semibold text-slate-950">{plan.name}</h3>
          {isFeatured ? (
            <span className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">
              Destaque
            </span>
          ) : null}
        </div>
        <p className="mt-3 min-h-12 text-sm leading-6 text-slate-600">{plan.description}</p>
        <div className="mt-5">
          <span className="text-3xl font-bold text-slate-950">
            {formatCurrency(plan.priceCents, plan.currency)}
          </span>
          <span className="ml-1 text-sm text-slate-500">/mes</span>
        </div>
      </div>

      <ul className="mt-6 space-y-3 text-sm text-slate-700">
        {plan.features.map((feature) => (
          <li key={feature} className="flex gap-2">
            <Check className="mt-0.5 h-4 w-4 flex-none text-emerald-600" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <div className="mt-6">
        {isFree ? (
          <Link
            href="/register"
            className="inline-flex h-11 w-full items-center justify-center rounded-lg border border-slate-300 px-4 text-sm font-semibold text-slate-800 transition hover:bg-slate-100"
          >
            Comecar gratis
          </Link>
        ) : (
          <CheckoutButton planSlug={plan.slug as "pro" | "business"} />
        )}
      </div>
    </article>
  );
}
