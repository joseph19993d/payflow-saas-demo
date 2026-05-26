import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

export default function CheckoutSuccessPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 px-4">
      <section className="w-full max-w-lg rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm">
        <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-600" />
        <h1 className="mt-4 text-2xl font-bold text-slate-950">Pagamento enviado para analise</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          O redirect de sucesso nao ativa a assinatura sozinho. A confirmacao oficial acontece pelo
          webhook do Mercado Pago.
        </p>
        <Link
          href="/dashboard/billing"
          className="mt-6 inline-flex h-11 items-center justify-center rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white hover:bg-slate-800"
        >
          Ver billing
        </Link>
      </section>
    </main>
  );
}
