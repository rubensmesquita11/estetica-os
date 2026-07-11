import { createClient } from "@/lib/supabase/server";
import { MetaForm, ComissaoForm } from "@/components/metas-forms";
import { excluirMeta, excluirComissao } from "./actions";

function brl(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function Barra({ pct }: { pct: number }) {
  return (
    <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-surface-2">
      <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, pct)}%` }} />
    </div>
  );
}

export default async function MetasPage() {
  const supabase = await createClient();
  const agora = new Date();
  const ano = agora.getFullYear();
  const mes = agora.getMonth() + 1;
  const inicioMes = new Date(ano, mes - 1, 1);

  const [{ data: profs }, { data: goals }, { data: rules }, { data: appts }] = await Promise.all([
    supabase.from("profiles").select("id, nome").eq("ativo", true).order("nome"),
    supabase.from("goals").select("*").eq("ano", ano).eq("mes", mes),
    supabase.from("commission_rules").select("*"),
    supabase.from("appointments").select("profissional_id, valor").eq("status", "finalizado").gte("inicio", inicioMes.toISOString()),
  ]);

  const profissionais = profs ?? [];
  const nomePorId = new Map(profissionais.map((p) => [p.id, p.nome ?? "Sem nome"]));

  // Realizado no mês
  const realizadoPorProf = new Map<string, number>();
  let realizadoTotal = 0;
  for (const a of appts ?? []) {
    realizadoTotal += a.valor ?? 0;
    if (a.profissional_id) realizadoPorProf.set(a.profissional_id, (realizadoPorProf.get(a.profissional_id) ?? 0) + (a.valor ?? 0));
  }

  const metaClinica = (goals ?? []).find((g) => g.escopo === "clinica");
  const metasProf = (goals ?? []).filter((g) => g.escopo === "profissional");

  // Comissões
  const geral = (rules ?? []).find((r) => !r.profissional_id);
  const pctPorProf = new Map((rules ?? []).filter((r) => r.profissional_id).map((r) => [r.profissional_id, r.percentual]));

  const nomeMes = agora.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-semibold">Metas e comissões</h1>
      <p className="text-sm text-muted capitalize">{nomeMes}</p>

      {/* Meta da clínica */}
      <div className="mt-6 card">
        <h2 className="font-semibold">Meta da clínica</h2>
        {metaClinica ? (
          <div className="mt-3">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">{brl(realizadoTotal)} de {brl(metaClinica.valor_meta)}</span>
              <span className="text-muted">{Math.round((realizadoTotal / metaClinica.valor_meta) * 100)}%</span>
            </div>
            <Barra pct={(realizadoTotal / metaClinica.valor_meta) * 100} />
            <form action={excluirMeta.bind(null, metaClinica.id)} className="mt-2">
              <button className="text-xs text-muted hover:text-danger">remover meta</button>
            </form>
          </div>
        ) : (
          <p className="mt-2 text-sm text-muted">Nenhuma meta definida. Realizado no mês: {brl(realizadoTotal)}.</p>
        )}
      </div>

      {/* Metas por profissional */}
      {metasProf.length > 0 && (
        <div className="mt-6 card">
          <h2 className="mb-3 font-semibold">Metas por profissional</h2>
          <ul className="space-y-4">
            {metasProf.map((g) => {
              const real = realizadoPorProf.get(g.profissional_id) ?? 0;
              return (
                <li key={g.id}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{nomePorId.get(g.profissional_id) ?? "—"}</span>
                    <span className="text-muted">{brl(real)} / {brl(g.valor_meta)}</span>
                  </div>
                  <Barra pct={(real / g.valor_meta) * 100} />
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Definir meta */}
      <div className="mt-6 card">
        <h2 className="mb-4 font-semibold">Definir meta do mês</h2>
        <MetaForm profissionais={profissionais} />
      </div>

      {/* Comissões */}
      <div className="mt-8 card">
        <h2 className="font-semibold">Comissões do mês</h2>
        {geral && <p className="mt-1 text-xs text-muted">Regra geral: {geral.percentual}% para todos (salvo regra específica).</p>}
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-muted">
                <th className="pb-2">Profissional</th>
                <th className="pb-2 text-right">Realizado</th>
                <th className="pb-2 text-right">%</th>
                <th className="pb-2 text-right">Comissão</th>
              </tr>
            </thead>
            <tbody>
              {profissionais.map((p) => {
                const real = realizadoPorProf.get(p.id) ?? 0;
                const pct = pctPorProf.get(p.id) ?? geral?.percentual ?? 0;
                const com = real * (pct / 100);
                if (real === 0 && pct === 0) return null;
                return (
                  <tr key={p.id} className="border-t border-border">
                    <td className="py-2">{p.nome ?? "Sem nome"}</td>
                    <td className="py-2 text-right">{brl(real)}</td>
                    <td className="py-2 text-right">{pct}%</td>
                    <td className="py-2 text-right font-medium">{brl(com)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Definir comissão */}
      <div className="mt-6 card">
        <h2 className="mb-4 font-semibold">Definir comissão</h2>
        <ComissaoForm profissionais={profissionais} />
        {(rules ?? []).length > 0 && (
          <ul className="mt-4 space-y-1 border-t border-border pt-3">
            {(rules ?? []).map((r) => (
              <li key={r.id} className="flex items-center justify-between text-sm">
                <span>{r.profissional_id ? nomePorId.get(r.profissional_id) ?? "—" : "Geral (todos)"} — {r.percentual}%</span>
                <form action={excluirComissao.bind(null, r.id)}>
                  <button className="text-xs text-muted hover:text-danger">remover</button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
