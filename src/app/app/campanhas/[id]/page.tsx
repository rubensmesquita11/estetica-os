import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SEGMENTO_LABEL, type Segmento } from "@/lib/segments";
import { getAudiencia } from "@/lib/segments.server";
import { gerarTarefas, excluirCampanha } from "../actions";
import { ConfirmDelete } from "@/components/confirm-delete";

export default async function CampanhaDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: campanha } = await supabase.from("campaigns").select("*").eq("id", id).single();
  if (!campanha) notFound();

  const audiencia = await getAudiencia(campanha.segmento as Segmento);

  const gerar = gerarTarefas.bind(null, id, campanha.segmento as Segmento, campanha.nome);
  const apagar = excluirCampanha.bind(null, id);

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/app/campanhas" className="text-sm text-muted hover:underline">← Voltar para campanhas</Link>

      <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">{campanha.nome}</h1>
          <p className="text-sm text-muted">{SEGMENTO_LABEL[campanha.segmento as Segmento]}</p>
        </div>
        <span className="badge bg-primary-soft text-primary">{campanha.status}</span>
      </div>

      {/* Resumo + ação */}
      <div className="mt-6 card">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-sm text-muted">Público selecionado</div>
            <div className="text-2xl font-semibold">{audiencia.length} paciente(s)</div>
          </div>
          {audiencia.length > 0 && (
            <form action={gerar}>
              <button className="btn-primary">Gerar tarefas de contato</button>
            </form>
          )}
        </div>
        {campanha.mensagem && (
          <div className="mt-4 rounded-lg bg-surface-2 p-3 text-sm">
            <div className="mb-1 text-xs font-medium text-muted">Mensagem modelo</div>
            {campanha.mensagem}
          </div>
        )}
        <p className="mt-3 text-xs text-muted">
          Gerar tarefas cria uma tarefa de contato para cada paciente do público, na Central de Tarefas.
        </p>
      </div>

      {/* Público */}
      <div className="mt-6 card p-0">
        <div className="border-b border-border px-5 py-3 font-semibold">Público da campanha</div>
        {audiencia.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-muted">
            Nenhum paciente neste segmento no momento.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {audiencia.map((a) => (
              <li key={a.id} className="flex items-center gap-3 px-5 py-3">
                <Link href={`/app/pacientes/${a.id}`} className="min-w-0 flex-1">
                  <div className="truncate font-medium hover:underline">{a.nome}</div>
                  <div className="truncate text-xs text-muted">{a.motivo}</div>
                </Link>
                {a.telefone && <span className="hidden text-xs text-muted sm:inline">{a.telefone}</span>}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-6 flex justify-end">
        <ConfirmDelete action={apagar} label="Excluir campanha" pergunta="Excluir esta campanha?" />
      </div>
    </div>
  );
}
