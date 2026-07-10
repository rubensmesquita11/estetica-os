import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PlanoForm } from "@/components/plano-form";
import { alternarSessao } from "./actions";
import type { Procedure, TreatmentSession } from "@/lib/types";

function brl(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

const STATUS_PLANO: Record<string, string> = {
  ativo: "bg-info-soft text-info",
  concluido: "bg-success-soft text-success",
  cancelado: "bg-surface-2 text-muted",
};

export default async function PlanosPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: paciente } = await supabase.from("patients").select("id, nome").eq("id", id).single();
  if (!paciente) notFound();

  const [{ data: planos }, { data: procs }] = await Promise.all([
    supabase
      .from("treatment_plans")
      .select("*, treatment_sessions(id, numero, realizada, data_realizada)")
      .eq("patient_id", id)
      .order("created_at", { ascending: false }),
    supabase.from("procedures").select("id, nome").eq("ativo", true).order("nome"),
  ]);

  return (
    <div className="mx-auto max-w-3xl">
      <Link href={`/app/pacientes/${id}`} className="text-sm text-muted hover:underline">
        ← Voltar para {paciente.nome}
      </Link>
      <h1 className="mt-2 text-2xl font-semibold">Planos de tratamento</h1>
      <p className="text-sm text-muted">{paciente.nome}</p>

      {/* Planos existentes */}
      <div className="mt-6 space-y-4">
        {(!planos || planos.length === 0) && (
          <div className="card py-10 text-center">
            <div className="text-3xl">📦</div>
            <p className="mt-2 text-sm text-muted">Nenhum plano criado ainda.</p>
          </div>
        )}

        {(planos ?? []).map((plano) => {
          const sessoes = ((plano.treatment_sessions as TreatmentSession[]) ?? []).sort(
            (a, b) => a.numero - b.numero,
          );
          const feitas = sessoes.filter((s) => s.realizada).length;
          const pct = sessoes.length ? Math.round((feitas / sessoes.length) * 100) : 0;

          return (
            <div key={plano.id} className="card">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold">{plano.nome}</h3>
                  <p className="text-sm text-muted">{brl(plano.valor_total)}</p>
                </div>
                <span className={`badge ${STATUS_PLANO[plano.status]}`}>{plano.status}</span>
              </div>

              {/* Progresso */}
              <div className="mt-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{feitas} de {sessoes.length} sessões</span>
                  <span className="text-muted">{pct}%</span>
                </div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-surface-2">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                </div>
              </div>

              {/* Sessões */}
              <div className="mt-4 flex flex-wrap gap-2">
                {sessoes.map((s) => {
                  const toggle = alternarSessao.bind(null, id, s.id, !s.realizada);
                  return (
                    <form action={toggle} key={s.id}>
                      <button
                        title={s.realizada ? "Marcar como não realizada" : "Marcar como realizada"}
                        className={`grid h-10 w-10 place-items-center rounded-lg border text-sm font-medium transition-colors ${
                          s.realizada
                            ? "border-primary bg-primary text-primary-fg"
                            : "border-border bg-surface text-muted hover:bg-surface-2"
                        }`}
                      >
                        {s.realizada ? "✓" : s.numero}
                      </button>
                    </form>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Novo plano */}
      <div className="mt-6 card">
        <h2 className="mb-4 font-semibold">Novo plano de tratamento</h2>
        <PlanoForm patientId={id} procedimentos={(procs as Pick<Procedure, "id" | "nome">[]) ?? []} />
      </div>
    </div>
  );
}
