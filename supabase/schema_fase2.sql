-- ═══════════════════════════════════════════════════════════════
-- ESTÉTICA OS — Schema Fase 2 (Operação)
-- Prontuário, evolução clínica, planos de tratamento, sessões, tarefas.
-- Cole no Supabase → SQL Editor → New Query → Run (DEPOIS da Fase 1).
-- Mesma regra de ouro: toda tabela tem organization_id + RLS.
-- ═══════════════════════════════════════════════════════════════

-- ─── PRONTUÁRIO / ANAMNESE (1 por paciente) ────────────────────
create table if not exists medical_records (
  id                  uuid primary key default uuid_generate_v4(),
  organization_id     uuid not null references organizations(id) on delete cascade,
  patient_id          uuid not null unique references patients(id) on delete cascade,
  queixa_principal    text,
  historico_saude     text,
  alergias            text,
  medicamentos        text,
  contraindicacoes    text,
  gestante            boolean default false,
  observacoes_clinicas text,
  updated_by          uuid references profiles(id),
  updated_at          timestamptz default now(),
  created_at          timestamptz default now()
);

-- ─── EVOLUÇÃO CLÍNICA (timeline de anotações) ──────────────────
create table if not exists evolutions (
  id              uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
  patient_id      uuid not null references patients(id) on delete cascade,
  appointment_id  uuid references appointments(id) on delete set null,
  profissional_id uuid references profiles(id) on delete set null,
  texto           text not null,
  created_at      timestamptz default now()
);

-- ─── PLANOS / PACOTES DE TRATAMENTO ────────────────────────────
create table if not exists treatment_plans (
  id              uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
  patient_id      uuid not null references patients(id) on delete cascade,
  nome            text not null,
  procedure_id    uuid references procedures(id) on delete set null,
  total_sessoes   integer not null default 1,
  valor_total     numeric(10,2) default 0,
  validade        date,
  status          text default 'ativo' check (status in ('ativo','concluido','cancelado')),
  observacoes     text,
  created_at      timestamptz default now()
);

-- ─── SESSÕES DO PLANO ──────────────────────────────────────────
create table if not exists treatment_sessions (
  id              uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
  plan_id         uuid not null references treatment_plans(id) on delete cascade,
  numero          integer not null,
  realizada       boolean default false,
  data_realizada  timestamptz,
  appointment_id  uuid references appointments(id) on delete set null,
  observacoes     text,
  created_at      timestamptz default now()
);

-- ─── CENTRAL DE TAREFAS ────────────────────────────────────────
create table if not exists tasks (
  id              uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
  titulo          text not null,
  descricao       text,
  responsavel_id  uuid references profiles(id) on delete set null,
  patient_id      uuid references patients(id) on delete set null,
  prioridade      text default 'media' check (prioridade in ('baixa','media','alta')),
  prazo           date,
  status          text default 'aberta' check (status in ('aberta','concluida','cancelada')),
  origem          text default 'manual',
  created_by      uuid references profiles(id) on delete set null,
  created_at      timestamptz default now()
);

-- ─── ÍNDICES ───────────────────────────────────────────────────
create index if not exists idx_mrec_org on medical_records(organization_id);
create index if not exists idx_evol_patient on evolutions(patient_id);
create index if not exists idx_evol_org on evolutions(organization_id);
create index if not exists idx_plans_patient on treatment_plans(patient_id);
create index if not exists idx_plans_org on treatment_plans(organization_id);
create index if not exists idx_sess_plan on treatment_sessions(plan_id);
create index if not exists idx_tasks_org on tasks(organization_id);
create index if not exists idx_tasks_status on tasks(status);
create index if not exists idx_tasks_resp on tasks(responsavel_id);

-- ─── RLS (mesma proteção multi-clínica da Fase 1) ──────────────
alter table medical_records    enable row level security;
alter table evolutions         enable row level security;
alter table treatment_plans    enable row level security;
alter table treatment_sessions enable row level security;
alter table tasks              enable row level security;

create policy mrec_all  on medical_records    for all using (organization_id = auth_org_id());
create policy evol_all  on evolutions         for all using (organization_id = auth_org_id());
create policy plan_all  on treatment_plans    for all using (organization_id = auth_org_id());
create policy sess_all  on treatment_sessions for all using (organization_id = auth_org_id());
create policy task_all  on tasks              for all using (organization_id = auth_org_id());

select 'Schema Estética OS — Fase 2 criado com sucesso ✓' as resultado;
