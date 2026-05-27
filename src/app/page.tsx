import Image from "next/image";
import Link from "next/link";
import { ArrowRight, LockKeyhole, Sparkles, WalletCards } from "lucide-react";
import { FaLinkedinIn } from "react-icons/fa";
import {
  SiGithub,
  SiMercadopago,
  SiNextdotjs,
  SiPostgresql,
  SiPrisma,
  SiTailwindcss,
  SiTypescript,
} from "react-icons/si";

const technologies = [
  { name: "Next.js", icon: SiNextdotjs, color: "#000000" },
  { name: "TypeScript", icon: SiTypescript, color: "#3178C6" },
  { name: "PostgreSQL", icon: SiPostgresql, color: "#4169E1" },
  { name: "Prisma", icon: SiPrisma, color: "#2D3748" },
  { name: "TailwindCSS", icon: SiTailwindcss, color: "#06B6D4" },
  { name: "Mercado Pago", icon: SiMercadopago, color: "#00B1EA" },
];

export default function Home() {
  return (
    <main className="relative grid h-[100svh] max-h-[100svh] w-screen overflow-hidden bg-[var(--payflow-background-primary)] px-5 py-6 text-[var(--payflow-text-primary)] sm:px-8">
      <div className="pointer-events-none absolute inset-x-10 bottom-0 h-px bg-gradient-to-r from-transparent via-[var(--payflow-primary-100)] to-transparent" />

      <section className="relative mx-auto flex h-full w-full min-w-0 max-w-[calc(100vw-2.5rem)] flex-col items-center justify-center text-center sm:max-w-5xl">
        <Image
          src="/payflow-mark.svg"
          alt="PayFlow"
          width={96}
          height={96}
          priority
          className="mb-5 h-16 w-16 rounded-2xl sm:h-24 sm:w-24 sm:rounded-[22px]"
        />

        <div className="inline-flex items-center gap-2 rounded-lg border border-[var(--payflow-primary-200)] bg-[var(--payflow-primary-100)] px-3 py-1.5 text-xs font-semibold text-[var(--payflow-primary-900)] shadow-sm">
          <Sparkles className="h-3.5 w-3.5 text-[var(--payflow-secondary-600)]" />
          Meu case de pagamentos
        </div>

        <h1 className="mt-4 w-full max-w-[20rem] text-4xl font-bold leading-tight tracking-normal text-[var(--payflow-text-primary)] sm:max-w-4xl sm:text-7xl sm:leading-none lg:text-8xl">
          PayFlow SaaS Demo
        </h1>

        <p className="mt-4 w-full max-w-[20rem] text-sm leading-6 text-[var(--payflow-text-secondary)] sm:max-w-2xl sm:text-lg sm:leading-7">
          Eu criei este projeto para demonstrar backend, autenticação e uso de API de pagamentos em
          um fluxo SaaS real.
        </p>

        <div className="mt-5 grid w-full max-w-[21rem] grid-cols-2 gap-2.5 sm:flex sm:max-w-4xl sm:flex-wrap sm:items-center sm:justify-center">
          {technologies.map((technology) => {
            const Icon = technology.icon;

            return (
              <span
                key={technology.name}
                className="inline-flex min-h-11 items-center justify-center gap-2.5 rounded-lg border border-[var(--payflow-border-light)] bg-[var(--payflow-background-primary)] px-3 py-2 text-xs font-semibold text-[var(--payflow-text-primary)] shadow-[0_10px_28px_rgba(33,33,33,0.06)] sm:px-4 sm:text-sm"
              >
                <Icon className="h-5 w-5" style={{ color: technology.color }} />
                {technology.name}
              </span>
            );
          })}
        </div>

        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/register"
            className="inline-flex h-11 min-w-44 items-center justify-center gap-2 rounded-lg bg-[var(--payflow-primary-800)] px-5 text-sm font-semibold text-white shadow-[0_18px_42px_rgba(0,131,143,0.24)] transition hover:bg-[var(--payflow-primary-900)] focus:outline-none focus:ring-4 focus:ring-[var(--payflow-primary-200)]"
          >
            <WalletCards className="h-4 w-4" />
            Criar conta
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/login"
            className="inline-flex h-11 min-w-36 items-center justify-center gap-2 rounded-lg border border-[var(--payflow-border-light)] bg-[var(--payflow-background-primary)] px-5 text-sm font-semibold text-[var(--payflow-text-primary)] shadow-sm transition hover:bg-[var(--payflow-background-secondary)] focus:outline-none focus:ring-4 focus:ring-[var(--payflow-primary-100)]"
          >
            <LockKeyhole className="h-4 w-4 text-[var(--payflow-secondary-600)]" />
            Entrar
          </Link>
        </div>
      </section>

      <div className="absolute bottom-6 right-6 flex items-center gap-3">
        <a
          href="https://github.com/GersonResplandes"
          target="_blank"
          rel="noreferrer"
          aria-label="GitHub de Gerson Resplandes"
          className="grid h-10 w-10 place-items-center rounded-lg border border-[var(--payflow-border-light)] bg-[var(--payflow-background-primary)] text-[var(--payflow-text-primary)] shadow-sm transition hover:bg-[var(--payflow-background-secondary)]"
        >
          <SiGithub className="h-5 w-5" />
        </a>
        <a
          href="https://www.linkedin.com/in/gerson-resplandes"
          target="_blank"
          rel="noreferrer"
          aria-label="LinkedIn de Gerson Resplandes"
          className="grid h-10 w-10 place-items-center rounded-lg border border-[var(--payflow-border-light)] bg-[var(--payflow-background-primary)] text-[var(--payflow-text-primary)] shadow-sm transition hover:bg-[var(--payflow-background-secondary)]"
        >
          <FaLinkedinIn className="h-5 w-5 text-[var(--payflow-secondary-600)]" />
        </a>
      </div>
    </main>
  );
}
