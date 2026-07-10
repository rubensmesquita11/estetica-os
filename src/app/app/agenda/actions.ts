"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/auth";
import type { AppointmentStatus } from "@/lib/types";

export type AgendaState = { error?: string } | undefined;

// ── CRIAR AGENDAMENTO ───────────────────────────────────────────
export async function criarAgendamento(_prev: AgendaState, fd: FormData): Promise<AgendaState> {
  const profile = await getProfile();
  if (!profile?.organization_id) redirect("/login");

  const patient_id = String(fd.get("patient_id") ?? "") || null;
  const procedure_id = String(fd.get("procedure_id") ?? "") || null;
  const profissional_id = String(fd.get("profissional_id") ?? "") || null;
  const data = String(fd.get("data") ?? "");
  const hora = String(fd.get("hora") ?? "");
  const observacoes = String(fd.get("observacoes") ?? "").trim() || null;

  if (!patient_id) return { error: "Escolha o paciente." };
  if (!data || !hora) return { error: "Escolha data e horário." };

  const supabase = await createClient();

  // Duração e valor: usa o do formulário; se vazio, pega do procedimento.
  let duracao = parseInt(String(fd.get("duracao_min") ?? ""), 10);
  let valor: number | null = fd.get("valor") ? parseFloat(String(fd.get("valor")).replace(",", ".")) : null;

  if (procedure_id && (!duracao || valor === null)) {
    const { data: proc } = await supabase
      .from("procedures")
      .select("duracao_min, valor")
      .eq("id", procedure_id)
      .single();
    if (proc) {
      if (!duracao) duracao = proc.duracao_min ?? 60;
      if (valor === null) valor = proc.valor ?? null;
    }
  }
  if (!duracao) duracao = 60;

  const inicio = new Date(`${data}T${hora}:00`);
  const fim = new Date(inicio.getTime() + duracao * 60 * 1000);

  const { error } = await supabase.from("appointments").insert({
    organization_id: profile.organization_id,
    patient_id,
    procedure_id,
    profissional_id,
    inicio: inicio.toISOString(),
    fim: fim.toISOString(),
    valor,
    observacoes,
    status: "aguardando",
  });

  if (error) return { error: "Erro ao agendar: " + error.message };

  revalidatePath("/app/agenda");
  redirect(`/app/agenda?data=${data}`);
}

// ── MUDAR STATUS ────────────────────────────────────────────────
export async function mudarStatus(id: string, status: AppointmentStatus) {
  const supabase = await createClient();
  await supabase
    .from("appointments")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id);
  revalidatePath("/app/agenda");
  revalidatePath("/app/dashboard");
}

// ── EXCLUIR ─────────────────────────────────────────────────────
export async function excluirAgendamento(id: string) {
  const supabase = await createClient();
  await supabase.from("appointments").delete().eq("id", id);
  revalidatePath("/app/agenda");
}
