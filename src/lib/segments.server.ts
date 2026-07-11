// Calcula o público de cada segmento a partir dos dados reais.
// SÓ importe este arquivo de código de servidor (usa next/headers via supabase/server).
import { createClient } from "@/lib/supabase/server";
import type { Segmento, Alvo } from "@/lib/segments";

const DIA = 24 * 60 * 60 * 1000;

export async function getAudiencia(segmento: Segmento): Promise<Alvo[]> {
  const supabase = await createClient();

  if (segmento === "todos") {
    const { data } = await supabase.from("patients").select("id, nome, telefone").order("nome");
    return (data ?? []).map((p) => ({ id: p.id, nome: p.nome, telefone: p.telefone, motivo: "Paciente da clínica" }));
  }

  if (segmento === "aniversariantes_mes") {
    const mes = new Date().getMonth();
    const { data } = await supabase.from("patients").select("id, nome, telefone, nascimento").not("nascimento", "is", null);
    return (data ?? [])
      .filter((p) => new Date(p.nascimento + "T00:00:00").getMonth() === mes)
      .map((p) => ({ id: p.id, nome: p.nome, telefone: p.telefone, motivo: "Faz aniversário este mês" }));
  }

  if (segmento === "pacote_incompleto") {
    const { data } = await supabase
      .from("treatment_plans")
      .select("patient_id, nome, patients(nome, telefone)")
      .eq("status", "ativo");
    const vistos = new Set<string>();
    const alvos: Alvo[] = [];
    for (const p of data ?? []) {
      if (!p.patient_id || vistos.has(p.patient_id)) continue;
      vistos.add(p.patient_id);
      const pac = p.patients as { nome?: string; telefone?: string | null } | null;
      alvos.push({ id: p.patient_id, nome: pac?.nome ?? "Paciente", telefone: pac?.telefone ?? null, motivo: `Plano "${p.nome}" em andamento` });
    }
    return alvos;
  }

  // inativos: último atendimento finalizado há mais de 90 dias
  const { data: appts } = await supabase
    .from("appointments")
    .select("patient_id, inicio, patients(nome, telefone)")
    .eq("status", "finalizado")
    .order("inicio", { ascending: false });

  const hoje = Date.now();
  const vistos = new Set<string>();
  const alvos: Alvo[] = [];
  for (const a of appts ?? []) {
    if (!a.patient_id || vistos.has(a.patient_id)) continue;
    vistos.add(a.patient_id);
    const dias = Math.floor((hoje - new Date(a.inicio).getTime()) / DIA);
    if (dias > 90) {
      const pac = a.patients as { nome?: string; telefone?: string | null } | null;
      alvos.push({ id: a.patient_id, nome: pac?.nome ?? "Paciente", telefone: pac?.telefone ?? null, motivo: `Sem voltar há ${dias} dias` });
    }
  }
  return alvos;
}
