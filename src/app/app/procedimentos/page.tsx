import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Procedure } from "@/lib/types";

function brl(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default async function ProcedimentosPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("procedures")
    .select("*")
    .order("nome", { ascending: true });
  const procs = (data ?? []) as Procedure[];

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Procedimentos</h1>
          <p className="text-sm text-muted">O catálogo de serviços da sua clínica.</p>
        </div>
        <Link href="/app/procedimentos/novo" className="btn-primary">+ Novo procedimento</Link>
      </div>

      {procs.length === 0 ? (
        <div className="card mt-5 py-14 text-center">
          <div className="text-4xl">✨</div>
          <p className="mt-3 font-medium">Nenhum procedimento cadastrado.</p>
          <p className="mt-1 text-sm text-muted">Cadastre seus serviços para usá-los na agenda.</p>
          <Link href="/app/procedimentos/novo" className="btn-outline mt-5">Cadastrar primeiro</Link>
        </div>
      ) : (
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {procs.map((p) => (
            <Link key={p.id} href={`/app/procedimentos/${p.id}/editar`} className="card transition-colors hover:bg-surface-2">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-medium">{p.nome}</h3>
                  {p.categoria && <span className="badge mt-1 bg-surface-2 text-muted">{p.categoria}</span>}
                </div>
                <span className="font-semibold text-primary">{brl(p.valor)}</span>
              </div>
              <div className="mt-3 flex gap-4 text-xs text-muted">
                <span>⏱ {p.duracao_min} min</span>
                {p.retorno_dias && <span>🔁 retorno {p.retorno_dias} dias</span>}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
