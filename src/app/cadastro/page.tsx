"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signUp, type AuthState } from "@/app/auth/actions";
import { SubmitButton } from "@/components/submit-button";

export default function CadastroPage() {
  const [state, action] = useActionState<AuthState, FormData>(signUp, undefined);

  return (
    <div className="grid min-h-screen place-items-center px-6 py-10">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-8 flex items-center justify-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-fg font-semibold">
            E
          </span>
          <span className="text-lg font-semibold tracking-tight">Estética OS</span>
        </Link>

        <div className="card">
          <h1 className="text-xl font-semibold">Criar conta</h1>
          <p className="mt-1 text-sm text-muted">Comece a organizar e crescer sua clínica.</p>

          <form action={action} className="mt-6 space-y-4">
            <div>
              <label className="label" htmlFor="nome">Seu nome</label>
              <input id="nome" name="nome" className="input" placeholder="Dra. Maria" required />
            </div>
            <div>
              <label className="label" htmlFor="email">E-mail</label>
              <input id="email" name="email" type="email" autoComplete="email"
                className="input" placeholder="voce@clinica.com" required />
            </div>
            <div>
              <label className="label" htmlFor="password">Senha</label>
              <input id="password" name="password" type="password" autoComplete="new-password"
                className="input" placeholder="mínimo 6 caracteres" required />
            </div>

            {state?.error && (
              <p className="rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger">{state.error}</p>
            )}
            {state?.message && (
              <p className="rounded-lg bg-success-soft px-3 py-2 text-sm text-success">{state.message}</p>
            )}

            <SubmitButton className="btn-primary w-full">Criar conta</SubmitButton>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-muted">
          Já tem conta?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">Entrar</Link>
        </p>
      </div>
    </div>
  );
}
