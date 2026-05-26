"use client";

import { ArrowRight, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

type AuthMode = "login" | "register";

type AuthFormProps = {
  mode: AuthMode;
  nextPath?: string;
};

export function AuthForm({ mode, nextPath }: AuthFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isRegister = mode === "register";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const payload = {
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
    };

    try {
      const response = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          isRegister ? payload : { email: payload.email, password: payload.password },
        ),
      });
      const data = (await response.json()) as { error?: string; redirectTo?: string };

      if (!response.ok) {
        setError(data.error ?? "Nao foi possivel autenticar.");
        return;
      }

      router.push(nextPath ?? data.redirectTo ?? "/dashboard");
      router.refresh();
    } catch {
      setError("Falha de conexao. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {isRegister ? (
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">Nome</span>
          <input
            required
            name="name"
            minLength={2}
            className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            placeholder="Gerson Resplandes"
          />
        </label>
      ) : null}

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-slate-700">Email</span>
        <input
          required
          name="email"
          type="email"
          className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          placeholder="voce@email.com"
        />
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-slate-700">Senha</span>
        <input
          required
          name="password"
          type="password"
          minLength={isRegister ? 8 : 1}
          className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          placeholder={isRegister ? "Minimo de 8 caracteres" : "Sua senha"}
        />
      </label>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-70"
      >
        {isSubmitting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <ArrowRight className="h-4 w-4" />
        )}
        {isRegister ? "Criar conta" : "Entrar"}
      </button>
    </form>
  );
}
