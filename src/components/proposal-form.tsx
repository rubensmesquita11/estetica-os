"use client";

import { useActionState, useMemo, useState } from "react";
import { SubmitButton } from "@/components/submit-button";
import { criarProposta, type PropostaState } from "@/app/app/leads/actions";

interface Item {
  descricao: string;
  quantidade: number;
  valor_unitario: number;
}

function brl(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function ProposalForm({ leadId }: { leadId: string }) {
  const action = criarProposta.bind(null, leadId);
  const [state, formAction] = useActionState<PropostaState, FormData>(action, undefined);

  const [itens, setItens] = useState<Item[]>([{ descricao: "", quantidade: 1, valor_unitario: 0 }]);
  const [desconto, setDesconto] = useState(0);

  const subtotal = useMemo(
    () => itens.reduce((s, i) => s + (i.quantidade || 0) * (i.valor_unitario || 0), 0),
    [itens],
  );
  const total = Math.max(0, subtotal - (desconto || 0));

  const setItem = (idx: number, patch: Partial<Item>) =>
    setItens((arr) => arr.map((it, i) => (i === idx ? { ...it, ...patch } : it)));

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="itens" value={JSON.stringify(itens.filter((i) => i.descricao.trim()))} />

      <div>
        <label className="label" htmlFor="titulo">Título da proposta *</label>
        <input id="titulo" name="titulo" className="input" placeholder="Ex: Protocolo facial 5 sessões" required />
      </div>

      {/* Itens */}
      <div>
        <span className="label">Itens</span>
        <div className="space-y-2">
          {itens.map((item, idx) => (
            <div key={idx} className="flex gap-2">
              <input
                className="input flex-1"
                placeholder="Descrição"
                value={item.descricao}
                onChange={(e) => setItem(idx, { descricao: e.target.value })}
              />
              <input
                className="input w-16"
                type="number"
                min={1}
                title="Quantidade"
                value={item.quantidade}
                onChange={(e) => setItem(idx, { quantidade: parseInt(e.target.value) || 1 })}
              />
              <input
                className="input w-28"
                inputMode="decimal"
                placeholder="Valor"
                value={item.valor_unitario || ""}
                onChange={(e) => setItem(idx, { valor_unitario: parseFloat(e.target.value.replace(",", ".")) || 0 })}
              />
              {itens.length > 1 && (
                <button
                  type="button"
                  onClick={() => setItens((arr) => arr.filter((_, i) => i !== idx))}
                  className="btn-ghost px-2 text-danger"
                  title="Remover"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setItens((arr) => [...arr, { descricao: "", quantidade: 1, valor_unitario: 0 }])}
          className="btn-ghost mt-2 text-sm text-primary"
        >
          + Adicionar item
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="label" htmlFor="desconto">Desconto (R$)</label>
          <input
            id="desconto"
            name="desconto"
            inputMode="decimal"
            className="input"
            value={desconto || ""}
            onChange={(e) => setDesconto(parseFloat(e.target.value.replace(",", ".")) || 0)}
          />
        </div>
        <div>
          <label className="label" htmlFor="condicao_pagamento">Pagamento</label>
          <input id="condicao_pagamento" name="condicao_pagamento" className="input" placeholder="3x sem juros" />
        </div>
        <div>
          <label className="label" htmlFor="validade">Validade</label>
          <input id="validade" name="validade" type="date" className="input" />
        </div>
      </div>

      {/* Total */}
      <div className="flex items-center justify-between rounded-lg bg-surface-2 px-4 py-3">
        <span className="text-sm text-muted">Total da proposta</span>
        <span className="text-lg font-semibold">{brl(total)}</span>
      </div>

      {state?.error && <p className="rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger">{state.error}</p>}

      <SubmitButton className="btn-primary" pendingText="Criando proposta…">Criar proposta</SubmitButton>
    </form>
  );
}
