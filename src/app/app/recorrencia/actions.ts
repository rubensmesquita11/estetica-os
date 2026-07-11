"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/auth";

// Cria uma tarefa de "contatar para retorno" a partir da lista de recorrência.
export async function criarTarefaRetorno(patientId: string, nome: string) {
  const profile = await getProfile();
  if (!profile?.organization_id) redirect("/login");

  const supabase = await createClient();
  await supabase.from("tasks").insert({
    organization_id: profile.organization_id,
    titulo: `Contatar ${nome} para retorno`,
    patient_id: patientId,
    prioridade: "alta",
    origem: "recorrencia",
    created_by: profile.id,
  });

  revalidatePath("/app/recorrencia");
  revalidatePath("/app/tarefas");
}
