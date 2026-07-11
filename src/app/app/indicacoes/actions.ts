"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/auth";

export type IndicacaoState = { error?: string; ok?: boolean } | undefined;

export async function registrarIndicacao(
  _prev: IndicacaoState,
  fd: FormData,
): Promise<IndicacaoState> {
  const profile = await getProfile();
  if (!profile?.organization_id) redirect("/login");

  const indicadorId = String(fd.get("indicador_id") ?? "").trim();
  const indicadoNome = String(fd.get("indicado_nome") ?? "").trim();
  if (!indicadorId) return { error: "Escolha quem indicou." };
  if (!indicadoNome) return { error: "Informe o nome de quem foi indicado." };

  const supabase = await createClient();
  const { error } = await supabase.from("referrals").insert({
    organization_id: profile.organization_id,
    indicador_id: indicadorId,
    indicado_nome: indicadoNome,
  });
  if (error) return { error: "Erro ao registrar: " + error.message };

  revalidatePath("/app/indicacoes");
  return { ok: true };
}

// Converte a indicação: cria o paciente indicado e marca como convertido.
export async function converterIndicacao(id: string) {
  const profile = await getProfile();
  if (!profile?.organization_id) redirect("/login");
  const supabase = await createClient();

  const { data: ref } = await supabase.from("referrals").select("*").eq("id", id).single();
  if (!ref) return;

  let indicadoId = ref.indicado_id;
  if (!indicadoId && ref.indicado_nome) {
    const { data: novo } = await supabase
      .from("patients")
      .insert({
        organization_id: profile.organization_id,
        nome: ref.indicado_nome,
        origem: "Indicação",
        indicado_por: ref.indicador_id,
      })
      .select("id")
      .single();
    indicadoId = novo?.id ?? null;
  }

  await supabase
    .from("referrals")
    .update({ status: "convertido", indicado_id: indicadoId })
    .eq("id", id);

  revalidatePath("/app/indicacoes");
  revalidatePath("/app/pacientes");
}

export async function excluirIndicacao(id: string) {
  const supabase = await createClient();
  await supabase.from("referrals").delete().eq("id", id);
  revalidatePath("/app/indicacoes");
}
