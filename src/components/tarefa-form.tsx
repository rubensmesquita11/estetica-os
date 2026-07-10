"use client";

import { useActionState, useEffect, useRef } from "react";
import { SubmitButton } from "@/components/submit-button";
import { criarTarefa, type TarefaState } from "@/app/app/tarefas/actions";

interface Opcao {
  id: string;
  nome: string | null;
}

export function TarefaForm({
  responsaveis,
  pacientes,
}: {
  responsaveis: Opcao[];
  pacientes: Opcao[];
}) {
  const [state, formAction] = useActionState<TarefaState, FormData>(criarTarefa, undefined);
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok) ref.current?.reset();
  }, [state]);

  return (
    <form ref={ref} action={formAction} className="space-y-4">
      <div>
        <label className="label" htmlFor="titulo">Tarefa *</label>
        <input id="titulo" name="titulo" className="input" placeholder="Ex: Confirmar consulta de amanhã" required />
      </div>
      <div>
        <label className="label" htmlFor="descricao">Detalhes (opcional)</label>
        <textarea id="descricao" name="descricao" rows={2} className="input" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="responsavel_id">Responsável</label>
          <select id="responsavel_id" name="responsavel_id" className="input" defaultValue="">
            <option value="">Ninguém específico</option>
            {responsaveis.map((r) => <option key={r.id} value={r.id}>{r.nome ?? "Sem nome"}</option>)}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="patient_id">Paciente relacionado</label>
          <select id="patient_id" name="patient_id" className="input" defaultValue="">
            <option value="">Nenhum</option>
            {pacientes.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="prioridade">Prioridade</label>
          <select id="prioridade" name="prioridade" className="input" defaultValue="media">
            <option value="baixa">Baixa</option>
            <option value="media">Média</option>
            <option value="alta">Alta</option>
          </select>
        </div>
        <div>
          <label className="label" htmlFor="prazo">Prazo</label>
          <input id="prazo" name="prazo" type="date" className="input" />
        </div>
      </div>

      {state?.error && <p className="rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger">{state.error}</p>}

      <SubmitButton className="btn-primary">Adicionar tarefa</SubmitButton>
    </form>
  );
}
