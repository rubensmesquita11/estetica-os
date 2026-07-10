"use client";

import { useTransition } from "react";
import { mudarTemperatura, mudarStatusProposta } from "@/app/app/leads/actions";
import { PROPOSTA_STATUS_LABEL, TEMPERATURA, type Temperatura } from "@/lib/pipeline";

export function TemperaturaSelect({ id, temperatura }: { id: string; temperatura: Temperatura }) {
  const [pending, start] = useTransition();
  return (
    <select
      value={temperatura}
      disabled={pending}
      onChange={(e) => start(() => mudarTemperatura(id, e.target.value as Temperatura))}
      className="input w-auto py-1.5 text-sm"
    >
      {(Object.keys(TEMPERATURA) as Temperatura[]).map((t) => (
        <option key={t} value={t}>{TEMPERATURA[t].icon} {TEMPERATURA[t].label}</option>
      ))}
    </select>
  );
}

export function PropostaStatusSelect({
  leadId,
  propostaId,
  status,
}: {
  leadId: string;
  propostaId: string;
  status: string;
}) {
  const [pending, start] = useTransition();
  return (
    <select
      value={status}
      disabled={pending}
      onChange={(e) => start(() => mudarStatusProposta(leadId, propostaId, e.target.value))}
      className="rounded-md border border-border bg-surface px-2 py-1 text-xs outline-none focus:border-primary"
    >
      {Object.entries(PROPOSTA_STATUS_LABEL).map(([k, label]) => (
        <option key={k} value={k}>{label}</option>
      ))}
    </select>
  );
}
