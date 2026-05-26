import Link from "next/link";
import { ArrowRight, BellRing, Database, ShieldCheck, Webhook } from "lucide-react";

import { SiteHeader } from "@/components/site-header";

const highlights = [
  {
    icon: Database,
    title: "PostgreSQL + Prisma",
    text: "Modelagem explicita para usuarios, planos, pagamentos, assinaturas e eventos de webhook.",
  },
  {
    icon: Webhook,
    title: "Webhook idempotente",
    text: "Eventos duplicados nao alteram o estado duas vezes e a confirmacao real vem do provedor.",
  },
  {
    icon: ShieldCheck,
    title: "Seguranca no servidor",
    text: "Access Token fica fora do frontend, e a assinatura do Mercado Pago e validada no backend.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50">
      <SiteHeader />

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_0.9fr] lg:py-20">
          <div className="flex flex-col justify-center">
            <p className="mb-4 text-sm font-bold uppercase tracking-normal text-emerald-700">
              Mini SaaS com pagamentos reais em sandbox
            </p>
            <h1 className="max-w-3xl text-4xl font-bold leading-tight text-slate-950 sm:text-5xl">
              Um fluxo completo de assinatura com Mercado Pago Checkout Pro.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
              PayFlow SaaS Demo simula um produto B2B onde o usuario cria conta, escolhe um plano,
              inicia o checkout e tem a assinatura ativada somente apos confirmacao segura por
              webhook.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/pricing"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Ver planos
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex h-12 items-center justify-center rounded-lg border border-slate-300 px-5 text-sm font-semibold text-slate-800 transition hover:bg-slate-100"
              >
                Acessar dashboard
              </Link>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-950 p-4 shadow-xl shadow-slate-200">
            <div className="rounded-lg bg-white p-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-normal text-slate-500">
                    Billing overview
                  </p>
                  <h2 className="mt-1 text-lg font-semibold text-slate-950">Plano Pro ativo</h2>
                </div>
                <span className="rounded-lg bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                  APPROVED
                </span>
              </div>

              <div className="grid gap-3 py-4 sm:grid-cols-3">
                {["Preferencia criada", "Pagamento consultado", "Assinatura ativa"].map(
                  (item, index) => (
                    <div key={item} className="rounded-lg border border-slate-200 p-3">
                      <span className="grid h-7 w-7 place-items-center rounded-lg bg-blue-50 text-xs font-bold text-blue-700">
                        {index + 1}
                      </span>
                      <p className="mt-3 text-sm font-semibold text-slate-800">{item}</p>
                    </div>
                  ),
                )}
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <BellRing className="h-4 w-4 text-amber-600" />
                  Webhook recebido
                </div>
                <pre className="mt-3 overflow-hidden rounded-lg bg-slate-950 p-3 text-xs leading-5 text-slate-100">
                  {`{
  "type": "payment",
  "status": "approved",
  "source": "Mercado Pago"
}`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid gap-4 md:grid-cols-3">
          {highlights.map((item) => (
            <article
              key={item.title}
              className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
            >
              <item.icon className="h-6 w-6 text-blue-600" />
              <h2 className="mt-4 text-lg font-semibold text-slate-950">{item.title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{item.text}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
