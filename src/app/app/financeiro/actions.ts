"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/auth";

export type FinState = { error?: string; ok?: boolean } | undefined;

export async function criarLancamento(_prev: FinState, fd: FormData): Promise<FinState> {
  const profile = await getProfile();
  if (!profile?.organization_id) redirect("/login");

  const tipo = String(fd.get("tipo") ?? "receita");
  const valor = parseFloat(String(fd.get("valor") ?? "0").replace(".", "").replace(",", ".")) || 0;
  const descricao = String(fd.get("descricao") ?? "").trim() || null;
  const categoria = String(fd.get("categoria") ?? "").trim() || null;
  const data = String(fd.get("data") ?? "").trim() || new Date().toISOString().slice(0, 10);
  const status = String(fd.get("status") ?? "pago");
  if (valor <= 0) return { error: "Informe um valor maior que zero." };

  const supabase = await createClient();
  const { error } = await supabase.from("financial_entries").insert({
    organization_id: profile.organization_id,
    tipo, categoria, descricao, valor, data, status,
    created_by: profile.id,
  });
  if (error) return { error: "Erro ao salvar: " + error.message };

  revalidatePath("/app/financeiro");
  return { ok: true };
}

export async function alternarStatus(id: string, novo: "pago" | "pendente") {
  const supabase = await createClient();
  await supabase.from("financial_entries").update({ status: novo }).eq("id", id);
  revalidatePath("/app/financeiro");
}

export async function excluirLancamento(id: string) {
  const supabase = await createClient();
  await supabase.from("financial_entries").delete().eq("id", id);
  revalidatePath("/app/financeiro");
}
