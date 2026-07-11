"use client";

import { useActionState, useEffect, useRef } from "react";
import { SubmitButton } from "@/components/submit-button";
import { registrarIndicacao, type IndicacaoState } from "@/app/app/indicacoes/actions";

export function IndicacaoForm({ pacientes }: { pacientes: { id: string; nome: string }[] }) {
  const [state, formAction] = useActionState<IndicacaoState, FormData>(registrarIndicacao, undefined);
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok) ref.current?.reset();
  }, [state]);

  return (
    <form ref={ref} action={formAction} className="space-y-4">
      <div>
        <label className="label" htmlFor="indicador_id">Quem indicou (paciente) *</label>
        <select id="indicador_id" name="indicador_id" className="input" defaultValue="" required>
          <option value="" disabled>Selecione o paciente…</option>
          {pacientes.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
        </select>
      </div>
      <div>
        <label className="label" htmlFor="indicado_nome">Nome de quem foi indicado *</label>
        <input id="indicado_nome" name="indicado_nome" className="input" placeholder="Ex: Carla Mendes" required />
      </div>

      {state?.error && <p className="rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger">{state.error}</p>}

      <SubmitButton className="btn-primary">Registrar indicação</SubmitButton>
    </form>
  );
}
