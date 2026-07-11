import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { CampanhaForm } from "@/components/campanha-form";
import { SEGMENTO_LABEL, type Segmento } from "@/lib/segments";

const STATUS_COR: Record<string, string> = {
  rascunho: "bg-surface-2 text-muted",
  ativa: "bg-success-soft text-success",
  encerrada: "bg-surface-2 text-muted",
};

export default async function CampanhasPage() {
  const supabase = await createClient();
  const { data: campanhas } = await supabase
    .from("campaigns")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-semibold">Campanhas de reativação</h1>
      <p className="text-sm text-muted">Selecione um público e gere ações de contato em massa.</p>

      {/* Lista */}
      {(campanhas ?? []).length === 0 ? (
        <div className="card mt-6 py-10 text-center">
          <div className="text-3xl">📣</div>
          <p className="mt-2 text-sm text-muted">Nenhuma campanha ainda. Crie a primeira abaixo.</p>
        </div>
      ) : (
        <div className="mt-6 space-y-2">
          {(campanhas ?? []).map((c) => (
            <Link key={c.id} href={`/app/campanhas/${c.id}`} className="card flex items-center justify-between gap-3 py-3.5 transition-colors hover:bg-surface-2">
              <div>
                <div className="font-medium">{c.nome}</div>
                <div className="text-xs text-muted">{SEGMENTO_LABEL[c.segmento as Segmento]}</div>
              </div>
              <span className={`badge ${STATUS_COR[c.status]}`}>{c.status}</span>
            </Link>
          ))}
        </div>
      )}

      {/* Nova */}
      <div className="mt-8 card">
        <h2 className="mb-4 font-semibold">Nova campanha</h2>
        <CampanhaForm />
      </div>
    </div>
  );
}
