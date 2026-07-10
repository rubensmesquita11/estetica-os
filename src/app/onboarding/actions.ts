"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient, createAdminClient } from "@/lib/supabase/server";

export type OnboardingState = { error?: string } | undefined;

// Cria a organização (clínica) e o perfil do dono (cargo admin).
// Usa o cliente admin (service_role) porque, neste instante, o usuário ainda
// não tem organization_id — então o RLS normal bloquearia a inserção.
export async function criarClinica(
  _prev: OnboardingState,
  formData: FormData,
): Promise<OnboardingState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const nomeClinica = String(formData.get("nome_clinica") || "").trim();
  const cidade = String(formData.get("cidade") || "").trim();
  const telefone = String(formData.get("telefone") || "").trim();
  const seuNome = String(formData.get("seu_nome") || "").trim();
  if (!nomeClinica || !seuNome)
    return { error: "Informe o nome da clínica e o seu nome." };

  const admin = createAdminClient();

  // Já existe perfil? Então o onboarding já foi feito.
  const { data: perfilExistente } = await admin
    .from("profiles")
    .select("organization_id")
    .eq("id", user.id)
    .maybeSingle();

  if (perfilExistente?.organization_id) {
    redirect("/app/dashboard");
  }

  // 1. Cria a organização.
  const { data: org, error: orgErr } = await admin
    .from("organizations")
    .insert({
      nome: nomeClinica,
      cidade: cidade || null,
      telefone: telefone || null,
      onboarding_completo: true,
    })
    .select()
    .single();
  if (orgErr || !org) return { error: "Erro ao criar a clínica: " + orgErr?.message };

  // 2. Cria o perfil do dono como admin e profissional.
  const { error: profErr } = await admin.from("profiles").upsert({
    id: user.id,
    organization_id: org.id,
    nome: seuNome,
    email: user.email,
    cargo: "admin",
    is_profissional: true,
  });
  if (profErr) return { error: "Erro ao criar seu perfil: " + profErr.message };

  revalidatePath("/", "layout");
  redirect("/app/dashboard");
}
