"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signIn, type AuthState } from "@/app/auth/actions";
import { SubmitButton } from "@/components/submit-button";

export default function LoginPage() {
  const [state, action] = useActionState<AuthState, FormData>(signIn, undefined);

  return (
    <div className="grid min-h-screen place-items-center px-6">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-8 flex items-center justify-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-fg font-semibold">
            E
          </span>
          <span className="text-lg font-semibold tracking-tight">Estética OS</span>
        </Link>

        <div className="card">
          <h1 className="text-xl font-semibold">Entrar</h1>
          <p className="mt-1 text-sm text-muted">Acesse o painel da sua clínica.</p>

          <form action={action} className="mt-6 space-y-4">
            <div>
              <label className="label" htmlFor="email">E-mail</label>
              <input id="email" name="email" type="email" autoComplete="email"
                className="input" placeholder="voce@clinica.com" required />
            </div>
            <div>
              <label className="label" htmlFor="password">Senha</label>
              <input id="password" name="password" type="password"
                autoComplete="current-password" className="input" placeholder="••••••••" required />
            </div>

            {state?.error && (
              <p className="rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger">
                {state.error}
              </p>
            )}

            <SubmitButton className="btn-primary w-full">Entrar</SubmitButton>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-muted">
          Não tem conta?{" "}
          <Link href="/cadastro" className="font-medium text-primary hover:underline">
            Criar agora
          </Link>
        </p>
      </div>
    </div>
  );
}
