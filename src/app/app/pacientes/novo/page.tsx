import Link from "next/link";
import { PacienteForm } from "@/components/paciente-form";
import { criarPaciente } from "../actions";

export default function NovoPacientePage() {
  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/app/pacientes" className="text-sm text-muted hover:underline">
        ← Voltar para pacientes
      </Link>
      <h1 className="mt-2 text-2xl font-semibold">Novo paciente</h1>
      <p className="text-sm text-muted">Preencha os dados. Só o nome é obrigatório.</p>

      <div className="card mt-5">
        <PacienteForm action={criarPaciente} voltarHref="/app/pacientes" />
      </div>
    </div>
  );
}
