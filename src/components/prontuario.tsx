"use client";

import { useActionState, useEffect, useRef } from "react";
import { SubmitButton } from "@/components/submit-button";
import {
  salvarAnamnese,
  adicionarEvolucao,
  type ProntState,
} from "@/app/app/pacientes/[id]/prontuario/actions";
import type { MedicalRecord } from "@/lib/types";

export function AnamneseForm({
  patientId,
  record,
}: {
  patientId: string;
  record: MedicalRecord | null;
}) {
  const action = salvarAnamnese.bind(null, patientId);
  const [state, formAction] = useActionState<ProntState, FormData>(action, undefined);

  return (
    <form action={formAction} className="space-y-4">
      <Campo label="Queixa principal" name="queixa_principal" valor={record?.queixa_principal} />
      <Campo label="Histórico de saúde" name="historico_saude" valor={record?.historico_saude} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Campo label="Alergias" name="alergias" valor={record?.alergias} linhas={2} />
        <Campo label="Medicamentos em uso" name="medicamentos" valor={record?.medicamentos} linhas={2} />
      </div>
      <Campo label="Contraindicações" name="contraindicacoes" valor={record?.contraindicacoes} linhas={2} />
      <Campo label="Observações clínicas" name="observacoes_clinicas" valor={record?.observacoes_clinicas} />

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="gestante" defaultChecked={record?.gestante ?? false} className="h-4 w-4" />
        Gestante
      </label>

      {state?.error && <p className="rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger">{state.error}</p>}
      {state?.ok && <p className="rounded-lg bg-success-soft px-3 py-2 text-sm text-success">Prontuário salvo ✓</p>}

      <SubmitButton className="btn-primary">Salvar prontuário</SubmitButton>
    </form>
  );
}

function Campo({
  label,
  name,
  valor,
  linhas = 3,
}: {
  label: string;
  name: string;
  valor: string | null | undefined;
  linhas?: number;
}) {
  return (
    <div>
      <label className="label" htmlFor={name}>{label}</label>
      <textarea id={name} name={name} rows={linhas} className="input" defaultValue={valor ?? ""} />
    </div>
  );
}

export function EvolucaoForm({ patientId }: { patientId: string }) {
  const action = adicionarEvolucao.bind(null, patientId);
  const [state, formAction] = useActionState<ProntState, FormData>(action, undefined);
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok) ref.current?.reset();
  }, [state]);

  return (
    <form ref={ref} action={formAction} className="space-y-3">
      <textarea
        name="texto"
        rows={3}
        className="input"
        placeholder="Descreva a evolução do tratamento, observações da sessão…"
      />
      {state?.error && <p className="rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger">{state.error}</p>}
      <SubmitButton className="btn-primary">Adicionar anotação</SubmitButton>
    </form>
  );
}
