"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/auth";

export type TarefaState = { error?: string; ok?: boolean } | undefined;

export async function criarTarefa(
  _prev: TarefaState,
  fd: FormData,
): Promise<TarefaState> {
  const profile = await getProfile();
  if (!profile?.organization_id) redirect("/login");

  const titulo = String(fd.get("titulo") ?? "").trim();
  if (!titulo) return { error: "Escreva o título da tarefa." };

  const supabase = await createClient();
  const { error } = await supabase.from("tasks").insert({
    organization_id: profile.organization_id,
    titulo,
    descricao: String(fd.get("descricao") ?? "").trim() || null,
    responsavel_id: String(fd.get("responsavel_id") ?? "").trim() || null,
    patient_id: String(fd.get("patient_id") ?? "").trim() || null,
    prioridade: String(fd.get("prioridade") ?? "media"),
    prazo: String(fd.get("prazo") ?? "").trim() || null,
    created_by: profile.id,
  });
  if (error) return { error: "Erro ao criar tarefa: " + error.message };

  revalidatePath("/app/tarefas");
  return { ok: true };
}

export async function alternarTarefa(id: string, concluir: boolean) {
  const supabase = await createClient();
  await supabase
    .from("tasks")
    .update({ status: concluir ? "concluida" : "aberta" })
    .eq("id", id);
  revalidatePath("/app/tarefas");
}

export async function excluirTarefa(id: string) {
  const supabase = await createClient();
  await supabase.from("tasks").delete().eq("id", id);
  revalidatePath("/app/tarefas");
}
