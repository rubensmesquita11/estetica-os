import Link from "next/link";
import { ProcedimentoForm } from "@/components/procedimento-form";
import { criarProcedimento } from "../actions";

export default function NovoProcedimentoPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/app/procedimentos" className="text-sm text-muted hover:underline">← Voltar</Link>
      <h1 className="mt-2 text-2xl font-semibold">Novo procedimento</h1>
      <div className="card mt-5">
        <ProcedimentoForm action={criarProcedimento} />
      </div>
    </div>
  );
}
