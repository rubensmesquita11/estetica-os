import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/auth";
import { ClinicaForm } from "@/components/config/clinica-form";
import { ConvidarForm } from "@/components/config/convidar-form";
import { MembroRow } from "@/components/config/membro-row";
import type { Organization, Profile } from "@/lib/types";

export default async function ConfiguracoesPage() {
  const profile = await getProfile();

  // Guarda de permissão no servidor (além do menu já esconder).
  if (!profile || !["admin", "gestor"].includes(profile.cargo)) {
    return (
      <div className="mx-auto max-w-lg py-16 text-center">
        <div className="text-4xl">🔒</div>
        <h1 className="mt-3 text-xl font-semibold">Acesso restrito</h1>
        <p className="mt-1 text-sm text-muted">
          Apenas administradores e gestores acessam as configurações.
        </p>
      </div>
    );
  }

  const supabase = await createClient();
  const [{ data: org }, { data: membros }] = await Promise.all([
    supabase.from("organizations").select("*").eq("id", profile.organization_id).single(),
    supabase.from("profiles").select("*").eq("organization_id", profile.organization_id).order("nome"),
  ]);

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <h1 className="text-2xl font-semibold">Configurações</h1>

      {/* Dados da clínica */}
      <section className="card">
        <h2 className="font-semibold">Dados da clínica</h2>
        <p className="mb-4 text-sm text-muted">Informações básicas da sua clínica.</p>
        {org && <ClinicaForm org={org as Organization} />}
      </section>

      {/* Equipe */}
      <section className="card">
        <h2 className="font-semibold">Equipe</h2>
        <p className="mb-4 text-sm text-muted">
          Convide sua equipe e defina o que cada cargo pode acessar.
        </p>

        <div className="rounded-lg border border-border p-4">
          <h3 className="text-sm font-medium">Adicionar membro</h3>
          <div className="mt-3">
            <ConvidarForm />
          </div>
        </div>

        <ul className="mt-5 divide-y divide-border rounded-lg border border-border">
          {(membros ?? []).map((m) => (
            <MembroRow key={m.id} membro={m as Profile} souEu={m.id === profile.id} />
          ))}
        </ul>
      </section>
    </div>
  );
}
