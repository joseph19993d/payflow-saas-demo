import { CheckCircle2, CircleAlert, Clock3, CreditCard, Sparkles } from "lucide-react";
import { redirect } from "next/navigation";

import { PlanCard } from "@/components/plan-card";
import { StatusBadge } from "@/components/status-badge";
import { getCurrentUser } from "@/lib/auth";
import { formatCurrency, formatDate } from "@/lib/format";
import { getActivePlans } from "@/lib/plans";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const checkoutMessages = {
  success: {
    icon: CheckCircle2,
    title: "Pagamento recebido pelo checkout",
    description:
      "Eu mantive a confirmação real pelo webhook. Quando o Mercado Pago confirmar, o plano aparece atualizado aqui.",
    className:
      "border-[color-mix(in_srgb,var(--payflow-success)_28%,white)] bg-[color-mix(in_srgb,var(--payflow-success)_8%,white)] text-[var(--payflow-success)]",
  },
  pending: {
    icon: Clock3,
    title: "Pagamento em análise",
    description:
      "Eu deixei este estado visível para mostrar que o dashboard lida com pagamentos que ainda não foram concluídos.",
    className:
      "border-[color-mix(in_srgb,var(--payflow-warning)_34%,white)] bg-[color-mix(in_srgb,var(--payflow-warning)_8%,white)] text-[var(--payflow-warning)]",
  },
  failure: {
    icon: CircleAlert,
    title: "Pagamento não concluído",
    description:
      "Eu preservo o plano atual quando o checkout falha e mantenho os cards disponíveis para uma nova tentativa.",
    className:
      "border-[color-mix(in_srgb,var(--payflow-error)_28%,white)] bg-[color-mix(in_srgb,var(--payflow-error)_8%,white)] text-[var(--payflow-error)]",
  },
};

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ checkout?: string }>;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?next=/dashboard");
  }

  const params = await searchParams;
  const [subscription, lastPayment, paymentCount, plans] = await Promise.all([
    prisma.subscription.findUnique({
      where: { userId: user.id },
      include: { plan: true },
    }),
    prisma.payment.findFirst({
      where: { userId: user.id },
      include: { plan: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.payment.count({ where: { userId: user.id } }),
    getActivePlans(),
  ]);

  const checkoutMessage =
    params.checkout && params.checkout in checkoutMessages
      ? checkoutMessages[params.checkout as keyof typeof checkoutMessages]
      : null;
  const CheckoutMessageIcon = checkoutMessage?.icon;

  return (
    <div className="space-y-6">
      {checkoutMessage && CheckoutMessageIcon ? (
        <section
          className={`rounded-lg border p-4 shadow-[0_12px_36px_rgba(33,33,33,0.05)] ${checkoutMessage.className}`}
        >
          <div className="flex gap-3">
            <CheckoutMessageIcon className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <h2 className="font-semibold">{checkoutMessage.title}</h2>
              <p className="mt-1 text-sm leading-6">{checkoutMessage.description}</p>
            </div>
          </div>
        </section>
      ) : null}

      <section className="overflow-hidden rounded-lg border border-[var(--payflow-border-light)] bg-white p-6 shadow-[0_18px_50px_rgba(33,33,33,0.06)]">
        <p className="inline-flex items-center gap-2 rounded-lg border border-[var(--payflow-primary-200)] bg-[var(--payflow-primary-100)] px-3 py-1.5 text-xs font-semibold text-[var(--payflow-primary-900)]">
          <Sparkles className="h-3.5 w-3.5 text-[var(--payflow-secondary-600)]" />
          Meu case SaaS
        </p>
        <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_320px] lg:items-end">
          <div>
            <h1 className="max-w-3xl text-3xl font-bold leading-tight tracking-normal text-[var(--payflow-text-primary)] sm:text-5xl">
              Eu construí este dashboard para demonstrar um fluxo real de planos e pagamento.
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--payflow-text-secondary)] sm:text-base">
              Escolha Pro ou Business para testar o checkout. Depois do pagamento, eu mostro o
              status mais recente aqui, sem depender apenas do redirect do navegador.
            </p>
          </div>

          <div className="rounded-lg border border-[var(--payflow-border-light)] bg-[var(--payflow-background-secondary)] p-4">
            <p className="text-xs font-bold uppercase tracking-normal text-[var(--payflow-primary-800)]">
              Plano atual
            </p>
            <div className="mt-3 flex items-center justify-between gap-3">
              <div>
                <strong className="block text-2xl text-[var(--payflow-text-primary)]">
                  {subscription?.plan.name ?? "Sem plano"}
                </strong>
                <p className="mt-1 text-sm text-[var(--payflow-text-secondary)]">
                  {paymentCount} tentativa{paymentCount === 1 ? "" : "s"} de pagamento
                </p>
              </div>
              <StatusBadge status={subscription?.status ?? "INACTIVE"} />
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-3">
        {plans.map((plan) => (
          <PlanCard key={plan.id} plan={plan} currentPlanSlug={subscription?.plan.slug} />
        ))}
      </section>

      <section className="rounded-lg border border-[var(--payflow-border-light)] bg-white shadow-[0_18px_50px_rgba(33,33,33,0.06)]">
        <div className="flex items-center gap-3 border-b border-[var(--payflow-border-divider)] p-6">
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-[var(--payflow-primary-100)] text-[var(--payflow-primary-800)]">
            <CreditCard className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-lg font-semibold text-[var(--payflow-text-primary)]">
              Minha última compra na demo
            </h2>
            <p className="text-sm text-[var(--payflow-text-secondary)]">
              Eu deixei este resumo para acompanhar o plano escolhido e o status mais recente.
            </p>
          </div>
        </div>

        {lastPayment ? (
          <dl className="grid gap-4 p-6 md:grid-cols-4">
            <div className="rounded-lg border border-[var(--payflow-border-light)] bg-[var(--payflow-background-secondary)] p-4">
              <dt className="text-sm text-[var(--payflow-text-secondary)]">Plano</dt>
              <dd className="mt-1 font-semibold text-[var(--payflow-text-primary)]">
                {lastPayment.plan.name}
              </dd>
            </div>
            <div className="rounded-lg border border-[var(--payflow-border-light)] bg-[var(--payflow-background-secondary)] p-4">
              <dt className="text-sm text-[var(--payflow-text-secondary)]">Valor</dt>
              <dd className="mt-1 font-semibold text-[var(--payflow-text-primary)]">
                {formatCurrency(lastPayment.amountCents, lastPayment.currency)}
              </dd>
            </div>
            <div className="rounded-lg border border-[var(--payflow-border-light)] bg-[var(--payflow-background-secondary)] p-4">
              <dt className="text-sm text-[var(--payflow-text-secondary)]">Status</dt>
              <dd className="mt-2">
                <StatusBadge status={lastPayment.status} />
              </dd>
            </div>
            <div className="rounded-lg border border-[var(--payflow-border-light)] bg-[var(--payflow-background-secondary)] p-4">
              <dt className="text-sm text-[var(--payflow-text-secondary)]">Atualizado</dt>
              <dd className="mt-1 font-semibold text-[var(--payflow-text-primary)]">
                {formatDate(lastPayment.updatedAt)}
              </dd>
            </div>
          </dl>
        ) : (
          <div className="p-6">
            <div className="rounded-lg border border-dashed border-[var(--payflow-border-medium)] bg-[var(--payflow-background-secondary)] p-6 text-sm leading-6 text-[var(--payflow-text-secondary)]">
              Eu ainda não registrei nenhum pagamento nesta conta. Assine Pro ou Business para ver o
              ciclo de checkout aparecer aqui.
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
