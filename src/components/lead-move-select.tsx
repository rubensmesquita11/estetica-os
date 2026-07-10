"use client";

import { useTransition } from "react";
import { moverLead } from "@/app/app/leads/actions";
import { PIPELINE, type LeadStatus } from "@/lib/pipeline";

// Select compacto para mover o lead de etapa direto no card do Kanban.
export function LeadMoveSelect({
  id,
  status,
}: {
  id: string;
  status: LeadStatus;
}) {
  const [pending, start] = useTransition();

  return (
    <select
      value={status}
      disabled={pending}
      onChange={(e) => {
        const novo = e.target.value as LeadStatus;
        start(() => moverLead(id, novo));
      }}
      onClick={(e) => e.stopPropagation()}
      className="w-full rounded-md border border-border bg-surface px-2 py-1 text-xs text-muted outline-none focus:border-primary"
    >
      {PIPELINE.map((e) => (
        <option key={e.key} value={e.key}>
          {e.label}
        </option>
      ))}
    </select>
  );
}
