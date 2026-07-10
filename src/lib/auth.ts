// Helpers de autenticação para o SERVIDOR.
// Retornam o usuário logado junto do seu perfil e organização.
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

export async function getSessionUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

// Perfil completo (com organization_id e cargo). null se não logado / sem perfil.
export async function getProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (data as Profile) ?? null;
}

// true se o cargo do usuário está na lista permitida.
export function podeAcessar(cargo: string | undefined, permitidos: string[]) {
  return !!cargo && permitidos.includes(cargo);
}
