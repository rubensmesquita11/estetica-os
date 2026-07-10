"use client";

import { useState } from "react";

// Botão de exclusão com confirmação em 2 passos (evita apagar sem querer).
export function ConfirmDelete({
  action,
  label = "Excluir",
  confirmLabel = "Confirmar exclusão",
  pergunta = "Tem certeza? Esta ação não pode ser desfeita.",
}: {
  action: () => Promise<void>;
  label?: string;
  confirmLabel?: string;
  pergunta?: string;
}) {
  const [confirmando, setConfirmando] = useState(false);

  if (!confirmando) {
    return (
      <button
        type="button"
        onClick={() => setConfirmando(true)}
        className="btn-ghost text-danger hover:bg-danger-soft"
      >
        {label}
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted">{pergunta}</span>
      <form action={action}>
        <button className="btn bg-danger text-white hover:opacity-90">{confirmLabel}</button>
      </form>
      <button type="button" onClick={() => setConfirmando(false)} className="btn-ghost">
        Cancelar
      </button>
    </div>
  );
}
