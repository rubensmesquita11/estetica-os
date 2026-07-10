import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { AgendamentoForm } from "@/components/agendamento-form";

export default async function NovoAgendamentoPage({
  searchParams,
}: {
  searchParams: Promise<{ data?: string }>;
}) {
  const { data: dataParam } = await searchParams;
  const hoje = new Date();
  const dataInicial =
    dataParam ??
    `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}-${String(hoje.getDate()).padStart(2, "0")}`;

  const supabase = await createClient();
  const [pacientesR, procsR, profsR] = await Promise.all([
    supabase.from("patients").select("id, nome").order("nome"),
    supabase.from("procedures").select("id, nome, valor, duracao_min").eq("ativo", true).order("nome"),
    supabase.from("profiles").select("id, nome").eq("is_profissional", true).order("nome"),
  ]);

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/app/agenda" className="text-sm text-muted hover:underline">← Voltar para agenda</Link>
      <h1 className="mt-2 text-2xl font-semibold">Novo agendamento</h1>

      <div className="card mt-5">
        <AgendamentoForm
          pacientes={pacientesR.data ?? []}
          procedimentos={procsR.data ?? []}
          profissionais={profsR.data ?? []}
          dataInicial={dataInicial}
        />
      </div>
    </div>
  );
}
