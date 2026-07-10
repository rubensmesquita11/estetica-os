"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AuthState = { error?: string; message?: string } | undefined;

function faltaConfig() {
  return (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

// ── ENTRAR ──────────────────────────────────────────────────────
export async function signIn(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  if (faltaConfig())
    return { error: "Supabase ainda não configurado. Avise o desenvolvedor." };

  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  if (!email || !password) return { error: "Preencha e-mail e senha." };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) return { error: "E-mail ou senha incorretos." };

  revalidatePath("/", "layout");
  redirect("/app/dashboard");
}

// ── CRIAR CONTA ─────────────────────────────────────────────────
export async function signUp(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  if (faltaConfig())
    return { error: "Supabase ainda não configurado. Avise o desenvolvedor." };

  const nome = String(formData.get("nome") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  if (!nome || !email || !password)
    return { error: "Preencha todos os campos." };
  if (password.length < 6)
    return { error: "A senha precisa ter ao menos 6 caracteres." };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { nome } },
  });

  if (error) return { error: error.message };

  // Sem sessão = confirmação de e-mail ativada no Supabase.
  if (!data.session) {
    return {
      message:
        "Conta criada! Confirme seu e-mail para entrar. (Ou desative a confirmação nas configurações do Supabase.)",
    };
  }

  revalidatePath("/", "layout");
  redirect("/onboarding");
}

// ── SAIR ────────────────────────────────────────────────────────
export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
