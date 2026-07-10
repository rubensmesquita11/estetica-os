"use client";

import { useActionState } from "react";
import { SubmitButton } from "@/components/submit-button";
import { criarPlano, type PlanoState } from "@/app/app/pacientes/[id]/planos/actions";
import type { Procedure } from "@/lib/types";

export function PlanoForm({
  patientId,
  procedimentos,
}: {
  patientId: string;
  procedimentos: Pick<Procedure, "id" | "nome">[];
}) {
  const action = criarPlano.bind(null, patientId);
  const [state, formAction] = useActionState<PlanoState, FormData>(action, undefined);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label className="label" htmlFor="nome">Nome do plano *</label>
        <input id="nome" name="nome" className="input" placeholder="Ex: Protocolo facial completo" required />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="procedure_id">Procedimento (opcional)</label>
          <select id="procedure_id" name="procedure_id" className="input" defaultValue="">
            <option value="">Nenhum</option>
            {procedimentos.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="total_sessoes">Nº de sessões *</label>
          <input id="total_sessoes" name="total_sessoes" type="number" min={1} max={100} defaultValue={5} className="input" required />
        </div>
        <div>
          <label className="label" htmlFor="valor_total">Valor total (R$)</label>
          <input id="valor_total" name="valor_total" inputMode="decimal" className="input" placeholder="1200,00" />
        </div>
        <div>
          <label className="label" htmlFor="validade">Validade (opcional)</label>
          <input id="validade" name="validade" type="date" className="input" />
        </div>
      </div>

      {state?.error && <p className="rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger">{state.error}</p>}

      <SubmitButton className="btn-primary" pendingText="Criando plano…">Criar plano</SubmitButton>
    </form>
  );
}
