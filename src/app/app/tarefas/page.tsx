import { createClient } from "@/lib/supabase/server";
import { TarefaForm } from "@/components/tarefa-form";
import { alternarTarefa, excluirTarefa } from "./actions";
import { PRIORIDADE_COLOR, type TaskPrioridade } from "@/lib/types";

function dataBR(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

export default async function TarefasPage() {
  const supabase = await createClient();

  const [{ data: tarefas }, { data: profiles }, { data: pacientes }] = await Promise.all([
    supabase
      .from("tasks")
      .select("*, responsavel:responsavel_id(nome), paciente:patient_id(nome)")
      .order("status", { ascending: true })
      .order("prazo", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: false }),
    supabase.from("profiles").select("id, nome").eq("ativo", true).order("nome"),
    supabase.from("patients").select("id, nome").order("nome"),
  ]);

  const abertas = (tarefas ?? []).filter((t) => t.status === "aberta");
  const concluidas = (tarefas ?? []).filter((t) => t.status === "concluida");

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-semibold">Central de tarefas</h1>
      <p className="text-sm text-muted">{abertas.length} aberta(s) · {concluidas.length} concluída(s)</p>

      {/* Nova tarefa */}
      <div className="mt-6 card">
        <h2 className="mb-4 font-semibold">Nova tarefa</h2>
        <TarefaForm
          responsaveis={profiles ?? []}
          pacientes={pacientes ?? []}
        />
      </div>

      {/* Abertas */}
      <h2 className="mt-8 mb-3 font-semibold">A fazer</h2>
      {abertas.length === 0 ? (
        <div className="card py-8 text-center text-sm text-muted">Nenhuma tarefa aberta. 🎉</div>
      ) : (
        <ul className="space-y-2">
          {abertas.map((t) => {
            const concluir = alternarTarefa.bind(null, t.id, true);
            const resp = (t.responsavel as { nome?: string } | null)?.nome;
            const pac = (t.paciente as { nome?: string } | null)?.nome;
            return (
              <li key={t.id} className="card flex items-start gap-3 py-3">
                <form action={concluir}>
                  <button
                    title="Concluir"
                    className="mt-0.5 grid h-6 w-6 place-items-center rounded-full border border-border text-muted hover:border-primary hover:text-primary"
                  >
                    ○
                  </button>
                </form>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">{t.titulo}</span>
                    <span className={`badge ${PRIORIDADE_COLOR[t.prioridade as TaskPrioridade]}`}>
                      {t.prioridade}
                    </span>
                  </div>
                  {t.descricao && <p className="mt-0.5 text-sm text-muted">{t.descricao}</p>}
                  <div className="mt-1 flex flex-wrap gap-3 text-xs text-muted">
                    {resp && <span>👤 {resp}</span>}
                    {pac && <span>🧑‍🤝‍🧑 {pac}</span>}
                    {t.prazo && <span>📅 {dataBR(t.prazo)}</span>}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {/* Concluídas */}
      {concluidas.length > 0 && (
        <>
          <h2 className="mt-8 mb-3 font-semibold text-muted">Concluídas</h2>
          <ul className="space-y-2">
            {concluidas.map((t) => {
              const reabrir = alternarTarefa.bind(null, t.id, false);
              const apagar = excluirTarefa.bind(null, t.id);
              return (
                <li key={t.id} className="flex items-center gap-3 rounded-xl border border-border bg-surface-2 px-4 py-2.5">
                  <form action={reabrir}>
                    <button title="Reabrir" className="grid h-6 w-6 place-items-center rounded-full bg-success text-white">
                      ✓
                    </button>
                  </form>
                  <span className="flex-1 text-sm text-muted line-through">{t.titulo}</span>
                  <form action={apagar}>
                    <button title="Excluir" className="text-muted hover:text-danger">✕</button>
                  </form>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}
