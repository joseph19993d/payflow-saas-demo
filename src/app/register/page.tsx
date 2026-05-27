import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, LayoutDashboard, LockKeyhole, LogIn, WalletCards } from "lucide-react";

import { AuthForm } from "@/components/auth-form";

export const metadata: Metadata = {
  title: "Criar conta",
};

export default function RegisterPage() {
  return (
    <main className="relative grid min-h-[100svh] overflow-x-hidden bg-[var(--payflow-background-primary)] px-5 py-6 text-[var(--payflow-text-primary)] sm:px-8">
      <Link
        href="/"
        className="absolute left-5 top-5 inline-flex items-center gap-2 rounded-lg border border-[var(--payflow-border-light)] bg-white px-3 py-2 text-sm font-semibold text-[var(--payflow-text-primary)] shadow-sm transition hover:bg-[var(--payflow-background-secondary)] sm:left-8 sm:top-6"
      >
        <ArrowLeft className="h-4 w-4 text-[var(--payflow-secondary-600)]" />
        Início
      </Link>

      <section className="mx-auto grid w-full max-w-[calc(100vw-2.5rem)] items-center gap-10 self-center pt-16 sm:max-w-5xl lg:grid-cols-[1fr_420px] lg:pt-0">
        <div className="mx-auto w-full max-w-xl text-center lg:mx-0 lg:text-left">
          <Image
            src="/payflow-mark.svg"
            alt="PayFlow"
            width={96}
            height={96}
            priority
            className="mx-auto h-16 w-16 lg:mx-0"
          />

          <p className="mt-5 inline-flex items-center gap-2 rounded-lg border border-[var(--payflow-primary-200)] bg-[var(--payflow-primary-100)] px-3 py-1.5 text-xs font-semibold text-[var(--payflow-primary-900)]">
            <WalletCards className="h-3.5 w-3.5 text-[var(--payflow-secondary-600)]" />
            Minha demo
          </p>

          <h1 className="mx-auto mt-5 max-w-[20rem] text-3xl font-bold leading-tight tracking-normal sm:max-w-xl sm:text-6xl lg:mx-0">
            Crie sua conta na demo.
          </h1>
          <p className="mx-auto mt-4 max-w-[18.5rem] text-sm leading-6 text-[var(--payflow-text-secondary)] sm:max-w-xl sm:text-lg sm:leading-7 lg:mx-0">
            Crie uma conta para testar o PayFlow como usuário real e ver como eu organizei acesso,
            planos e pagamento em uma experiência SaaS.
          </p>

          <div className="mt-7 grid gap-3 text-sm font-semibold sm:grid-cols-3">
            <div className="flex items-center justify-center gap-2 rounded-lg border border-[var(--payflow-border-light)] bg-white px-4 py-3 shadow-[0_10px_28px_rgba(33,33,33,0.05)] lg:justify-start">
              <LockKeyhole className="h-4 w-4 text-[var(--payflow-secondary-600)]" />
              Cadastro
            </div>
            <div className="flex items-center justify-center gap-2 rounded-lg border border-[var(--payflow-border-light)] bg-white px-4 py-3 shadow-[0_10px_28px_rgba(33,33,33,0.05)] lg:justify-start">
              <WalletCards className="h-4 w-4 text-[var(--payflow-primary-700)]" />
              Planos
            </div>
            <div className="flex items-center justify-center gap-2 rounded-lg border border-[var(--payflow-border-light)] bg-white px-4 py-3 shadow-[0_10px_28px_rgba(33,33,33,0.05)] lg:justify-start">
              <LayoutDashboard className="h-4 w-4 text-[var(--payflow-accent-default)]" />
              Dashboard
            </div>
          </div>
        </div>

        <div className="w-full rounded-lg border border-[var(--payflow-border-light)] bg-white p-6 shadow-[0_24px_70px_rgba(33,33,33,0.08)] sm:p-8">
          <p className="text-sm font-bold uppercase tracking-normal text-[var(--payflow-primary-800)]">
            Cadastro
          </p>
          <h2 className="mt-3 text-3xl font-bold text-[var(--payflow-text-primary)]">
            Criar conta
          </h2>
          <p className="mt-2 text-sm leading-6 text-[var(--payflow-text-secondary)]">
            Crie uma conta Free e acesse o dashboard que eu preparei para o projeto.
          </p>
          <div className="mt-7">
            <AuthForm mode="register" />
          </div>
          <p className="mt-6 text-center text-sm text-[var(--payflow-text-secondary)]">
            Já tem conta?{" "}
            <Link
              className="inline-flex items-center gap-1.5 font-semibold text-[var(--payflow-primary-800)] hover:text-[var(--payflow-primary-900)]"
              href="/login"
            >
              <LogIn className="h-3.5 w-3.5" />
              Entrar
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
