import { createClient } from "@/lib/supabase/server";
import { LancamentoForm } from "@/components/lancamento-form";
import { alternarStatus, excluirLancamento } from "./actions";

function brl(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
function dataBR(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

export default async function FinanceiroPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("financial_entries")
    .select("*")
    .order("data", { ascending: false })
    .limit(200);
  const entries = data ?? [];

  const agora = new Date();
  const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1);
  const noMes = (e: { data: string }) => new Date(e.data + "T00:00:00") >= inicioMes;

  const receitasMes = entries.filter((e) => e.tipo === "receita" && e.status === "pago" && noMes(e)).reduce((s, e) => s + e.valor, 0);
  const despesasMes = entries.filter((e) => e.tipo === "despesa" && e.status === "pago" && noMes(e)).reduce((s, e) => s + e.valor, 0);
  const aReceber = entries.filter((e) => e.tipo === "receita" && e.status === "pendente").reduce((s, e) => s + e.valor, 0);
  const aPagar = entries.filter((e) => e.tipo === "despesa" && e.status === "pendente").reduce((s, e) => s + e.valor, 0);
  const saldo = receitasMes - despesasMes;

  const cards = [
    { label: "Entradas do mês", valor: brl(receitasMes), cor: "text-success" },
    { label: "Saídas do mês", valor: brl(despesasMes), cor: "text-danger" },
    { label: "Saldo do mês", valor: brl(saldo), cor: saldo >= 0 ? "text-foreground" : "text-danger" },
    { label: "A receber", valor: brl(aReceber), cor: "text-muted" },
    { label: "A pagar", valor: brl(aPagar), cor: "text-muted" },
  ];

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-2xl font-semibold">Financeiro</h1>
      <p className="text-sm text-muted">Fluxo de caixa da clínica.</p>

      {/* Cards */}
      <div className="mt-6 grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {cards.map((c) => (
          <div key={c.label} className="card">
            <div className="text-xs text-muted">{c.label}</div>
            <div className={`mt-1 text-lg font-semibold ${c.cor}`}>{c.valor}</div>
          </div>
        ))}
      </div>

      {/* Novo lançamento */}
      <div className="mt-6 card">
        <h2 className="mb-4 font-semibold">Novo lançamento</h2>
        <LancamentoForm />
      </div>

      {/* Lista */}
      <h2 className="mt-8 mb-3 font-semibold">Últimos lançamentos</h2>
      {entries.length === 0 ? (
        <div className="card py-10 text-center text-sm text-muted">Nenhum lançamento ainda.</div>
      ) : (
        <div className="card p-0">
          <ul className="divide-y divide-border">
            {entries.slice(0, 40).map((e) => {
              const alternar = alternarStatus.bind(null, e.id, e.status === "pago" ? "pendente" : "pago");
              const apagar = excluirLancamento.bind(null, e.id);
              const receita = e.tipo === "receita";
              return (
                <li key={e.id} className="flex items-center gap-3 px-5 py-3">
                  <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm ${receita ? "bg-success-soft text-success" : "bg-danger-soft text-danger"}`}>
                    {receita ? "↑" : "↓"}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{e.categoria ?? (receita ? "Receita" : "Despesa")}</div>
                    <div className="truncate text-xs text-muted">{e.descricao ?? "—"} · {dataBR(e.data)}</div>
                  </div>
                  <span className={`text-sm font-semibold ${receita ? "text-success" : "text-danger"}`}>
                    {receita ? "+" : "−"} {brl(e.valor)}
                  </span>
                  <form action={alternar}>
                    <button className={`badge ${e.status === "pago" ? "bg-success-soft text-success" : "bg-warning-soft text-warning"}`} title="Alternar situação">
                      {e.status}
                    </button>
                  </form>
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
