"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/auth";

export type MetaState = { error?: string; ok?: boolean } | undefined;

// Define a meta do MÊS ATUAL (substitui a existente do mesmo escopo).
export async function salvarMeta(_prev: MetaState, fd: FormData): Promise<MetaState> {
  const profile = await getProfile();
  if (!profile?.organization_id) redirect("/login");

  const escopo = String(fd.get("escopo") ?? "clinica");
  const profissionalId = escopo === "profissional" ? String(fd.get("profissional_id") ?? "").trim() || null : null;
  const valor = parseFloat(String(fd.get("valor_meta") ?? "0").replace(".", "").replace(",", ".")) || 0;
  if (escopo === "profissional" && !profissionalId) return { error: "Escolha o profissional." };
  if (valor <= 0) return { error: "Informe o valor da meta." };

  const agora = new Date();
  const ano = agora.getFullYear();
  const mes = agora.getMonth() + 1;
  const supabase = await createClient();

  let del = supabase.from("goals").delete().eq("escopo", escopo).eq("ano", ano).eq("mes", mes);
  del = profissionalId ? del.eq("profissional_id", profissionalId) : del.is("profissional_id", null);
  await del;

  const { error } = await supabase.from("goals").insert({
    organization_id: profile.organization_id, escopo, profissional_id: profissionalId, ano, mes, valor_meta: valor,
  });
  if (error) return { error: "Erro ao salvar: " + error.message };

  revalidatePath("/app/metas");
  return { ok: true };
}

// Define a comissão de um profissional (ou geral). Uma regra por profissional.
export async function salvarComissao(_prev: MetaState, fd: FormData): Promise<MetaState> {
  const profile = await getProfile();
  if (!profile?.organization_id) redirect("/login");

  const profissionalId = String(fd.get("profissional_id") ?? "").trim() || null;
  const percentual = parseFloat(String(fd.get("percentual") ?? "0").replace(",", ".")) || 0;
  if (percentual <= 0) return { error: "Informe o percentual." };

  const supabase = await createClient();
  let del = supabase.from("commission_rules").delete();
  del = profissionalId ? del.eq("profissional_id", profissionalId) : del.is("profissional_id", null);
  await del;

  const { error } = await supabase.from("commission_rules").insert({
    organization_id: profile.organization_id, profissional_id: profissionalId, percentual,
  });
  if (error) return { error: "Erro ao salvar: " + error.message };

  revalidatePath("/app/metas");
  return { ok: true };
}

export async function excluirMeta(id: string) {
  const supabase = await createClient();
  await supabase.from("goals").delete().eq("id", id);
  revalidatePath("/app/metas");
}
export async function excluirComissao(id: string) {
  const supabase = await createClient();
  await supabase.from("commission_rules").delete().eq("id", id);
  revalidatePath("/app/metas");
}
