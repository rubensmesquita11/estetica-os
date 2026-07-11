"use client";

import { useActionState, useEffect, useRef } from "react";
import { SubmitButton } from "@/components/submit-button";
import { criarItem, type EstoqueState } from "@/app/app/estoque/actions";

export function ItemForm() {
  const [state, formAction] = useActionState<EstoqueState, FormData>(criarItem, undefined);
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => { if (state?.ok) ref.current?.reset(); }, [state]);

  return (
    <form ref={ref} action={formAction} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="label" htmlFor="nome">Nome do item *</label>
          <input id="nome" name="nome" className="input" placeholder="Ex: Ácido hialurônico 1ml" required />
        </div>
        <div>
          <label className="label" htmlFor="categoria">Categoria</label>
          <input id="categoria" name="categoria" className="input" placeholder="Injetável, descartável…" />
        </div>
        <div>
          <label className="label" htmlFor="unidade">Unidade</label>
          <input id="unidade" name="unidade" className="input" placeholder="un, ml, cx" defaultValue="un" />
        </div>
        <div>
          <label className="label" htmlFor="quantidade">Quantidade atual</label>
          <input id="quantidade" name="quantidade" inputMode="decimal" className="input" defaultValue="0" />
        </div>
        <div>
          <label className="label" htmlFor="estoque_minimo">Estoque mínimo</label>
          <input id="estoque_minimo" name="estoque_minimo" inputMode="decimal" className="input" defaultValue="0" />
        </div>
        <div>
          <label className="label" htmlFor="custo">Custo unitário (R$)</label>
          <input id="custo" name="custo" inputMode="decimal" className="input" placeholder="0,00" />
        </div>
        <div>
          <label className="label" htmlFor="validade">Validade</label>
          <input id="validade" name="validade" type="date" className="input" />
        </div>
        <div>
          <label className="label" htmlFor="fornecedor">Fornecedor</label>
          <input id="fornecedor" name="fornecedor" className="input" />
        </div>
        <div>
          <label className="label" htmlFor="lote">Lote</label>
          <input id="lote" name="lote" className="input" />
        </div>
      </div>

      {state?.error && <p className="rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger">{state.error}</p>}
      <SubmitButton className="btn-primary">Cadastrar item</SubmitButton>
    </form>
  );
}
