"use client";

import { ArrowRight, Eye, EyeOff, Loader2, Lock, Mail, User } from "lucide-react";
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
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
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
        setError(data.error ?? "Não foi possível autenticar.");
        return;
      }

      router.push(nextPath ?? data.redirectTo ?? "/dashboard");
      router.refresh();
    } catch {
      setError("Falha de conexão. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {isRegister ? (
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-[var(--payflow-text-secondary)]">
            Nome
          </span>
          <span className="flex h-12 items-center gap-3 rounded-lg border border-[var(--payflow-border-light)] bg-white px-3 shadow-[0_10px_24px_rgba(33,33,33,0.04)] transition focus-within:border-[var(--payflow-primary-500)] focus-within:ring-4 focus-within:ring-[var(--payflow-primary-100)]">
            <span className="grid h-7 w-7 place-items-center rounded-md bg-[var(--payflow-secondary-100)]">
              <User className="h-4 w-4 text-[var(--payflow-secondary-600)]" />
            </span>
            <input
              required
              name="name"
              minLength={2}
              autoComplete="name"
              className="h-full min-w-0 flex-1 border-0 bg-transparent text-[var(--payflow-text-primary)] outline-none placeholder:text-[var(--payflow-text-disabled)]"
              placeholder="Seu nome completo"
            />
          </span>
        </label>
      ) : null}

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-[var(--payflow-text-secondary)]">
          Email
        </span>
        <span className="flex h-12 items-center gap-3 rounded-lg border border-[var(--payflow-border-light)] bg-white px-3 shadow-[0_10px_24px_rgba(33,33,33,0.04)] transition focus-within:border-[var(--payflow-primary-500)] focus-within:ring-4 focus-within:ring-[var(--payflow-primary-100)]">
          <span className="grid h-7 w-7 place-items-center rounded-md bg-[var(--payflow-primary-100)]">
            <Mail className="h-4 w-4 text-[var(--payflow-primary-700)]" />
          </span>
          <input
            required
            name="email"
            type="email"
            autoComplete="email"
            className="h-full min-w-0 flex-1 border-0 bg-transparent text-[var(--payflow-text-primary)] outline-none placeholder:text-[var(--payflow-text-disabled)]"
            placeholder="voce@email.com"
          />
        </span>
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-[var(--payflow-text-secondary)]">
          Senha
        </span>
        <span className="flex h-12 items-center gap-3 rounded-lg border border-[var(--payflow-border-light)] bg-white px-3 shadow-[0_10px_24px_rgba(33,33,33,0.04)] transition focus-within:border-[var(--payflow-primary-500)] focus-within:ring-4 focus-within:ring-[var(--payflow-primary-100)]">
          <span className="grid h-7 w-7 place-items-center rounded-md bg-[var(--payflow-secondary-100)]">
            <Lock className="h-4 w-4 text-[var(--payflow-secondary-600)]" />
          </span>
          <input
            required
            name="password"
            type={isPasswordVisible ? "text" : "password"}
            minLength={isRegister ? 8 : 1}
            autoComplete={isRegister ? "new-password" : "current-password"}
            className="h-full min-w-0 flex-1 border-0 bg-transparent text-[var(--payflow-text-primary)] outline-none placeholder:text-[var(--payflow-text-disabled)]"
            placeholder={isRegister ? "Mínimo de 8 caracteres" : "Sua senha"}
          />
          <button
            type="button"
            aria-label={isPasswordVisible ? "Ocultar senha" : "Mostrar senha"}
            aria-pressed={isPasswordVisible}
            onClick={() => setIsPasswordVisible((current) => !current)}
            className="grid h-8 w-8 place-items-center rounded-md text-[var(--payflow-text-secondary)] transition hover:bg-[var(--payflow-background-secondary)] hover:text-[var(--payflow-text-primary)] focus:outline-none focus:ring-4 focus:ring-[var(--payflow-primary-100)]"
          >
            {isPasswordVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </span>
      </label>

      {error ? (
        <div className="rounded-lg border border-[color-mix(in_srgb,var(--payflow-error)_28%,white)] bg-[color-mix(in_srgb,var(--payflow-error)_8%,white)] px-3 py-2 text-sm text-[var(--payflow-error)]">
          {error}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[var(--payflow-primary-800)] px-4 text-sm font-semibold text-white shadow-[0_18px_42px_rgba(0,131,143,0.2)] transition hover:bg-[var(--payflow-primary-900)] focus:outline-none focus:ring-4 focus:ring-[var(--payflow-primary-200)] disabled:opacity-70"
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
