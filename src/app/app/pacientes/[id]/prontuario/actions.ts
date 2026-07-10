"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/auth";

export type ProntState = { error?: string; ok?: boolean } | undefined;

// ── Salvar anamnese (cria ou atualiza — 1 por paciente) ─────────
export async function salvarAnamnese(
  patientId: string,
  _prev: ProntState,
  fd: FormData,
): Promise<ProntState> {
  const profile = await getProfile();
  if (!profile?.organization_id) redirect("/login");

  const txt = (k: string) => {
    const v = String(fd.get(k) ?? "").trim();
    return v === "" ? null : v;
  };

  const supabase = await createClient();
  const { error } = await supabase.from("medical_records").upsert(
    {
      organization_id: profile.organization_id,
      patient_id: patientId,
      queixa_principal: txt("queixa_principal"),
      historico_saude: txt("historico_saude"),
      alergias: txt("alergias"),
      medicamentos: txt("medicamentos"),
      contraindicacoes: txt("contraindicacoes"),
      gestante: fd.get("gestante") === "on",
      observacoes_clinicas: txt("observacoes_clinicas"),
      updated_by: profile.id,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "patient_id" },
  );

  if (error) return { error: "Erro ao salvar: " + error.message };
  revalidatePath(`/app/pacientes/${patientId}/prontuario`);
  return { ok: true };
}

// ── Adicionar anotação de evolução ──────────────────────────────
export async function adicionarEvolucao(
  patientId: string,
  _prev: ProntState,
  fd: FormData,
): Promise<ProntState> {
  const profile = await getProfile();
  if (!profile?.organization_id) redirect("/login");

  const texto = String(fd.get("texto") ?? "").trim();
  if (!texto) return { error: "Escreva a anotação antes de salvar." };

  const supabase = await createClient();
  const { error } = await supabase.from("evolutions").insert({
    organization_id: profile.organization_id,
    patient_id: patientId,
    profissional_id: profile.id,
    texto,
  });

  if (error) return { error: "Erro ao salvar: " + error.message };
  revalidatePath(`/app/pacientes/${patientId}/prontuario`);
  return { ok: true };
}
