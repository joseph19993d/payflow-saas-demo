import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex min-h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-3 font-semibold text-slate-950">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-slate-950 text-sm font-bold text-white">
            PF
          </span>
          <span>PayFlow SaaS</span>
        </Link>

        <nav className="flex items-center gap-2 text-sm font-medium text-slate-600">
          <Link
            className="rounded-lg px-3 py-2 hover:bg-slate-100 hover:text-slate-950"
            href="/pricing"
          >
            Precos
          </Link>
          <Link
            className="rounded-lg px-3 py-2 hover:bg-slate-100 hover:text-slate-950"
            href="/login"
          >
            Entrar
          </Link>
          <Link
            className="rounded-lg bg-slate-950 px-3 py-2 text-white hover:bg-slate-800"
            href="/register"
          >
            Criar conta
          </Link>
        </nav>
      </div>
    </header>
  );
}
