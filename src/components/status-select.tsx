"use client";

import { useTransition } from "react";
import { mudarStatus } from "@/app/app/agenda/actions";
import { STATUS_COLOR, STATUS_LABEL, type AppointmentStatus } from "@/lib/types";

const OPCOES: AppointmentStatus[] = [
  "aguardando", "confirmado", "chegou", "em_atendimento", "finalizado", "faltou", "cancelado", "reagendado",
];

export function StatusSelect({ id, status }: { id: string; status: AppointmentStatus }) {
  const [pending, start] = useTransition();

  return (
    <select
      value={status}
      disabled={pending}
      onChange={(e) => {
        const novo = e.target.value as AppointmentStatus;
        start(() => mudarStatus(id, novo));
      }}
      className={`badge cursor-pointer border-0 outline-none ${STATUS_COLOR[status]} ${pending ? "opacity-50" : ""}`}
    >
      {OPCOES.map((s) => (
        <option key={s} value={s} className="bg-surface text-foreground">
          {STATUS_LABEL[s]}
        </option>
      ))}
    </select>
  );
}
