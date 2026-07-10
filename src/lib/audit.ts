// Registra ações importantes (seção 20 — logs de auditoria).
import { createClient } from "@/lib/supabase/server";

export async function logAcao(
  organizationId: string,
  userId: string,
  acao: string,
  tabela: string,
  registroId?: string,
  detalhe?: Record<string, unknown>,
) {
  const supabase = await createClient();
  await supabase.from("audit_logs").insert({
    organization_id: organizationId,
    user_id: userId,
    acao,
    tabela,
    registro_id: registroId ?? null,
    detalhe: detalhe ?? {},
  });
}
