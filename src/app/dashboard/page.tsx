import { CreditCard, Database, ShieldCheck, Webhook } from "lucide-react";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth";
import { formatCurrency, formatDate } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?next=/dashboard");
  }

  const [subscription, lastPayment, paymentCount] = await Promise.all([
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
  ]);

  const metrics = [
    {
      label: "Plano atual",
      value: subscription?.plan.name ?? "Sem plano",
      icon: ShieldCheck,
    },
    {
      label: "Status",
      value: subscription?.status ?? "INACTIVE",
      icon: Webhook,
    },
    {
      label: "Pagamentos",
      value: paymentCount.toString(),
      icon: Database,
    },
  ];

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-bold uppercase tracking-normal text-blue-700">Dashboard</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-950">Ola, {user.name}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
          Esta area protegida mostra como o estado de billing fica persistido apos checkout e
          confirmacao por webhook.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {metrics.map((metric) => (
          <article
            key={metric.label}
            className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
          >
            <metric.icon className="h-5 w-5 text-blue-600" />
            <p className="mt-4 text-sm text-slate-500">{metric.label}</p>
            <strong className="mt-1 block text-2xl text-slate-950">{metric.value}</strong>
          </article>
        ))}
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-emerald-600" />
          <h2 className="text-lg font-semibold text-slate-950">Ultimo pagamento</h2>
        </div>

        {lastPayment ? (
          <dl className="mt-5 grid gap-4 md:grid-cols-4">
            <div>
              <dt className="text-sm text-slate-500">Plano</dt>
              <dd className="mt-1 font-semibold text-slate-950">{lastPayment.plan.name}</dd>
            </div>
            <div>
              <dt className="text-sm text-slate-500">Valor</dt>
              <dd className="mt-1 font-semibold text-slate-950">
                {formatCurrency(lastPayment.amountCents, lastPayment.currency)}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-slate-500">Status</dt>
              <dd className="mt-1 font-semibold text-slate-950">{lastPayment.status}</dd>
            </div>
            <div>
              <dt className="text-sm text-slate-500">Atualizado</dt>
              <dd className="mt-1 font-semibold text-slate-950">
                {formatDate(lastPayment.updatedAt)}
              </dd>
            </div>
          </dl>
        ) : (
          <p className="mt-4 text-sm text-slate-600">Nenhum pagamento criado ainda.</p>
        )}
      </section>
    </div>
  );
}
