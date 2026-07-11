import { createClient } from "@/lib/supabase/server";
import { IndicacaoForm } from "@/components/indicacao-form";
import { converterIndicacao, excluirIndicacao } from "./actions";

export default async function IndicacoesPage() {
  const supabase = await createClient();

  const [{ data: refs }, { data: pacientes }] = await Promise.all([
    supabase
      .from("referrals")
      .select("*, indicador:indicador_id(nome)")
      .order("created_at", { ascending: false }),
    supabase.from("patients").select("id, nome").order("nome"),
  ]);

  const referrals = refs ?? [];

  // Ranking: por indicador, total e convertidas.
  const mapa = new Map<string, { nome: string; total: number; convertidas: number }>();
  for (const r of referrals) {
    const nome = (r.indicador as { nome?: string } | null)?.nome ?? "—";
    const key = r.indicador_id ?? nome;
    const cur = mapa.get(key) ?? { nome, total: 0, convertidas: 0 };
    cur.total += 1;
    if (r.status === "convertido") cur.convertidas += 1;
    mapa.set(key, cur);
  }
  const ranking = [...mapa.values()].sort((a, b) => b.convertidas - a.convertidas || b.total - a.total);

  const totalConv = referrals.filter((r) => r.status === "convertido").length;

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-semibold">Programa de indicação</h1>
      <p className="text-sm text-muted">
        {referrals.length} indicação(ões) · {totalConv} convertida(s) em paciente.
      </p>

      {/* Ranking */}
      {ranking.length > 0 && (
        <div className="mt-6 card">
          <h2 className="mb-3 font-semibold">🏆 Quem mais indica</h2>
          <ul className="divide-y divide-border">
            {ranking.slice(0, 5).map((r, i) => (
              <li key={r.nome + i} className="flex items-center gap-3 py-2.5">
                <span className="grid h-7 w-7 place-items-center rounded-full bg-primary-soft text-xs font-semibold text-primary">
                  {i + 1}
                </span>
                <span className="flex-1 font-medium">{r.nome}</span>
                <span className="text-sm text-muted">{r.convertidas} convertida(s) / {r.total}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Registrar */}
      <div className="mt-6 card">
        <h2 className="mb-4 font-semibold">Registrar indicação</h2>
        <IndicacaoForm pacientes={pacientes ?? []} />
      </div>

      {/* Lista */}
      <h2 className="mt-8 mb-3 font-semibold">Indicações</h2>
      {referrals.length === 0 ? (
        <div className="card py-8 text-center text-sm text-muted">Nenhuma indicação registrada ainda.</div>
      ) : (
        <div className="card p-0">
          <ul className="divide-y divide-border">
            {referrals.map((r) => {
              const indicador = (r.indicador as { nome?: string } | null)?.nome ?? "—";
              const converter = converterIndicacao.bind(null, r.id);
              const apagar = excluirIndicacao.bind(null, r.id);
              return (
                <li key={r.id} className="flex flex-wrap items-center gap-3 px-5 py-3">
                  <div className="min-w-0 flex-1">
                    <div className="text-sm">
                      <span className="font-medium">{indicador}</span>
                      <span className="text-muted"> indicou </span>
                      <span className="font-medium">{r.indicado_nome}</span>
                    </div>
                  </div>
                  {r.status === "convertido" ? (
                    <span className="badge bg-success-soft text-success">convertido ✓</span>
                  ) : (
                    <form action={converter}>
                      <button className="btn-outline text-sm">Converter em paciente</button>
                    </form>
                  )}
                  <form action={apagar}>
                    <button className="text-muted hover:text-danger" title="Excluir">✕</button>
                  </form>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
