import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { LeadMoveSelect } from "@/components/lead-move-select";
import { PIPELINE, TEMPERATURA, type Lead, type LeadStatus, type Temperatura } from "@/lib/pipeline";

function brl(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default async function LeadsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });
  const leads = (data ?? []) as Lead[];

  const abertos = leads.filter((l) => !["fechado", "perdido"].includes(l.status));
  const totalPipeline = abertos.reduce((s, l) => s + (l.valor_potencial || 0), 0);
  const fechados = leads.filter((l) => l.status === "fechado");
  const receitaFechada = fechados.reduce((s, l) => s + (l.valor_potencial || 0), 0);

  const porEtapa = (status: LeadStatus) => leads.filter((l) => l.status === status);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Funil de vendas</h1>
          <p className="text-sm text-muted">
            {abertos.length} em aberto · {brl(totalPipeline)} em potencial · {brl(receitaFechada)} fechado
          </p>
        </div>
        <Link href="/app/leads/novo" className="btn-primary">+ Novo lead</Link>
      </div>

      {leads.length === 0 ? (
        <div className="card mt-6 py-14 text-center">
          <div className="text-4xl">🎯</div>
          <p className="mt-3 font-medium">Seu funil está vazio.</p>
          <p className="mt-1 text-sm text-muted">Cadastre o primeiro lead e comece a acompanhar as vendas.</p>
          <Link href="/app/leads/novo" className="btn-outline mt-5">Cadastrar primeiro lead</Link>
        </div>
      ) : (
        <div className="mt-6 flex gap-4 overflow-x-auto pb-4">
          {PIPELINE.map((etapa) => {
            const doStatus = porEtapa(etapa.key);
            const total = doStatus.reduce((s, l) => s + (l.valor_potencial || 0), 0);
            return (
              <div key={etapa.key} className="w-72 shrink-0">
                <div className="mb-2 flex items-center justify-between px-1">
                  <span className="text-sm font-medium">{etapa.label}</span>
                  <span className="text-xs text-muted">{doStatus.length}</span>
                </div>
                {total > 0 && <div className="mb-2 px-1 text-xs text-muted">{brl(total)}</div>}

                <div className="space-y-2">
                  {doStatus.map((lead) => {
                    const temp = TEMPERATURA[lead.temperatura as Temperatura];
                    return (
                      <div key={lead.id} className="card p-3">
                        <Link href={`/app/leads/${lead.id}`} className="block">
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-medium leading-tight">{lead.nome}</span>
                            <span className={`badge shrink-0 ${temp.classe}`}>{temp.icon}</span>
                          </div>
                          {lead.procedimento_interesse && (
                            <p className="mt-1 text-xs text-muted">{lead.procedimento_interesse}</p>
                          )}
                          <div className="mt-2 flex items-center justify-between text-xs">
                            <span className="font-medium text-primary">{brl(lead.valor_potencial)}</span>
                            {lead.origem && <span className="text-muted">{lead.origem}</span>}
                          </div>
                        </Link>
                        <div className="mt-2">
                          <LeadMoveSelect id={lead.id} status={lead.status} />
                        </div>
                      </div>
                    );
                  })}
                  {doStatus.length === 0 && (
                    <div className="rounded-lg border border-dashed border-border py-6 text-center text-xs text-muted">
                      vazio
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
