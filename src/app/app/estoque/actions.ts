"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/auth";

export type EstoqueState = { error?: string; ok?: boolean } | undefined;

export async function criarItem(_prev: EstoqueState, fd: FormData): Promise<EstoqueState> {
  const profile = await getProfile();
  if (!profile?.organization_id) redirect("/login");

  const nome = String(fd.get("nome") ?? "").trim();
  if (!nome) return { error: "Informe o nome do item." };
  const num = (k: string) => parseFloat(String(fd.get(k) ?? "0").replace(",", ".")) || 0;

  const supabase = await createClient();
  const { error } = await supabase.from("inventory_items").insert({
    organization_id: profile.organization_id,
    nome,
    categoria: String(fd.get("categoria") ?? "").trim() || null,
    unidade: String(fd.get("unidade") ?? "un").trim() || "un",
    quantidade: num("quantidade"),
    estoque_minimo: num("estoque_minimo"),
    custo: num("custo"),
    validade: String(fd.get("validade") ?? "").trim() || null,
    fornecedor: String(fd.get("fornecedor") ?? "").trim() || null,
    lote: String(fd.get("lote") ?? "").trim() || null,
  });
  if (error) return { error: "Erro ao salvar: " + error.message };

  revalidatePath("/app/estoque");
  return { ok: true };
}

// Registra entrada/saída e atualiza a quantidade do item.
export async function registrarMovimento(itemId: string, tipo: "entrada" | "saida", quantidade: number) {
  const profile = await getProfile();
  if (!profile?.organization_id) redirect("/login");
  if (!quantidade || quantidade <= 0) return;

  const supabase = await createClient();
  const { data: item } = await supabase.from("inventory_items").select("quantidade").eq("id", itemId).single();
  if (!item) return;

  const nova = tipo === "entrada" ? item.quantidade + quantidade : Math.max(0, item.quantidade - quantidade);

  await supabase.from("inventory_movements").insert({
    organization_id: profile.organization_id, item_id: itemId, tipo, quantidade, created_by: profile.id,
  });
  await supabase.from("inventory_items").update({ quantidade: nova }).eq("id", itemId);

  revalidatePath("/app/estoque");
}

export async function excluirItem(id: string) {
  const supabase = await createClient();
  await supabase.from("inventory_items").delete().eq("id", id);
  revalidatePath("/app/estoque");
}
