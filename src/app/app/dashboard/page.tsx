import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/auth";
import { STATUS_COLOR, STATUS_LABEL, type AppointmentStatus } from "@/lib/types";

function brl(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const profile = await getProfile();

  const agora = new Date();
  const inicioDia = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate());
  const fimDia = new Date(inicioDia.getTime() + 24 * 60 * 60 * 1000);
  const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1);

  // Consultas em paralelo (RLS garante que só vêm dados desta clínica).
  const [pacientesR, hojeR, mesR, pendentesR] = await Promise.all([
    supabase.from("patients").select("id", { count: "exact", head: true }),
    supabase
      .from("appointments")
      .select("id, inicio, status, valor, patients(nome), procedures(nome)")
      .gte("inicio", inicioDia.toISOString())
      .lt("inicio", fimDia.toISOString())
      .order("inicio", { ascending: true }),
    supabase
      .from("appointments")
      .select("valor")
      .eq("status", "finalizado")
      .gte("inicio", inicioMes.toISOString()),
    supabase
      .from("appointments")
      .select("id", { count: "exact", head: true })
      .eq("status", "aguardando")
      .gte("inicio", inicioDia.toISOString()),
  ]);

  const totalPacientes = pacientesR.count ?? 0;
  const hoje = hojeR.data ?? [];
  const receitaMes = (mesR.data ?? []).reduce((s, a) => s + (a.valor ?? 0), 0);
  const pendentes = pendentesR.count ?? 0;

  const primeiroNome = (profile?.nome ?? "").split(" ")[0];

  const cards = [
    { label: "Atendimentos hoje", valor: String(hoje.length), icon: "📅" },
    { label: "Faturamento do mês", valor: brl(receitaMes), icon: "💰" },
    { label: "Pacientes cadastrados", valor: String(totalPacientes), icon: "👤" },
    { label: "Aguardando confirmação", valor: String(pendentes), icon: "⏳" },
  ];

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">
            Olá{primeiroNome ? `, ${primeiroNome}` : ""} 👋
          </h1>
          <p className="text-sm text-muted">Aqui está o resumo da sua clínica hoje.</p>
        </div>
        <Link href="/app/agenda" className="btn-primary">+ Novo agendamento</Link>
      </div>

      {/* KPIs */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="card">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted">{c.label}</span>
              <span>{c.icon}</span>
            </div>
            <div className="mt-2 text-2xl font-semibold">{c.valor}</div>
          </div>
        ))}
      </div>

      {/* Agenda de hoje */}
      <div className="mt-6 card">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Agenda de hoje</h2>
          <Link href="/app/agenda" className="text-sm font-medium text-primary hover:underline">
            Ver agenda
          </Link>
        </div>

        {hoje.length === 0 ? (
          <div className="py-10 text-center">
            <div className="text-3xl">🗓️</div>
            <p className="mt-2 text-sm text-muted">Nenhum atendimento agendado para hoje.</p>
            <Link href="/app/agenda" className="btn-outline mt-4">Agendar agora</Link>
          </div>
        ) : (
          <ul className="mt-4 divide-y divide-border">
            {hoje.map((a) => {
              const paciente = (a.patients as { nome?: string } | null)?.nome ?? "Paciente";
              const proc = (a.procedures as { nome?: string } | null)?.nome ?? "—";
              const hora = new Date(a.inicio).toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
              });
              return (
                <li key={a.id} className="flex items-center gap-4 py-3">
                  <span className="w-14 text-sm font-medium tabular-nums">{hora}</span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{paciente}</div>
                    <div className="truncate text-xs text-muted">{proc}</div>
                  </div>
                  <span className={`badge ${STATUS_COLOR[a.status as AppointmentStatus]}`}>
                    {STATUS_LABEL[a.status as AppointmentStatus]}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
