"use client";

import { useActionState, useEffect, useRef } from "react";
import { SubmitButton } from "@/components/submit-button";
import { criarLancamento, type FinState } from "@/app/app/financeiro/actions";

const CATEGORIAS = [
  "Procedimento", "Pacote", "Produto",
  "Aluguel", "Folha", "Fornecedores", "Marketing", "Impostos", "Equipamentos", "Manutenção", "Outra",
];

export function LancamentoForm() {
  const [state, formAction] = useActionState<FinState, FormData>(criarLancamento, undefined);
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => { if (state?.ok) ref.current?.reset(); }, [state]);

  return (
    <form ref={ref} action={formAction} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="tipo">Tipo</label>
          <select id="tipo" name="tipo" className="input" defaultValue="receita">
            <option value="receita">Entrada (receita)</option>
            <option value="despesa">Saída (despesa)</option>
          </select>
        </div>
        <div>
          <label className="label" htmlFor="valor">Valor (R$) *</label>
          <input id="valor" name="valor" inputMode="decimal" className="input" placeholder="0,00" required />
        </div>
        <div>
          <label className="label" htmlFor="categoria">Categoria</label>
          <select id="categoria" name="categoria" className="input" defaultValue="">
            <option value="">Selecione…</option>
            {CATEGORIAS.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="data">Data</label>
          <input id="data" name="data" type="date" className="input" defaultValue={new Date().toISOString().slice(0, 10)} />
        </div>
        <div>
          <label className="label" htmlFor="status">Situação</label>
          <select id="status" name="status" className="input" defaultValue="pago">
            <option value="pago">Pago / recebido</option>
            <option value="pendente">Pendente</option>
          </select>
        </div>
        <div>
          <label className="label" htmlFor="descricao">Descrição</label>
          <input id="descricao" name="descricao" className="input" placeholder="Opcional" />
        </div>
      </div>

      {state?.error && <p className="rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger">{state.error}</p>}
      <SubmitButton className="btn-primary">Lançar</SubmitButton>
    </form>
  );
}
