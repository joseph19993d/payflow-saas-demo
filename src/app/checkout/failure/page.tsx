import Link from "next/link";
import { XCircle } from "lucide-react";

export default function CheckoutFailurePage() {
  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 px-4">
      <section className="w-full max-w-lg rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm">
        <XCircle className="mx-auto h-10 w-10 text-red-600" />
        <h1 className="mt-4 text-2xl font-bold text-slate-950">Pagamento nao concluido</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Nenhum acesso pago e liberado pelo frontend. Tente novamente pela pagina de precos.
        </p>
        <Link
          href="/pricing"
          className="mt-6 inline-flex h-11 items-center justify-center rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white hover:bg-slate-800"
        >
          Voltar aos planos
        </Link>
      </section>
    </main>
  );
}
