// Cliente Supabase para o NAVEGADOR (componentes 'use client').
// Usa a chave anon (pública). O RLS no banco é quem protege os dados.
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
