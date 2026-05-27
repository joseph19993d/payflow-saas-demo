import { ArrowRight, Check, Sparkles } from "lucide-react";

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
  currentPlanSlug?: string | null;
};

const planCopy: Record<
  string,
  {
    description: string;
    features: string[];
  }
> = {
  free: {
    description: "Eu uso este plano como entrada da demo, sem pagamento.",
    features: [
      "Cadastro e acesso inicial",
      "Dashboard com plano ativo",
      "Base para testar upgrade",
    ],
  },
  pro: {
    description: "Eu uso este plano para demonstrar checkout pago em um fluxo real.",
    features: [
      "Checkout Pro do Mercado Pago",
      "Pagamento salvo no banco",
      "Confirmação por webhook",
      "Assinatura ativada no dashboard",
    ],
  },
  business: {
    description: "Eu uso este plano para demonstrar o mesmo fluxo com um ticket maior.",
    features: [
      "Plano mais caro da demo",
      "Histórico financeiro no dashboard",
      "Validação de plano e valor",
      "Mesmo checkout com regras consistentes",
    ],
  },
};

export function PlanCard({ plan, currentPlanSlug }: PlanCardProps) {
  const isFree = plan.priceCents === 0;
  const isFeatured = plan.slug === "pro";
  const isBusiness = plan.slug === "business";
  const isCurrent = currentPlanSlug === plan.slug;
  const copy = planCopy[plan.slug];

  return (
    <article
      className={`relative flex h-full min-w-0 flex-col rounded-lg border bg-white p-6 shadow-[0_14px_42px_rgba(33,33,33,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_24px_70px_rgba(33,33,33,0.09)] ${
        isFeatured
          ? "border-[var(--payflow-primary-300)] ring-4 ring-[var(--payflow-primary-100)]"
          : "border-[var(--payflow-border-light)]"
      }`}
    >
      {isFeatured ? (
        <div className="absolute -top-3 left-6 inline-flex items-center gap-1.5 rounded-lg border border-[var(--payflow-primary-200)] bg-[var(--payflow-primary-800)] px-3 py-1 text-xs font-bold text-white shadow-[0_12px_30px_rgba(0,131,143,0.22)]">
          <Sparkles className="h-3.5 w-3.5" />
          Mais escolhido
        </div>
      ) : null}

      <div>
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-xl font-semibold text-[var(--payflow-text-primary)]">{plan.name}</h3>
          {isBusiness ? (
            <span className="rounded-lg border border-[var(--payflow-secondary-200)] bg-[var(--payflow-secondary-100)] px-2.5 py-1 text-xs font-bold text-[var(--payflow-secondary-700)]">
              Escala
            </span>
          ) : null}
        </div>
        <p className="mt-3 min-h-12 break-words text-sm leading-6 text-[var(--payflow-text-secondary)]">
          {copy?.description ?? plan.description}
        </p>
        <div className="mt-5">
          <span className="text-3xl font-bold text-[var(--payflow-text-primary)]">
            {formatCurrency(plan.priceCents, plan.currency)}
          </span>
          <span className="ml-1 text-sm text-[var(--payflow-text-secondary)]">por mês</span>
        </div>
      </div>

      <ul className="mt-6 space-y-3 text-sm text-[var(--payflow-text-secondary)]">
        {(copy?.features ?? plan.features).map((feature) => (
          <li key={feature} className="flex gap-2 leading-6">
            <span className="mt-0.5 grid h-5 w-5 flex-none place-items-center rounded-lg bg-[var(--payflow-primary-100)] text-[var(--payflow-primary-800)]">
              <Check className="h-3.5 w-3.5" />
            </span>
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <div className="mt-auto pt-6">
        {isCurrent ? (
          <div className="inline-flex h-11 w-full items-center justify-center rounded-lg border border-[var(--payflow-primary-200)] bg-[var(--payflow-primary-100)] px-4 text-sm font-semibold text-[var(--payflow-primary-900)]">
            Plano atual
          </div>
        ) : isFree ? (
          <div className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-[var(--payflow-border-light)] bg-white px-4 text-sm font-semibold text-[var(--payflow-text-secondary)] shadow-sm">
            Incluído na demo
            <ArrowRight className="h-4 w-4 text-[var(--payflow-secondary-600)]" />
          </div>
        ) : (
          <CheckoutButton planSlug={plan.slug as "pro" | "business"} />
        )}
      </div>
    </article>
  );
}
