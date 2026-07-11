"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/auth";
import { type Segmento } from "@/lib/segments";
import { getAudiencia } from "@/lib/segments.server";

export type CampanhaState = { error?: string } | undefined;

export async function criarCampanha(
  _prev: CampanhaState,
  fd: FormData,
): Promise<CampanhaState> {
  const profile = await getProfile();
  if (!profile?.organization_id) redirect("/login");

  const nome = String(fd.get("nome") ?? "").trim();
  const segmento = String(fd.get("segmento") ?? "inativos") as Segmento;
  const mensagem = String(fd.get("mensagem") ?? "").trim() || null;
  if (!nome) return { error: "Dê um nome à campanha." };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("campaigns")
    .insert({ organization_id: profile.organization_id, nome, segmento, mensagem, created_by: profile.id })
    .select("id")
    .single();
  if (error || !data) return { error: "Erro ao criar: " + error?.message };

  revalidatePath("/app/campanhas");
  redirect(`/app/campanhas/${data.id}`);
}

// Gera uma tarefa de contato para cada paciente do público da campanha.
export async function gerarTarefas(campaignId: string, segmento: Segmento, nomeCampanha: string) {
  const profile = await getProfile();
  if (!profile?.organization_id) redirect("/login");

  const alvos = await getAudiencia(segmento);
  if (alvos.length === 0) return;

  const supabase = await createClient();
  const tarefas = alvos.map((a) => ({
    organization_id: profile.organization_id,
    titulo: `Contatar ${a.nome} — campanha "${nomeCampanha}"`,
    patient_id: a.id,
    prioridade: "media",
    origem: "campanha",
    created_by: profile.id,
  }));
  await supabase.from("tasks").insert(tarefas);
  await supabase.from("campaigns").update({ status: "ativa" }).eq("id", campaignId);

  revalidatePath("/app/campanhas");
  revalidatePath(`/app/campanhas/${campaignId}`);
  revalidatePath("/app/tarefas");
}

export async function excluirCampanha(id: string) {
  const supabase = await createClient();
  await supabase.from("campaigns").delete().eq("id", id);
  revalidatePath("/app/campanhas");
  redirect("/app/campanhas");
}
