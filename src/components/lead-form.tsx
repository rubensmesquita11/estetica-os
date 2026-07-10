"use client";

import Link from "next/link";
import { useActionState } from "react";
import { SubmitButton } from "@/components/submit-button";
import { criarLead, type LeadState } from "@/app/app/leads/actions";

const ORIGENS = ["Instagram", "Indicação", "Google", "Facebook", "WhatsApp", "Tráfego pago", "Outro"];

export function LeadForm({
  responsaveis,
}: {
  responsaveis: { id: string; nome: string | null }[];
}) {
  const [state, action] = useActionState<LeadState, FormData>(criarLead, undefined);

  return (
    <form action={action} className="space-y-4">
      <div>
        <label className="label" htmlFor="nome">Nome *</label>
        <input id="nome" name="nome" className="input" required />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="telefone">Telefone / WhatsApp</label>
          <input id="telefone" name="telefone" className="input" placeholder="(11) 90000-0000" />
        </div>
        <div>
          <label className="label" htmlFor="instagram">Instagram</label>
          <input id="instagram" name="instagram" className="input" placeholder="@usuario" />
        </div>
        <div>
          <label className="label" htmlFor="email">E-mail</label>
          <input id="email" name="email" type="email" className="input" />
        </div>
        <div>
          <label className="label" htmlFor="procedimento_interesse">Procedimento de interesse</label>
          <input id="procedimento_interesse" name="procedimento_interesse" className="input" placeholder="Ex: Botox" />
        </div>
        <div>
          <label className="label" htmlFor="origem">Origem</label>
          <select id="origem" name="origem" className="input" defaultValue="">
            <option value="">Selecione…</option>
            {ORIGENS.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="valor_potencial">Valor potencial (R$)</label>
          <input id="valor_potencial" name="valor_potencial" inputMode="decimal" className="input" placeholder="800,00" />
        </div>
        <div>
          <label className="label" htmlFor="temperatura">Temperatura</label>
          <select id="temperatura" name="temperatura" className="input" defaultValue="morno">
            <option value="frio">🧊 Frio</option>
            <option value="morno">🌤️ Morno</option>
            <option value="quente">🔥 Quente</option>
          </select>
        </div>
        <div>
          <label className="label" htmlFor="responsavel_id">Responsável</label>
          <select id="responsavel_id" name="responsavel_id" className="input" defaultValue="">
            <option value="">Ninguém específico</option>
            {responsaveis.map((r) => <option key={r.id} value={r.id}>{r.nome ?? "Sem nome"}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label className="label" htmlFor="observacoes">Observações</label>
        <textarea id="observacoes" name="observacoes" rows={2} className="input" />
      </div>

      {state?.error && <p className="rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger">{state.error}</p>}

      <div className="flex items-center gap-3">
        <SubmitButton className="btn-primary">Cadastrar lead</SubmitButton>
        <Link href="/app/leads" className="btn-ghost">Cancelar</Link>
      </div>
    </form>
  );
}
