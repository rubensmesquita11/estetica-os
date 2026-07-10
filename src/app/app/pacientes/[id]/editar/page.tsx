import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PacienteForm } from "@/components/paciente-form";
import { atualizarPaciente } from "../../actions";
import type { Patient } from "@/lib/types";

export default async function EditarPacientePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("patients").select("*").eq("id", id).single();
  if (!data) notFound();

  const action = atualizarPaciente.bind(null, id);
  const voltar = `/app/pacientes/${id}`;

  return (
    <div className="mx-auto max-w-2xl">
      <Link href={voltar} className="text-sm text-muted hover:underline">← Voltar</Link>
      <h1 className="mt-2 text-2xl font-semibold">Editar paciente</h1>

      <div className="card mt-5">
        <PacienteForm action={action} paciente={data as Patient} voltarHref={voltar} />
      </div>
    </div>
  );
}
