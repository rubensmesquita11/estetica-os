import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { criarTarefaRetorno } from "./actions";

const DIA = 24 * 60 * 60 * 1000;

type Grupo = "proximo" | "atrasado" | "inativo";

interface Item {
  patientId: string;
  nome: string;
  telefone: string | null;
  procedimento: string;
  diasDesde: number;
  diasAteRetorno: number | null;
  grupo: Grupo;
}

export default async function RecorrenciaPage() {
  const supabase = await createClient();

  // Atendimentos finalizados, do mais recente ao mais antigo.
  const { data: appts } = await supabase
    .from("appointments")
    .select("patient_id, inicio, patients(nome, telefone), procedures(nome, retorno_dias)")
    .eq("status", "finalizado")
    .order("inicio", { ascending: false });

  const hoje = Date.now();
  const vistos = new Set<string>();
  const itens: Item[] = [];

  for (const a of appts ?? []) {
    if (!a.patient_id || vistos.has(a.patient_id)) continue; // só o último de cada paciente
    vistos.add(a.patient_id);

    const pac = a.patients as { nome?: string; telefone?: string | null } | null;
    const proc = a.procedures as { nome?: string; retorno_dias?: number | null } | null;
    const diasDesde = Math.floor((hoje - new Date(a.inicio).getTime()) / DIA);

    let diasAteRetorno: number | null = null;
    if (proc?.retorno_dias) {
      const dataRetorno = new Date(a.inicio).getTime() + proc.retorno_dias * DIA;
      diasAteRetorno = Math.floor((dataRetorno - hoje) / DIA);
    }

    let grupo: Grupo | null = null;
    if (diasDesde > 90) grupo = "inativo";
    else if (diasAteRetorno !== null && diasAteRetorno < -3) grupo = "atrasado";
    else if (diasAteRetorno !== null && diasAteRetorno <= 15) grupo = "proximo";

    if (grupo) {
      itens.push({
        patientId: a.patient_id,
        nome: pac?.nome ?? "Paciente",
        telefone: pac?.telefone ?? null,
        procedimento: proc?.nome ?? "—",
        diasDesde,
        diasAteRetorno,
        grupo,
      });
    }
  }

  const grupos: { chave: Grupo; titulo: string; desc: string; cor: string }[] = [
    { chave: "proximo", titulo: "Retorno próximo", desc: "Na janela recomendada de retorno", cor: "bg-info-soft text-info" },
    { chave: "atrasado", titulo: "Retorno atrasado", desc: "Já passou do período recomendado", cor: "bg-warning-soft text-warning" },
    { chave: "inativo", titulo: "Pacientes inativos", desc: "Sem retornar há mais de 90 dias", cor: "bg-danger-soft text-danger" },
  ];

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-2xl font-semibold">Recorrência</h1>
      <p className="text-sm text-muted">
        Quem está na hora de voltar e quem precisa ser recuperado. Calculado a partir dos atendimentos e do retorno recomendado de cada procedimento.
      </p>

      {/* Resumo */}
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {grupos.map((g) => {
          const n = itens.filter((i) => i.grupo === g.chave).length;
          return (
            <div key={g.chave} className="card">
              <span className={`badge ${g.cor}`}>{g.titulo}</span>
              <div className="mt-2 text-2xl font-semibold">{n}</div>
              <p className="text-xs text-muted">{g.desc}</p>
            </div>
          );
        })}
      </div>

      {itens.length === 0 && (
        <div className="card mt-6 py-12 text-center">
          <div className="text-4xl">🔁</div>
          <p className="mt-3 font-medium">Nada para cobrar ainda.</p>
          <p className="mt-1 text-sm text-muted">
            Conforme você finaliza atendimentos com retorno recomendado, os pacientes aparecem aqui.
          </p>
        </div>
      )}

      {/* Listas por grupo */}
      {grupos.map((g) => {
        const lista = itens.filter((i) => i.grupo === g.chave);
        if (lista.length === 0) return null;
        return (
          <div key={g.chave} className="mt-8">
            <h2 className="mb-3 flex items-center gap-2 font-semibold">
              {g.titulo}
              <span className="text-sm font-normal text-muted">({lista.length})</span>
            </h2>
            <div className="card p-0">
              <ul className="divide-y divide-border">
                {lista.map((i) => {
                  const criar = criarTarefaRetorno.bind(null, i.patientId, i.nome);
                  return (
                    <li key={i.patientId} className="flex flex-wrap items-center gap-3 px-5 py-3.5">
                      <div className="min-w-0 flex-1">
                        <Link href={`/app/pacientes/${i.patientId}`} className="font-medium hover:underline">
                          {i.nome}
                        </Link>
                        <div className="text-xs text-muted">
                          {i.procedimento} · última visita há {i.diasDesde} dias
                          {i.grupo === "atrasado" && i.diasAteRetorno !== null
                            ? ` · atrasado ${Math.abs(i.diasAteRetorno)} dias`
                            : ""}
                          {i.grupo === "proximo" && i.diasAteRetorno !== null
                            ? ` · retorno em ${i.diasAteRetorno} dias`
                            : ""}
                        </div>
                      </div>
                      {i.telefone && <span className="hidden text-xs text-muted sm:inline">{i.telefone}</span>}
                      <form action={criar}>
                        <button className="btn-outline text-sm">+ Tarefa</button>
                      </form>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        );
      })}
    </div>
  );
}
