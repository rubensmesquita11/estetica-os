"use client";

import { useActionState } from "react";
import { SubmitButton } from "@/components/submit-button";
import { criarCampanha, type CampanhaState } from "@/app/app/campanhas/actions";
import { SEGMENTO_LABEL, type Segmento } from "@/lib/segments";

export function CampanhaForm() {
  const [state, formAction] = useActionState<CampanhaState, FormData>(criarCampanha, undefined);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label className="label" htmlFor="nome">Nome da campanha *</label>
        <input id="nome" name="nome" className="input" placeholder="Ex: Reativação de julho" required />
      </div>
      <div>
        <label className="label" htmlFor="segmento">Público-alvo</label>
        <select id="segmento" name="segmento" className="input" defaultValue="inativos">
          {(Object.keys(SEGMENTO_LABEL) as Segmento[]).map((s) => (
            <option key={s} value={s}>{SEGMENTO_LABEL[s]}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="label" htmlFor="mensagem">Mensagem (modelo)</label>
        <textarea id="mensagem" name="mensagem" rows={3} className="input"
          placeholder="Oi {nome}! Sentimos sua falta na clínica…" />
      </div>

      {state?.error && <p className="rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger">{state.error}</p>}

      <SubmitButton className="btn-primary">Criar campanha</SubmitButton>
    </form>
  );
}
