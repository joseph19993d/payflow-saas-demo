import type { Metadata } from "next";
import Link from "next/link";

import { AuthForm } from "@/components/auth-form";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Entrar",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const safeNext = next?.startsWith("/") && !next.startsWith("//") ? next : undefined;

  return (
    <main className="min-h-screen bg-slate-50">
      <SiteHeader />
      <section className="mx-auto grid min-h-[calc(100vh-64px)] w-full max-w-6xl place-items-center px-4 py-10 sm:px-6">
        <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-950">Entrar no PayFlow</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Acesse o dashboard para ver assinatura, historico e fluxo de billing.
          </p>
          <div className="mt-6">
            <AuthForm mode="login" nextPath={safeNext} />
          </div>
          <p className="mt-5 text-center text-sm text-slate-600">
            Ainda nao tem conta?{" "}
            <Link className="font-semibold text-blue-700 hover:text-blue-800" href="/register">
              Criar conta
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
