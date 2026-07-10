import Link from "next/link";

const RECURSOS = [
  { icon: "📊", titulo: "Dashboard executivo", texto: "Faturamento, metas e oportunidades do dia num só olhar." },
  { icon: "📅", titulo: "Agenda inteligente", texto: "Confirmações, lista de espera e ocupação da clínica." },
  { icon: "👤", titulo: "CRM de pacientes", texto: "Histórico, timeline visual e risco de abandono." },
  { icon: "📋", titulo: "Prontuário estético", texto: "Anamnese, evolução e fotos antes/depois com segurança." },
  { icon: "💰", titulo: "Financeiro completo", texto: "Fluxo de caixa, DRE e receita por procedimento." },
  { icon: "🔁", titulo: "Motor de recorrência", texto: "Recupere pacientes inativos e aumente o retorno." },
];

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Cabeçalho */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-fg font-semibold">
            E
          </span>
          <span className="text-lg font-semibold tracking-tight">Estética OS</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="btn-ghost">Entrar</Link>
          <Link href="/cadastro" className="btn-primary">Criar conta</Link>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pb-16 pt-10 text-center">
        <span className="badge bg-primary-soft text-primary">Para biomédicas estetas e clínicas</span>
        <h1 className="mx-auto mt-5 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
          O sistema operacional completo da sua clínica de estética
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-muted">
          Pacientes, agenda, prontuário, vendas, financeiro e recorrência em um só lugar.
          Não é só organizar a clínica — é fazer ela crescer.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link href="/cadastro" className="btn-primary px-6 py-3 text-base">
            Começar agora
          </Link>
          <Link href="/login" className="btn-outline px-6 py-3 text-base">
            Já tenho conta
          </Link>
        </div>
      </section>

      {/* Recursos */}
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {RECURSOS.map((r) => (
            <div key={r.titulo} className="card">
              <div className="text-2xl">{r.icon}</div>
              <h3 className="mt-3 font-semibold">{r.titulo}</h3>
              <p className="mt-1 text-sm text-muted">{r.texto}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-border py-8 text-center text-sm text-muted">
        Estética OS · construído para profissionais da estética
      </footer>
    </div>
  );
}
