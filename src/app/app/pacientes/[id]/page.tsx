import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ConfirmDelete } from "@/components/confirm-delete";
import { excluirPaciente } from "../actions";
import { STATUS_COLOR, STATUS_LABEL, type AppointmentStatus, type Patient } from "@/lib/types";

function brl(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
function dataBR(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export default async function PacientePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: paciente } = await supabase
    .from("patients")
    .select("*")
    .eq("id", id)
    .single();

  if (!paciente) notFound();
  const p = paciente as Patient;

  const { data: apptData } = await supabase
    .from("appointments")
    .select("id, inicio, status, valor, procedures(nome)")
    .eq("patient_id", id)
    .order("inicio", { ascending: false });

  const appts = apptData ?? [];
  const finalizados = appts.filter((a) => a.status === "finalizado");
  const totalGasto = finalizados.reduce((s, a) => s + (a.valor ?? 0), 0);
  const ultimaVisita = finalizados[0]?.inicio;
  const proxima = [...appts]
    .reverse()
    .find((a) => new Date(a.inicio) > new Date() && a.status !== "cancelado");

  const excluir = excluirPaciente.bind(null, id);

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/app/pacientes" className="text-sm text-muted hover:underline">
        ← Voltar para pacientes
      </Link>

      {/* Cabeçalho */}
      <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="grid h-14 w-14 place-items-center rounded-full bg-primary-soft text-lg font-semibold text-primary">
            {p.nome.slice(0, 2).toUpperCase()}
          </span>
          <div>
            <h1 className="text-2xl font-semibold">{p.nome}</h1>
            <p className="text-sm text-muted">
              {[p.telefone, p.cidade, p.origem].filter(Boolean).join(" · ") || "Sem dados de contato"}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link href={`/app/pacientes/${id}/prontuario`} className="btn-outline">Prontuário</Link>
          <Link href={`/app/pacientes/${id}/planos`} className="btn-outline">Planos</Link>
          <Link href={`/app/pacientes/${id}/editar`} className="btn-ghost">Editar</Link>
        </div>
      </div>

      {/* Stats rápidos */}
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="card">
          <div className="text-sm text-muted">Total gasto</div>
          <div className="mt-1 text-xl font-semibold">{brl(totalGasto)}</div>
        </div>
        <div className="card">
          <div className="text-sm text-muted">Última visita</div>
          <div className="mt-1 text-xl font-semibold">{ultimaVisita ? dataBR(ultimaVisita) : "—"}</div>
        </div>
        <div className="card">
          <div className="text-sm text-muted">Próxima consulta</div>
          <div className="mt-1 text-xl font-semibold">{proxima ? dataBR(proxima.inicio) : "—"}</div>
        </div>
      </div>

      {/* Dados */}
      <div className="mt-6 card">
        <h2 className="font-semibold">Dados do paciente</h2>
        <dl className="mt-4 grid gap-x-8 gap-y-3 sm:grid-cols-2">
          <Campo label="E-mail" valor={p.email} />
          <Campo label="Nascimento" valor={p.nascimento ? dataBR(p.nascimento) : null} />
          <Campo label="Profissão" valor={p.profissao} />
          <Campo label="Instagram" valor={p.instagram} />
          <Campo label="Cidade" valor={p.cidade} />
          <Campo label="Origem" valor={p.origem} />
        </dl>
        {p.observacoes && (
          <div className="mt-4 rounded-lg bg-surface-2 p-3 text-sm">{p.observacoes}</div>
        )}
      </div>

      {/* Timeline */}
      <div className="mt-6 card">
        <h2 className="font-semibold">Histórico</h2>
        {appts.length === 0 ? (
          <p className="mt-4 py-6 text-center text-sm text-muted">
            Nenhum atendimento registrado ainda.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {appts.map((a) => {
              const proc = (a.procedures as { nome?: string } | null)?.nome ?? "Atendimento";
              return (
                <li key={a.id} className="flex items-center gap-3 border-l-2 border-primary-soft pl-4">
                  <div className="flex-1">
                    <div className="text-sm font-medium">{proc}</div>
                    <div className="text-xs text-muted">{dataBR(a.inicio)}</div>
                  </div>
                  {a.valor ? <span className="text-sm text-muted">{brl(a.valor)}</span> : null}
                  <span className={`badge ${STATUS_COLOR[a.status as AppointmentStatus]}`}>
                    {STATUS_LABEL[a.status as AppointmentStatus]}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Zona de perigo */}
      <div className="mt-6 flex justify-end">
        <ConfirmDelete
          action={excluir}
          label="Excluir paciente"
          pergunta="Excluir este paciente e seu histórico?"
        />
      </div>
    </div>
  );
}

function Campo({ label, valor }: { label: string; valor: string | null | undefined }) {
  return (
    <div>
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="text-sm">{valor || "—"}</dd>
    </div>
  );
}
