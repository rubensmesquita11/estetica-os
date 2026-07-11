import { createClient } from "@/lib/supabase/server";
import { ItemForm } from "@/components/item-form";
import { EstoqueMovimento } from "@/components/estoque-movimento";
import { excluirItem } from "./actions";

const DIA = 24 * 60 * 60 * 1000;

function alertas(item: { quantidade: number; estoque_minimo: number; validade: string | null }) {
  const out: { texto: string; cor: string }[] = [];
  if (item.estoque_minimo > 0 && item.quantidade <= item.estoque_minimo)
    out.push({ texto: "Estoque baixo", cor: "bg-warning-soft text-warning" });
  if (item.validade) {
    const dias = Math.floor((new Date(item.validade + "T00:00:00").getTime() - Date.now()) / DIA);
    if (dias < 0) out.push({ texto: "Vencido", cor: "bg-danger-soft text-danger" });
    else if (dias <= 30) out.push({ texto: `Vence em ${dias}d`, cor: "bg-danger-soft text-danger" });
  }
  return out;
}

export default async function EstoquePage() {
  const supabase = await createClient();
  const { data } = await supabase.from("inventory_items").select("*").order("nome");
  const items = data ?? [];
  const comAlerta = items.filter((i) => alertas(i).length > 0).length;

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-2xl font-semibold">Estoque e insumos</h1>
      <p className="text-sm text-muted">
        {items.length} item(ns){comAlerta > 0 ? ` · ${comAlerta} com alerta` : ""}.
      </p>

      {/* Lista */}
      {items.length === 0 ? (
        <div className="card mt-6 py-10 text-center">
          <div className="text-3xl">📦</div>
          <p className="mt-2 text-sm text-muted">Nenhum item cadastrado. Adicione abaixo.</p>
        </div>
      ) : (
        <div className="card mt-6 p-0">
          <ul className="divide-y divide-border">
            {items.map((i) => {
              const als = alertas(i);
              const apagar = excluirItem.bind(null, i.id);
              const baixo = i.estoque_minimo > 0 && i.quantidade <= i.estoque_minimo;
              return (
                <li key={i.id} className="flex flex-wrap items-center gap-3 px-5 py-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium">{i.nome}</span>
                      {als.map((a) => <span key={a.texto} className={`badge ${a.cor}`}>{a.texto}</span>)}
                    </div>
                    <div className="text-xs text-muted">
                      {i.categoria ? i.categoria + " · " : ""}
                      {i.fornecedor ? i.fornecedor + " · " : ""}
                      {i.lote ? "lote " + i.lote : ""}
                    </div>
                  </div>
                  <div className={`text-sm font-semibold ${baixo ? "text-warning" : ""}`}>
                    {i.quantidade} {i.unidade}
                  </div>
                  <EstoqueMovimento itemId={i.id} />
                  <form action={apagar}>
                    <button className="text-muted hover:text-danger" title="Excluir">✕</button>
                  </form>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Novo item */}
      <div className="mt-6 card">
        <h2 className="mb-4 font-semibold">Novo item</h2>
        <ItemForm />
      </div>
    </div>
  );
}
