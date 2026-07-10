"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/auth";

export type ProcState = { error?: string } | undefined;

function ler(fd: FormData) {
  const nome = String(fd.get("nome") ?? "").trim();
  const categoria = String(fd.get("categoria") ?? "").trim() || null;
  const duracao = parseInt(String(fd.get("duracao_min") ?? "60"), 10) || 60;
  const valor = parseFloat(String(fd.get("valor") ?? "0").replace(",", ".")) || 0;
  const retornoRaw = String(fd.get("retorno_dias") ?? "").trim();
  const retorno_dias = retornoRaw ? parseInt(retornoRaw, 10) : null;
  return { nome, categoria, duracao_min: duracao, valor, retorno_dias };
}

export async function criarProcedimento(_prev: ProcState, fd: FormData): Promise<ProcState> {
  const profile = await getProfile();
  if (!profile?.organization_id) redirect("/login");

  const dados = ler(fd);
  if (!dados.nome) return { error: "Informe o nome do procedimento." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("procedures")
    .insert({ ...dados, organization_id: profile.organization_id });
  if (error) return { error: "Erro ao salvar: " + error.message };

  revalidatePath("/app/procedimentos");
  redirect("/app/procedimentos");
}

export async function atualizarProcedimento(id: string, _prev: ProcState, fd: FormData): Promise<ProcState> {
  const profile = await getProfile();
  if (!profile?.organization_id) redirect("/login");

  const dados = ler(fd);
  if (!dados.nome) return { error: "Informe o nome do procedimento." };

  const supabase = await createClient();
  const { error } = await supabase.from("procedures").update(dados).eq("id", id);
  if (error) return { error: "Erro ao atualizar: " + error.message };

  revalidatePath("/app/procedimentos");
  redirect("/app/procedimentos");
}

export async function excluirProcedimento(id: string) {
  const supabase = await createClient();
  await supabase.from("procedures").delete().eq("id", id);
  revalidatePath("/app/procedimentos");
  redirect("/app/procedimentos");
}
