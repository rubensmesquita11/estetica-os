"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/auth";
import type { Cargo } from "@/lib/types";

export type ConfigState =
  | { error?: string; ok?: string; senha?: string; email?: string }
  | undefined;

const GESTORES: Cargo[] = ["admin", "gestor"];

// ── ATUALIZAR DADOS DA CLÍNICA ──────────────────────────────────
export async function atualizarClinica(_prev: ConfigState, fd: FormData): Promise<ConfigState> {
  const profile = await getProfile();
  if (!profile?.organization_id || !GESTORES.includes(profile.cargo))
    return { error: "Sem permissão." };

  const nome = String(fd.get("nome") ?? "").trim();
  if (!nome) return { error: "Informe o nome da clínica." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("organizations")
    .update({
      nome,
      cnpj: String(fd.get("cnpj") ?? "").trim() || null,
      telefone: String(fd.get("telefone") ?? "").trim() || null,
      cidade: String(fd.get("cidade") ?? "").trim() || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", profile.organization_id);

  if (error) return { error: "Erro ao salvar: " + error.message };
  revalidatePath("/app/configuracoes");
  return { ok: "Dados da clínica atualizados." };
}

// ── CONVIDAR MEMBRO DA EQUIPE ───────────────────────────────────
export async function convidarMembro(_prev: ConfigState, fd: FormData): Promise<ConfigState> {
  const profile = await getProfile();
  if (!profile?.organization_id || !GESTORES.includes(profile.cargo))
    return { error: "Sem permissão para convidar." };

  const nome = String(fd.get("nome") ?? "").trim();
  const email = String(fd.get("email") ?? "").trim().toLowerCase();
  const cargo = String(fd.get("cargo") ?? "profissional") as Cargo;
  if (!nome || !email) return { error: "Informe nome e e-mail." };

  const admin = createAdminClient();
  const senha = randomUUID().slice(0, 10);

  // Cria o usuário de login (sem precisar de e-mail configurado).
  const { data: novo, error: authErr } = await admin.auth.admin.createUser({
    email,
    password: senha,
    email_confirm: true,
    user_metadata: { nome },
  });
  if (authErr || !novo.user)
    return { error: "Erro ao criar acesso: " + (authErr?.message ?? "desconhecido") };

  // Cria o perfil dentro da MESMA clínica.
  const { error: profErr } = await admin.from("profiles").upsert({
    id: novo.user.id,
    organization_id: profile.organization_id,
    nome,
    email,
    cargo,
    is_profissional: cargo === "profissional",
  });
  if (profErr) return { error: "Acesso criado, mas erro no perfil: " + profErr.message };

  revalidatePath("/app/configuracoes");
  return {
    ok: `${nome} foi adicionado(a) à equipe.`,
    email,
    senha,
  };
}

// ── MUDAR CARGO ─────────────────────────────────────────────────
export async function mudarCargo(id: string, cargo: Cargo) {
  const profile = await getProfile();
  if (!profile?.organization_id || !GESTORES.includes(profile.cargo)) return;

  const admin = createAdminClient();
  await admin
    .from("profiles")
    .update({ cargo, is_profissional: cargo === "profissional" })
    .eq("id", id)
    .eq("organization_id", profile.organization_id);
  revalidatePath("/app/configuracoes");
}

// ── ATIVAR / DESATIVAR MEMBRO ───────────────────────────────────
export async function alternarAtivo(id: string, ativo: boolean) {
  const profile = await getProfile();
  if (!profile?.organization_id || !GESTORES.includes(profile.cargo)) return;
  if (id === profile.id) return; // não desativa a si mesmo

  const admin = createAdminClient();
  await admin
    .from("profiles")
    .update({ ativo })
    .eq("id", id)
    .eq("organization_id", profile.organization_id);
  revalidatePath("/app/configuracoes");
}
