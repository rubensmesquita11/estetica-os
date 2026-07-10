"use client";

import Link from "next/link";
import { useActionState } from "react";
import { SubmitButton } from "@/components/submit-button";
import type { PacienteState } from "@/app/app/pacientes/actions";
import type { Patient } from "@/lib/types";

const ORIGENS = ["Instagram", "Indicação", "Google", "Facebook", "WhatsApp", "Passou na frente", "Outro"];

export function PacienteForm({
  action,
  paciente,
  voltarHref,
}: {
  action: (prev: PacienteState, fd: FormData) => Promise<PacienteState>;
  paciente?: Patient;
  voltarHref: string;
}) {
  const [state, formAction] = useActionState<PacienteState, FormData>(action, undefined);

  return (
    <form action={formAction} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="label" htmlFor="nome">Nome completo *</label>
          <input id="nome" name="nome" className="input" defaultValue={paciente?.nome ?? ""} required />
        </div>
        <div>
          <label className="label" htmlFor="telefone">Telefone / WhatsApp</label>
          <input id="telefone" name="telefone" className="input" defaultValue={paciente?.telefone ?? ""} placeholder="(11) 90000-0000" />
        </div>
        <div>
          <label className="label" htmlFor="email">E-mail</label>
          <input id="email" name="email" type="email" className="input" defaultValue={paciente?.email ?? ""} />
        </div>
        <div>
          <label className="label" htmlFor="nascimento">Data de nascimento</label>
          <input id="nascimento" name="nascimento" type="date" className="input" defaultValue={paciente?.nascimento ?? ""} />
        </div>
        <div>
          <label className="label" htmlFor="profissao">Profissão</label>
          <input id="profissao" name="profissao" className="input" defaultValue={paciente?.profissao ?? ""} />
        </div>
        <div>
          <label className="label" htmlFor="cidade">Cidade</label>
          <input id="cidade" name="cidade" className="input" defaultValue={paciente?.cidade ?? ""} />
        </div>
        <div>
          <label className="label" htmlFor="instagram">Instagram</label>
          <input id="instagram" name="instagram" className="input" defaultValue={paciente?.instagram ?? ""} placeholder="@usuario" />
        </div>
        <div className="sm:col-span-2">
          <label className="label" htmlFor="origem">Como conheceu a clínica?</label>
          <select id="origem" name="origem" className="input" defaultValue={paciente?.origem ?? ""}>
            <option value="">Selecione…</option>
            {ORIGENS.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="label" htmlFor="observacoes">Observações</label>
          <textarea id="observacoes" name="observacoes" rows={3} className="input" defaultValue={paciente?.observacoes ?? ""} />
        </div>
      </div>

      {state?.error && (
        <p className="rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger">{state.error}</p>
      )}

      <div className="flex items-center gap-3">
        <SubmitButton className="btn-primary">
          {paciente ? "Salvar alterações" : "Cadastrar paciente"}
        </SubmitButton>
        <Link href={voltarHref} className="btn-ghost">Cancelar</Link>
      </div>
    </form>
  );
}
