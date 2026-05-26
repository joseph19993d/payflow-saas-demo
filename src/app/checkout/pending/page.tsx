import Link from "next/link";
import { Clock3 } from "lucide-react";

export default function CheckoutPendingPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 px-4">
      <section className="w-full max-w-lg rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm">
        <Clock3 className="mx-auto h-10 w-10 text-amber-600" />
        <h1 className="mt-4 text-2xl font-bold text-slate-950">Pagamento pendente</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Alguns metodos podem levar mais tempo. O dashboard sera atualizado quando o webhook for
          processado.
        </p>
        <Link
          href="/dashboard/billing"
          className="mt-6 inline-flex h-11 items-center justify-center rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white hover:bg-slate-800"
        >
          Acompanhar status
        </Link>
      </section>
    </main>
  );
}
