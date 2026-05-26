import Link from "next/link";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth";
import { formatCurrency, formatDate } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function BillingPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?next=/dashboard/billing");
  }

  const [subscription, payments] = await Promise.all([
    prisma.subscription.findUnique({
      where: { userId: user.id },
      include: { plan: true },
    }),
    prisma.payment.findMany({
      where: { userId: user.id },
      include: { plan: true },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-bold uppercase tracking-normal text-blue-700">Billing</p>
        <div className="mt-3 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h1 className="text-3xl font-bold text-slate-950">
              {subscription?.plan.name ?? "Sem plano ativo"}
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Status da assinatura:{" "}
              <strong className="text-slate-950">{subscription?.status ?? "INACTIVE"}</strong>
            </p>
          </div>
          <Link
            href="/pricing"
            className="inline-flex h-11 items-center justify-center rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Alterar plano
          </Link>
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-950">Historico de pagamentos</h2>
          <p className="mt-1 text-sm text-slate-600">
            Cada tentativa de checkout gera um registro local com status auditavel.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-normal text-slate-500">
              <tr>
                <th className="px-6 py-3">Plano</th>
                <th className="px-6 py-3">Valor</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Preference</th>
                <th className="px-6 py-3">Atualizado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {payments.map((payment) => (
                <tr key={payment.id}>
                  <td className="px-6 py-4 font-medium text-slate-950">{payment.plan.name}</td>
                  <td className="px-6 py-4 text-slate-700">
                    {formatCurrency(payment.amountCents, payment.currency)}
                  </td>
                  <td className="px-6 py-4">
                    <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
                      {payment.status}
                    </span>
                  </td>
                  <td className="max-w-[220px] truncate px-6 py-4 font-mono text-xs text-slate-500">
                    {payment.mercadoPagoPreferenceId ?? "-"}
                  </td>
                  <td className="px-6 py-4 text-slate-700">{formatDate(payment.updatedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {payments.length === 0 ? (
          <div className="p-6 text-sm text-slate-600">Nenhum pagamento registrado.</div>
        ) : null}
      </section>
    </div>
  );
}
