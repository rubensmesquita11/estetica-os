"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/auth";

export type PlanoState = { error?: string } | undefined;

// ── Criar plano + gerar as sessões numeradas ────────────────────
export async function criarPlano(
  patientId: string,
  _prev: PlanoState,
  fd: FormData,
): Promise<PlanoState> {
  const profile = await getProfile();
  if (!profile?.organization_id) redirect("/login");

  const nome = String(fd.get("nome") ?? "").trim();
  const total = parseInt(String(fd.get("total_sessoes") ?? "1"), 10) || 1;
  const valor = parseFloat(String(fd.get("valor_total") ?? "0").replace(",", ".")) || 0;
  const procedureId = String(fd.get("procedure_id") ?? "").trim() || null;
  const validade = String(fd.get("validade") ?? "").trim() || null;
  if (!nome) return { error: "Dê um nome ao plano." };
  if (total < 1 || total > 100) return { error: "Número de sessões inválido." };

  const supabase = await createClient();
  const { data: plano, error } = await supabase
    .from("treatment_plans")
    .insert({
      organization_id: profile.organization_id,
      patient_id: patientId,
      nome,
      procedure_id: procedureId,
      total_sessoes: total,
      valor_total: valor,
      validade,
    })
    .select("id")
    .single();
  if (error || !plano) return { error: "Erro ao criar plano: " + error?.message };

  // Gera as sessões 1..N.
  const sessoes = Array.from({ length: total }, (_, i) => ({
    organization_id: profile.organization_id,
    plan_id: plano.id,
    numero: i + 1,
  }));
  await supabase.from("treatment_sessions").insert(sessoes);

  revalidatePath(`/app/pacientes/${patientId}/planos`);
  redirect(`/app/pacientes/${patientId}/planos`);
}

// ── Marcar/desmarcar sessão como realizada ──────────────────────
export async function alternarSessao(
  patientId: string,
  sessaoId: string,
  realizada: boolean,
) {
  const supabase = await createClient();
  await supabase
    .from("treatment_sessions")
    .update({
      realizada,
      data_realizada: realizada ? new Date().toISOString() : null,
    })
    .eq("id", sessaoId);

  // Se todas as sessões do plano estiverem feitas, conclui o plano.
  const { data: sessao } = await supabase
    .from("treatment_sessions")
    .select("plan_id")
    .eq("id", sessaoId)
    .single();
  if (sessao) {
    const { data: todas } = await supabase
      .from("treatment_sessions")
      .select("realizada")
      .eq("plan_id", sessao.plan_id);
    const concluido = (todas ?? []).every((s) => s.realizada);
    await supabase
      .from("treatment_plans")
      .update({ status: concluido ? "concluido" : "ativo" })
      .eq("id", sessao.plan_id);
  }

  revalidatePath(`/app/pacientes/${patientId}/planos`);
}

export async function cancelarPlano(patientId: string, planId: string) {
  const supabase = await createClient();
  await supabase.from("treatment_plans").update({ status: "cancelado" }).eq("id", planId);
  revalidatePath(`/app/pacientes/${patientId}/planos`);
}
