import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProcedimentoForm } from "@/components/procedimento-form";
import { ConfirmDelete } from "@/components/confirm-delete";
import { atualizarProcedimento, excluirProcedimento } from "../../actions";
import type { Procedure } from "@/lib/types";

export default async function EditarProcedimentoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("procedures").select("*").eq("id", id).single();
  if (!data) notFound();

  const action = atualizarProcedimento.bind(null, id);
  const excluir = excluirProcedimento.bind(null, id);

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/app/procedimentos" className="text-sm text-muted hover:underline">← Voltar</Link>
      <h1 className="mt-2 text-2xl font-semibold">Editar procedimento</h1>

      <div className="card mt-5">
        <ProcedimentoForm action={action} procedimento={data as Procedure} />
      </div>

      <div className="mt-6 flex justify-end">
        <ConfirmDelete action={excluir} label="Excluir procedimento" pergunta="Excluir este procedimento?" />
      </div>
    </div>
  );
}
