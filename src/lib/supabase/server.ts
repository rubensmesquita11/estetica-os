// Cliente Supabase para o SERVIDOR (Server Components, Server Actions, Route Handlers).
// No Next.js 16, cookies() é assíncrono — por isso o await.
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Chamado de um Server Component — o proxy.ts cuida de renovar a sessão.
          }
        },
      },
    },
  );
}

// Cliente ADMIN (service_role) — SÓ no servidor, para operações privilegiadas
// como criar a organização + primeiro perfil no cadastro. Ignora o RLS.
import { createClient as createAdminBase } from "@supabase/supabase-js";

export function createAdminClient() {
  return createAdminBase(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
