"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/auth";
import type { LeadStatus, Temperatura } from "@/lib/pipeline";

export type LeadState = { error?: string } | undefined;

// ── CRIAR LEAD ──────────────────────────────────────────────────
export async function criarLead(_prev: LeadState, fd: FormData): Promise<LeadState> {
  const profile = await getProfile();
  if (!profile?.organization_id) redirect("/login");

  const nome = String(fd.get("nome") ?? "").trim();
  if (!nome) return { error: "Informe o nome do lead." };

  const val = (k: string) => String(fd.get(k) ?? "").trim() || null;
  const valorPot = parseFloat(String(fd.get("valor_potencial") ?? "0").replace(",", ".")) || 0;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("leads")
    .insert({
      organization_id: profile.organization_id,
      nome,
      telefone: val("telefone"),
      email: val("email"),
      instagram: val("instagram"),
      procedimento_interesse: val("procedimento_interesse"),
      origem: val("origem"),
      valor_potencial: valorPot,
      temperatura: (val("temperatura") as Temperatura) ?? "morno",
      responsavel_id: val("responsavel_id"),
      observacoes: val("observacoes"),
      ultimo_contato: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (error) return { error: "Erro ao criar lead: " + error.message };
  revalidatePath("/app/leads");
  redirect(`/app/leads/${data.id}`);
}

// ── MOVER NO FUNIL ──────────────────────────────────────────────
export async function moverLead(id: string, status: LeadStatus) {
  const supabase = await createClient();
  await supabase
    .from("leads")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id);
  revalidatePath("/app/leads");
  revalidatePath(`/app/leads/${id}`);
}

// ── MUDAR TEMPERATURA ───────────────────────────────────────────
export async function mudarTemperatura(id: string, temperatura: Temperatura) {
  const supabase = await createClient();
  await supabase.from("leads").update({ temperatura }).eq("id", id);
  revalidatePath(`/app/leads/${id}`);
  revalidatePath("/app/leads");
}

// ── CONVERTER LEAD EM PACIENTE ──────────────────────────────────
export async function converterEmPaciente(id: string) {
  const profile = await getProfile();
  if (!profile?.organization_id) redirect("/login");

  const supabase = await createClient();
  const { data: lead } = await supabase.from("leads").select("*").eq("id", id).single();
  if (!lead) redirect("/app/leads");

  // Já convertido? vai direto ao paciente.
  if (lead.patient_id) redirect(`/app/pacientes/${lead.patient_id}`);

  const { data: paciente, error } = await supabase
    .from("patients")
    .insert({
      organization_id: profile.organization_id,
      nome: lead.nome,
      telefone: lead.telefone,
      email: lead.email,
      instagram: lead.instagram,
      origem: lead.origem,
      observacoes: lead.observacoes,
    })
    .select("id")
    .single();
  if (error || !paciente) redirect(`/app/leads/${id}`);

  await supabase
    .from("leads")
    .update({ patient_id: paciente.id, status: "fechado" })
    .eq("id", id);

  revalidatePath("/app/leads");
  redirect(`/app/pacientes/${paciente.id}`);
}

// ── PROPOSTAS ───────────────────────────────────────────────────
export type PropostaState = { error?: string } | undefined;

interface ItemInput {
  descricao: string;
  quantidade: number;
  valor_unitario: number;
  procedure_id?: string | null;
}

export async function criarProposta(
  leadId: string,
  _prev: PropostaState,
  fd: FormData,
): Promise<PropostaState> {
  const profile = await getProfile();
  if (!profile?.organization_id) redirect("/login");

  const titulo = String(fd.get("titulo") ?? "").trim();
  if (!titulo) return { error: "Dê um título à proposta." };

  let itens: ItemInput[] = [];
  try {
    itens = JSON.parse(String(fd.get("itens") ?? "[]"));
  } catch {
    itens = [];
  }
  itens = itens.filter((i) => i.descricao?.trim());
  if (itens.length === 0) return { error: "Adicione ao menos um item." };

  const desconto = parseFloat(String(fd.get("desconto") ?? "0").replace(",", ".")) || 0;
  const supabase = await createClient();

  // Descobre o patient_id do lead (se já convertido).
  const { data: lead } = await supabase.from("leads").select("patient_id").eq("id", leadId).single();

  const { data: prop, error } = await supabase
    .from("proposals")
    .insert({
      organization_id: profile.organization_id,
      lead_id: leadId,
      patient_id: lead?.patient_id ?? null,
      titulo,
      desconto,
      condicao_pagamento: String(fd.get("condicao_pagamento") ?? "").trim() || null,
      validade: String(fd.get("validade") ?? "").trim() || null,
      status: "rascunho",
      created_by: profile.id,
    })
    .select("id")
    .single();
  if (error || !prop) return { error: "Erro ao criar proposta: " + error?.message };

  const linhas = itens.map((i) => ({
    organization_id: profile.organization_id,
    proposal_id: prop.id,
    procedure_id: i.procedure_id || null,
    descricao: i.descricao.trim(),
    quantidade: i.quantidade || 1,
    valor_unitario: i.valor_unitario || 0,
  }));
  await supabase.from("proposal_items").insert(linhas);

  revalidatePath(`/app/leads/${leadId}`);
  return undefined;
}

export async function mudarStatusProposta(leadId: string, propostaId: string, status: string) {
  const supabase = await createClient();
  await supabase.from("proposals").update({ status }).eq("id", propostaId);
  revalidatePath(`/app/leads/${leadId}`);
}
