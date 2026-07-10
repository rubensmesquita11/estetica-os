"use client";

import { useActionState } from "react";
import { SubmitButton } from "@/components/submit-button";
import { atualizarClinica, type ConfigState } from "@/app/app/configuracoes/actions";
import type { Organization } from "@/lib/types";

export function ClinicaForm({ org }: { org: Organization }) {
  const [state, action] = useActionState<ConfigState, FormData>(atualizarClinica, undefined);

  return (
    <form action={action} className="space-y-4">
      <div>
        <label className="label" htmlFor="nome">Nome da clínica</label>
        <input id="nome" name="nome" className="input" defaultValue={org.nome} required />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="label" htmlFor="cnpj">CNPJ</label>
          <input id="cnpj" name="cnpj" className="input" defaultValue={org.cnpj ?? ""} />
        </div>
        <div>
          <label className="label" htmlFor="telefone">Telefone</label>
          <input id="telefone" name="telefone" className="input" defaultValue={org.telefone ?? ""} />
        </div>
        <div>
          <label className="label" htmlFor="cidade">Cidade</label>
          <input id="cidade" name="cidade" className="input" defaultValue={org.cidade ?? ""} />
        </div>
      </div>

      {state?.error && <p className="rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger">{state.error}</p>}
      {state?.ok && <p className="rounded-lg bg-success-soft px-3 py-2 text-sm text-success">{state.ok}</p>}

      <SubmitButton className="btn-primary">Salvar</SubmitButton>
    </form>
  );
}
