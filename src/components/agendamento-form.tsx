"use client";

import Link from "next/link";
import { useActionState } from "react";
import { SubmitButton } from "@/components/submit-button";
import { criarAgendamento, type AgendaState } from "@/app/app/agenda/actions";

interface Opcao { id: string; nome: string | null }
interface Proc extends Opcao { valor: number; duracao_min: number }

export function AgendamentoForm({
  pacientes,
  procedimentos,
  profissionais,
  dataInicial,
}: {
  pacientes: Opcao[];
  procedimentos: Proc[];
  profissionais: Opcao[];
  dataInicial: string;
}) {
  const [state, action] = useActionState<AgendaState, FormData>(criarAgendamento, undefined);

  return (
    <form action={action} className="space-y-5">
      <div>
        <label className="label" htmlFor="patient_id">Paciente *</label>
        <select id="patient_id" name="patient_id" className="input" required defaultValue="">
          <option value="" disabled>Selecione o paciente…</option>
          {pacientes.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
        </select>
        {pacientes.length === 0 && (
          <p className="mt-1 text-xs text-muted">
            Nenhum paciente ainda. <Link href="/app/pacientes/novo" className="text-primary hover:underline">Cadastrar</Link>
          </p>
        )}
      </div>

      <div>
        <label className="label" htmlFor="procedure_id">Procedimento</label>
        <select id="procedure_id" name="procedure_id" className="input" defaultValue="">
          <option value="">Selecione…</option>
          {procedimentos.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
        </select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="data">Data *</label>
          <input id="data" name="data" type="date" className="input" defaultValue={dataInicial} required />
        </div>
        <div>
          <label className="label" htmlFor="hora">Horário *</label>
          <input id="hora" name="hora" type="time" className="input" defaultValue="09:00" required />
        </div>
        <div>
          <label className="label" htmlFor="duracao_min">Duração (min)</label>
          <input id="duracao_min" name="duracao_min" type="number" className="input" placeholder="do procedimento" />
        </div>
        <div>
          <label className="label" htmlFor="valor">Valor (R$)</label>
          <input id="valor" name="valor" type="text" inputMode="decimal" className="input" placeholder="do procedimento" />
        </div>
      </div>

      <div>
        <label className="label" htmlFor="profissional_id">Profissional</label>
        <select id="profissional_id" name="profissional_id" className="input" defaultValue="">
          <option value="">Selecione…</option>
          {profissionais.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
        </select>
      </div>

      <div>
        <label className="label" htmlFor="observacoes">Observações</label>
        <textarea id="observacoes" name="observacoes" rows={2} className="input" />
      </div>

      {state?.error && (
        <p className="rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger">{state.error}</p>
      )}

      <div className="flex items-center gap-3">
        <SubmitButton className="btn-primary" pendingText="Agendando…">Agendar</SubmitButton>
        <Link href="/app/agenda" className="btn-ghost">Cancelar</Link>
      </div>
    </form>
  );
}
