import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AnamneseForm, EvolucaoForm } from "@/components/prontuario";
import type { MedicalRecord } from "@/lib/types";

function dataHora(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

export default async function ProntuarioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: paciente } = await supabase
    .from("patients")
    .select("id, nome")
    .eq("id", id)
    .single();
  if (!paciente) notFound();

  const [{ data: record }, { data: evolucoes }] = await Promise.all([
    supabase.from("medical_records").select("*").eq("patient_id", id).maybeSingle(),
    supabase
      .from("evolutions")
      .select("id, texto, created_at, profiles(nome)")
      .eq("patient_id", id)
      .order("created_at", { ascending: false }),
  ]);

  return (
    <div className="mx-auto max-w-3xl">
      <Link href={`/app/pacientes/${id}`} className="text-sm text-muted hover:underline">
        ← Voltar para {paciente.nome}
      </Link>
      <h1 className="mt-2 text-2xl font-semibold">Prontuário</h1>
      <p className="text-sm text-muted">{paciente.nome}</p>

      {/* Anamnese */}
      <div className="mt-6 card">
        <h2 className="mb-4 font-semibold">Anamnese</h2>
        <AnamneseForm patientId={id} record={(record as MedicalRecord) ?? null} />
      </div>

      {/* Evolução */}
      <div className="mt-6 card">
        <h2 className="font-semibold">Evolução clínica</h2>
        <div className="mt-4">
          <EvolucaoForm patientId={id} />
        </div>

        <div className="mt-6 border-t border-border pt-4">
          {!evolucoes || evolucoes.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted">Nenhuma anotação ainda.</p>
          ) : (
            <ul className="space-y-4">
              {evolucoes.map((e) => {
                const autor = (e.profiles as { nome?: string } | null)?.nome ?? "Profissional";
                return (
                  <li key={e.id} className="border-l-2 border-primary-soft pl-4">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-medium text-primary">{autor}</span>
                      <span className="text-xs text-muted">{dataHora(e.created_at)}</span>
                    </div>
                    <p className="mt-1 whitespace-pre-wrap text-sm">{e.texto}</p>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
