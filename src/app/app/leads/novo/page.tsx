import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { LeadForm } from "@/components/lead-form";

export default async function NovoLeadPage() {
  const supabase = await createClient();
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, nome")
    .eq("ativo", true)
    .order("nome");

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/app/leads" className="text-sm text-muted hover:underline">← Voltar para o funil</Link>
      <h1 className="mt-2 text-2xl font-semibold">Novo lead</h1>
      <div className="card mt-5">
        <LeadForm responsaveis={profiles ?? []} />
      </div>
    </div>
  );
}
