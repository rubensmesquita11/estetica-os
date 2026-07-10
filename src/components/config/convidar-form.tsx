"use client";

import { useActionState } from "react";
import { SubmitButton } from "@/components/submit-button";
import { convidarMembro, type ConfigState } from "@/app/app/configuracoes/actions";
import { CARGO_LABEL, type Cargo } from "@/lib/types";

const CARGOS: Cargo[] = ["gestor", "recepcao", "comercial", "profissional", "financeiro"];

export function ConvidarForm() {
  const [state, action] = useActionState<ConfigState, FormData>(convidarMembro, undefined);

  return (
    <form action={action} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="label" htmlFor="nome">Nome</label>
          <input id="nome" name="nome" className="input" required />
        </div>
        <div>
          <label className="label" htmlFor="email">E-mail</label>
          <input id="email" name="email" type="email" className="input" required />
        </div>
        <div>
          <label className="label" htmlFor="cargo">Cargo</label>
          <select id="cargo" name="cargo" className="input" defaultValue="profissional">
            {CARGOS.map((c) => <option key={c} value={c}>{CARGO_LABEL[c]}</option>)}
          </select>
        </div>
      </div>

      {state?.error && <p className="rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger">{state.error}</p>}
      {state?.ok && (
        <div className="rounded-lg bg-success-soft px-3 py-2 text-sm text-success">
          <p>{state.ok}</p>
          {state.senha && (
            <p className="mt-1">
              Envie estes dados de acesso:<br />
              <strong>E-mail:</strong> {state.email}<br />
              <strong>Senha provisória:</strong> <code className="rounded bg-white/60 px-1">{state.senha}</code>
            </p>
          )}
        </div>
      )}

      <SubmitButton className="btn-primary" pendingText="Adicionando…">Adicionar à equipe</SubmitButton>
    </form>
  );
}
