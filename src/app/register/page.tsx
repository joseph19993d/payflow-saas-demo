import type { Metadata } from "next";
import Link from "next/link";

import { AuthForm } from "@/components/auth-form";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Criar conta",
};

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <SiteHeader />
      <section className="mx-auto grid min-h-[calc(100vh-64px)] w-full max-w-6xl place-items-center px-4 py-10 sm:px-6">
        <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-950">Criar conta</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            O cadastro cria uma assinatura Free para demonstrar o estado inicial do produto.
          </p>
          <div className="mt-6">
            <AuthForm mode="register" />
          </div>
          <p className="mt-5 text-center text-sm text-slate-600">
            Ja tem conta?{" "}
            <Link className="font-semibold text-blue-700 hover:text-blue-800" href="/login">
              Entrar
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
