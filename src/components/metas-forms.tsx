"use client";

import { useActionState, useEffect, useRef } from "react";
import { SubmitButton } from "@/components/submit-button";
import { salvarMeta, salvarComissao, type MetaState } from "@/app/app/metas/actions";

interface Prof { id: string; nome: string | null }

export function MetaForm({ profissionais }: { profissionais: Prof[] }) {
  const [state, action] = useActionState<MetaState, FormData>(salvarMeta, undefined);
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => { if (state?.ok) ref.current?.reset(); }, [state]);

  return (
    <form ref={ref} action={action} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="label" htmlFor="escopo">Meta de</label>
          <select id="escopo" name="escopo" className="input" defaultValue="clinica">
            <option value="clinica">Clínica (total)</option>
            <option value="profissional">Um profissional</option>
          </select>
        </div>
        <div>
          <label className="label" htmlFor="meta_prof">Profissional</label>
          <select id="meta_prof" name="profissional_id" className="input" defaultValue="">
            <option value="">— (se for da clínica)</option>
            {profissionais.map((p) => <option key={p.id} value={p.id}>{p.nome ?? "Sem nome"}</option>)}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="valor_meta">Meta do mês (R$)</label>
          <input id="valor_meta" name="valor_meta" inputMode="decimal" className="input" placeholder="80.000,00" />
        </div>
      </div>
      {state?.error && <p className="rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger">{state.error}</p>}
      <SubmitButton className="btn-primary">Salvar meta</SubmitButton>
    </form>
  );
}

export function ComissaoForm({ profissionais }: { profissionais: Prof[] }) {
  const [state, action] = useActionState<MetaState, FormData>(salvarComissao, undefined);
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => { if (state?.ok) ref.current?.reset(); }, [state]);

  return (
    <form ref={ref} action={action} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="com_prof">Profissional</label>
          <select id="com_prof" name="profissional_id" className="input" defaultValue="">
            <option value="">Regra geral (todos)</option>
            {profissionais.map((p) => <option key={p.id} value={p.id}>{p.nome ?? "Sem nome"}</option>)}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="percentual">Comissão (%)</label>
          <input id="percentual" name="percentual" inputMode="decimal" className="input" placeholder="10" />
        </div>
      </div>
      {state?.error && <p className="rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger">{state.error}</p>}
      <SubmitButton className="btn-primary">Salvar comissão</SubmitButton>
    </form>
  );
}
