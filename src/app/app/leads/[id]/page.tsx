import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProposalForm } from "@/components/proposal-form";
import { TemperaturaSelect, PropostaStatusSelect } from "@/components/lead-controls";
import { LeadMoveSelect } from "@/components/lead-move-select";
import { converterEmPaciente } from "../actions";
import {
  PROPOSTA_STATUS_COLOR,
  PROPOSTA_STATUS_LABEL,
  type Lead,
  type Temperatura,
} from "@/lib/pipeline";

function brl(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default async function LeadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data } = await supabase.from("leads").select("*").eq("id", id).single();
  if (!data) notFound();
  const lead = data as Lead;

  const { data: propostas } = await supabase
    .from("proposals")
    .select("*, proposal_items(descricao, quantidade, valor_unitario)")
    .eq("lead_id", id)
    .order("created_at", { ascending: false });

  const converter = converterEmPaciente.bind(null, id);

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/app/leads" className="text-sm text-muted hover:underline">← Voltar para o funil</Link>

      {/* Cabeçalho */}
      <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{lead.nome}</h1>
          <p className="text-sm text-muted">
            {[lead.telefone, lead.origem].filter(Boolean).join(" · ") || "Sem contato"}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          {lead.patient_id ? (
            <Link href={`/app/pacientes/${lead.patient_id}`} className="btn-outline">Ver paciente ✓</Link>
          ) : (
            <form action={converter}>
              <button className="btn-primary">Converter em paciente</button>
            </form>
          )}
        </div>
      </div>

      {/* Controles */}
      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        <div className="card">
          <div className="text-sm text-muted">Valor potencial</div>
          <div className="mt-1 text-xl font-semibold">{brl(lead.valor_potencial)}</div>
        </div>
        <div className="card">
          <div className="mb-1 text-sm text-muted">Etapa do funil</div>
          <LeadMoveSelect id={lead.id} status={lead.status} />
        </div>
        <div className="card">
          <div className="mb-1 text-sm text-muted">Temperatura</div>
          <TemperaturaSelect id={lead.id} temperatura={lead.temperatura as Temperatura} />
        </div>
      </div>

      {/* Dados */}
      {(lead.procedimento_interesse || lead.email || lead.instagram || lead.observacoes) && (
        <div className="mt-4 card">
          <dl className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
            {lead.procedimento_interesse && <Campo label="Interesse" valor={lead.procedimento_interesse} />}
            {lead.email && <Campo label="E-mail" valor={lead.email} />}
            {lead.instagram && <Campo label="Instagram" valor={lead.instagram} />}
          </dl>
          {lead.observacoes && <p className="mt-3 rounded-lg bg-surface-2 p-3 text-sm">{lead.observacoes}</p>}
        </div>
      )}

      {/* Propostas existentes */}
      <div className="mt-6">
        <h2 className="mb-3 font-semibold">Propostas</h2>
        {!propostas || propostas.length === 0 ? (
          <p className="card py-6 text-center text-sm text-muted">Nenhuma proposta ainda.</p>
        ) : (
          <div className="space-y-3">
            {propostas.map((p) => {
              const itens = (p.proposal_items as { quantidade: number; valor_unitario: number }[]) ?? [];
              const subtotal = itens.reduce((s, i) => s + i.quantidade * i.valor_unitario, 0);
              const total = Math.max(0, subtotal - (p.desconto || 0));
              return (
                <div key={p.id} className="card">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-medium">{p.titulo}</span>
                    <div className="flex items-center gap-2">
                      <span className={`badge ${PROPOSTA_STATUS_COLOR[p.status]}`}>
                        {PROPOSTA_STATUS_LABEL[p.status]}
                      </span>
                      <PropostaStatusSelect leadId={id} propostaId={p.id} status={p.status} />
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-muted">
                    {itens.length} item(ns) · <span className="font-medium text-foreground">{brl(total)}</span>
                    {p.condicao_pagamento ? ` · ${p.condicao_pagamento}` : ""}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Nova proposta */}
      <div className="mt-6 card">
        <h2 className="mb-4 font-semibold">Nova proposta</h2>
        <ProposalForm leadId={id} />
      </div>
    </div>
  );
}

function Campo({ label, valor }: { label: string; valor: string }) {
  return (
    <div>
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="text-sm">{valor}</dd>
    </div>
  );
}
