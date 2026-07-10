import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Patient } from "@/lib/types";

export default async function PacientesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("patients")
    .select("id, nome, telefone, cidade, origem, created_at")
    .order("nome", { ascending: true });

  if (q) query = query.ilike("nome", `%${q}%`);

  const { data } = await query;
  const pacientes = (data ?? []) as Patient[];

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Pacientes</h1>
          <p className="text-sm text-muted">{pacientes.length} paciente(s) na sua clínica.</p>
        </div>
        <Link href="/app/pacientes/novo" className="btn-primary">+ Novo paciente</Link>
      </div>

      {/* Busca */}
      <form className="mt-5" action="/app/pacientes">
        <input
          name="q"
          defaultValue={q ?? ""}
          className="input max-w-sm"
          placeholder="Buscar por nome…"
        />
      </form>

      {/* Lista / vazio */}
      {pacientes.length === 0 ? (
        <div className="card mt-5 py-14 text-center">
          <div className="text-4xl">👤</div>
          <p className="mt-3 font-medium">
            {q ? "Nenhum paciente encontrado." : "Você ainda não tem pacientes."}
          </p>
          <p className="mt-1 text-sm text-muted">
            {q ? "Tente outro nome." : "Cadastre o primeiro para começar."}
          </p>
          {!q && (
            <Link href="/app/pacientes/novo" className="btn-outline mt-5">
              Cadastrar primeiro paciente
            </Link>
          )}
        </div>
      ) : (
        <div className="card mt-5 overflow-hidden p-0">
          <ul className="divide-y divide-border">
            {pacientes.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/app/pacientes/${p.id}`}
                  className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-surface-2"
                >
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary-soft text-sm font-semibold text-primary">
                    {p.nome.slice(0, 2).toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium">{p.nome}</div>
                    <div className="truncate text-xs text-muted">
                      {[p.telefone, p.cidade].filter(Boolean).join(" · ") || "Sem contato"}
                    </div>
                  </div>
                  {p.origem && (
                    <span className="badge hidden bg-surface-2 text-muted sm:inline-flex">
                      {p.origem}
                    </span>
                  )}
                  <span className="text-muted">›</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
