"use client";

import { useTransition } from "react";
import { mudarCargo, alternarAtivo } from "@/app/app/configuracoes/actions";
import { CARGO_LABEL, type Cargo, type Profile } from "@/lib/types";

const CARGOS: Cargo[] = ["admin", "gestor", "recepcao", "comercial", "profissional", "financeiro"];

export function MembroRow({ membro, souEu }: { membro: Profile; souEu: boolean }) {
  const [pending, start] = useTransition();

  return (
    <li className={`flex flex-wrap items-center gap-3 px-5 py-3 ${!membro.ativo ? "opacity-50" : ""}`}>
      <span className="grid h-9 w-9 place-items-center rounded-full bg-primary-soft text-xs font-semibold text-primary">
        {(membro.nome ?? "?").slice(0, 2).toUpperCase()}
      </span>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium">
          {membro.nome} {souEu && <span className="text-xs text-muted">(você)</span>}
        </div>
        <div className="truncate text-xs text-muted">{membro.email}</div>
      </div>

      <select
        value={membro.cargo}
        disabled={souEu || pending}
        onChange={(e) => start(() => mudarCargo(membro.id, e.target.value as Cargo))}
        className="input w-auto py-1.5 text-sm disabled:opacity-60"
      >
        {CARGOS.map((c) => <option key={c} value={c}>{CARGO_LABEL[c]}</option>)}
      </select>

      {!souEu && (
        <button
          onClick={() => start(() => alternarAtivo(membro.id, !membro.ativo))}
          disabled={pending}
          className="btn-ghost text-sm text-muted"
        >
          {membro.ativo ? "Desativar" : "Reativar"}
        </button>
      )}
    </li>
  );
}
