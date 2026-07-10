"use client";

import Link from "next/link";
import { useActionState } from "react";
import { SubmitButton } from "@/components/submit-button";
import type { ProcState } from "@/app/app/procedimentos/actions";
import type { Procedure } from "@/lib/types";

export function ProcedimentoForm({
  action,
  procedimento,
}: {
  action: (prev: ProcState, fd: FormData) => Promise<ProcState>;
  procedimento?: Procedure;
}) {
  const [state, formAction] = useActionState<ProcState, FormData>(action, undefined);

  return (
    <form action={formAction} className="space-y-5">
      <div>
        <label className="label" htmlFor="nome">Nome do procedimento *</label>
        <input id="nome" name="nome" className="input" defaultValue={procedimento?.nome ?? ""} placeholder="Ex: Limpeza de pele profunda" required />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="categoria">Categoria</label>
          <input id="categoria" name="categoria" className="input" defaultValue={procedimento?.categoria ?? ""} placeholder="Facial, Corporal…" />
        </div>
        <div>
          <label className="label" htmlFor="valor">Valor (R$)</label>
          <input id="valor" name="valor" type="text" inputMode="decimal" className="input" defaultValue={procedimento?.valor ?? ""} placeholder="250,00" />
        </div>
        <div>
          <label className="label" htmlFor="duracao_min">Duração (minutos)</label>
          <input id="duracao_min" name="duracao_min" type="number" className="input" defaultValue={procedimento?.duracao_min ?? 60} />
        </div>
        <div>
          <label className="label" htmlFor="retorno_dias">Retorno recomendado (dias)</label>
          <input id="retorno_dias" name="retorno_dias" type="number" className="input" defaultValue={procedimento?.retorno_dias ?? ""} placeholder="Ex: 30" />
        </div>
      </div>

      {state?.error && (
        <p className="rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger">{state.error}</p>
      )}

      <div className="flex items-center gap-3">
        <SubmitButton className="btn-primary">
          {procedimento ? "Salvar" : "Cadastrar procedimento"}
        </SubmitButton>
        <Link href="/app/procedimentos" className="btn-ghost">Cancelar</Link>
      </div>
    </form>
  );
}
