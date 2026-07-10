import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { StatusSelect } from "@/components/status-select";
import type { AppointmentStatus } from "@/lib/types";

function ymd(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function brl(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default async function AgendaPage({
  searchParams,
}: {
  searchParams: Promise<{ data?: string }>;
}) {
  const sp = await searchParams;
  const hojeStr = ymd(new Date());
  const dataStr = sp.data ?? hojeStr;

  const dia = new Date(`${dataStr}T00:00:00`);
  const proxDia = new Date(dia.getTime() + 24 * 60 * 60 * 1000);
  const diaAnterior = new Date(dia.getTime() - 24 * 60 * 60 * 1000);

  const supabase = await createClient();
  const { data } = await supabase
    .from("appointments")
    .select("id, inicio, fim, status, valor, observacoes, patients(nome), procedures(nome), profiles(nome)")
    .gte("inicio", dia.toISOString())
    .lt("inicio", proxDia.toISOString())
    .order("inicio", { ascending: true });

  const appts = data ?? [];
  const receitaDia = appts
    .filter((a) => a.status === "finalizado")
    .reduce((s, a) => s + (a.valor ?? 0), 0);

  const tituloData = dia.toLocaleDateString("pt-BR", {
    weekday: "long", day: "2-digit", month: "long",
  });

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Agenda</h1>
        <Link href={`/app/agenda/novo?data=${dataStr}`} className="btn-primary">
          + Novo agendamento
        </Link>
      </div>

      {/* Navegação de dia */}
      <div className="mt-5 flex items-center justify-between rounded-xl border border-border bg-surface p-2">
        <Link href={`/app/agenda?data=${ymd(diaAnterior)}`} className="btn-ghost">← Anterior</Link>
        <div className="text-center">
          <div className="font-medium capitalize">{tituloData}</div>
          {dataStr !== hojeStr && (
            <Link href="/app/agenda" className="text-xs text-primary hover:underline">Voltar para hoje</Link>
          )}
        </div>
        <Link href={`/app/agenda?data=${ymd(proxDia)}`} className="btn-ghost">Próximo →</Link>
      </div>

      {/* Resumo do dia */}
      <div className="mt-4 flex gap-4 text-sm text-muted">
        <span>{appts.length} atendimento(s)</span>
        {receitaDia > 0 && <span>· {brl(receitaDia)} finalizado</span>}
      </div>

      {/* Lista */}
      {appts.length === 0 ? (
        <div className="card mt-4 py-14 text-center">
          <div className="text-4xl">🗓️</div>
          <p className="mt-3 font-medium">Nenhum atendimento neste dia.</p>
          <Link href={`/app/agenda/novo?data=${dataStr}`} className="btn-outline mt-5">
            Agendar
          </Link>
        </div>
      ) : (
        <div className="card mt-4 p-0">
          <ul className="divide-y divide-border">
            {appts.map((a) => {
              const paciente = (a.patients as { nome?: string } | null)?.nome ?? "Paciente";
              const proc = (a.procedures as { nome?: string } | null)?.nome ?? "—";
              const prof = (a.profiles as { nome?: string } | null)?.nome;
              const h = (iso: string) =>
                new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
              return (
                <li key={a.id} className="flex flex-wrap items-center gap-4 px-5 py-4">
                  <div className="w-24 text-sm font-medium tabular-nums">
                    {h(a.inicio)}
                    <div className="text-xs font-normal text-muted">até {h(a.fim)}</div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium">{paciente}</div>
                    <div className="truncate text-xs text-muted">
                      {proc}{prof ? ` · ${prof}` : ""}
                    </div>
                  </div>
                  {a.valor ? <span className="text-sm text-muted">{brl(a.valor)}</span> : null}
                  <StatusSelect id={a.id} status={a.status as AppointmentStatus} />
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
