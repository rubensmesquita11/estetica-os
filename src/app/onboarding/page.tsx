"use client";

import { useActionState } from "react";
import { criarClinica, type OnboardingState } from "./actions";
import { SubmitButton } from "@/components/submit-button";

export default function OnboardingPage() {
  const [state, action] = useActionState<OnboardingState, FormData>(
    criarClinica,
    undefined,
  );

  return (
    <div className="grid min-h-screen place-items-center px-6 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <span className="badge bg-primary-soft text-primary">Passo 1 de 1</span>
          <h1 className="mt-3 text-2xl font-semibold">Bem-vinda à Estética OS 🌸</h1>
          <p className="mt-1 text-sm text-muted">
            Vamos criar a sua clínica. Leva menos de um minuto.
          </p>
        </div>

        <div className="card">
          <form action={action} className="space-y-4">
            <div>
              <label className="label" htmlFor="nome_clinica">Nome da clínica</label>
              <input id="nome_clinica" name="nome_clinica" className="input"
                placeholder="Clínica Beleza & Saúde" required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label" htmlFor="cidade">Cidade</label>
                <input id="cidade" name="cidade" className="input" placeholder="São Paulo" />
              </div>
              <div>
                <label className="label" htmlFor="telefone">Telefone</label>
                <input id="telefone" name="telefone" className="input" placeholder="(11) 90000-0000" />
              </div>
            </div>
            <div>
              <label className="label" htmlFor="seu_nome">Seu nome (responsável)</label>
              <input id="seu_nome" name="seu_nome" className="input" placeholder="Dra. Maria Silva" required />
            </div>

            {state?.error && (
              <p className="rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger">{state.error}</p>
            )}

            <SubmitButton className="btn-primary w-full" pendingText="Criando sua clínica…">
              Criar clínica e entrar
            </SubmitButton>
          </form>
        </div>
      </div>
    </div>
  );
}
