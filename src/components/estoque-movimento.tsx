"use client";

import { useState, useTransition } from "react";
import { registrarMovimento } from "@/app/app/estoque/actions";

export function EstoqueMovimento({ itemId }: { itemId: string }) {
  const [qtd, setQtd] = useState("1");
  const [pending, start] = useTransition();

  const mover = (tipo: "entrada" | "saida") => {
    const q = parseFloat(qtd.replace(",", ".")) || 0;
    start(() => registrarMovimento(itemId, tipo, q));
  };

  return (
    <div className="flex items-center gap-1">
      <input
        value={qtd}
        onChange={(e) => setQtd(e.target.value)}
        inputMode="decimal"
        className="w-14 rounded-lg border border-border bg-surface px-2 py-1 text-center text-sm"
        aria-label="Quantidade"
      />
      <button onClick={() => mover("entrada")} disabled={pending}
        className="grid h-8 w-8 place-items-center rounded-lg bg-success-soft text-success hover:opacity-80 disabled:opacity-50" title="Entrada">+</button>
      <button onClick={() => mover("saida")} disabled={pending}
        className="grid h-8 w-8 place-items-center rounded-lg bg-danger-soft text-danger hover:opacity-80 disabled:opacity-50" title="Saída">−</button>
    </div>
  );
}
