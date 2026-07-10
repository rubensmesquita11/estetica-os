"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/auth";
import { logAcao } from "@/lib/audit";

export type PacienteState = { error?: string } | undefined;

function limpar(fd: FormData) {
  const val = (k: string) => {
    const v = String(fd.get(k) ?? "").trim();
    return v === "" ? null : v;
  };
  return {
    nome: val("nome"),
    telefone: val("telefone"),
    email: val("email"),
    nascimento: val("nascimento"),
    profissao: val("profissao"),
    cidade: val("cidade"),
    instagram: val("instagram"),
    origem: val("origem"),
    observacoes: val("observacoes"),
  };
}

// ── CRIAR ───────────────────────────────────────────────────────
export async function criarPaciente(
  _prev: PacienteState,
  formData: FormData,
): Promise<PacienteState> {
  const profile = await getProfile();
  if (!profile?.organization_id) redirect("/login");

  const dados = limpar(formData);
  if (!dados.nome) return { error: "O nome do paciente é obrigatório." };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("patients")
    .insert({ ...dados, organization_id: profile.organization_id })
    .select("id")
    .single();

  if (error) return { error: "Erro ao salvar: " + error.message };

  await logAcao(profile.organization_id, profile.id, "criou_paciente", "patients", data.id, {
    nome: dados.nome,
  });

  revalidatePath("/app/pacientes");
  redirect(`/app/pacientes/${data.id}`);
}

// ── ATUALIZAR ───────────────────────────────────────────────────
export async function atualizarPaciente(
  id: string,
  _prev: PacienteState,
  formData: FormData,
): Promise<PacienteState> {
  const profile = await getProfile();
  if (!profile?.organization_id) redirect("/login");

  const dados = limpar(formData);
  if (!dados.nome) return { error: "O nome do paciente é obrigatório." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("patients")
    .update({ ...dados, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return { error: "Erro ao atualizar: " + error.message };

  await logAcao(profile.organization_id, profile.id, "editou_paciente", "patients", id);

  revalidatePath("/app/pacientes");
  revalidatePath(`/app/pacientes/${id}`);
  redirect(`/app/pacientes/${id}`);
}

// ── EXCLUIR ─────────────────────────────────────────────────────
export async function excluirPaciente(id: string) {
  const profile = await getProfile();
  if (!profile?.organization_id) redirect("/login");

  const supabase = await createClient();
  const { error } = await supabase.from("patients").delete().eq("id", id);
  if (!error) {
    await logAcao(profile.organization_id, profile.id, "excluiu_paciente", "patients", id);
  }
  revalidatePath("/app/pacientes");
  redirect("/app/pacientes");
}
