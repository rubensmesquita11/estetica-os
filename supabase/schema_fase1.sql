-- ═══════════════════════════════════════════════════════════════
-- ESTÉTICA OS — Schema Fase 1 (Fundação · multi-tenant)
-- Cole no Supabase → SQL Editor → New Query → Run
-- Regra de ouro: TODA tabela de negócio tem organization_id + RLS.
-- ═══════════════════════════════════════════════════════════════

create extension if not exists "uuid-ossp";

-- ─── ORGANIZAÇÕES (cada clínica = 1 tenant) ────────────────────
create table if not exists organizations (
  id           uuid primary key default uuid_generate_v4(),
  nome         text not null,
  cnpj         text,
  telefone     text,
  cidade       text,
  plano        text default 'trial' check (plano in ('trial','basico','pro','enterprise')),
  onboarding_completo boolean default false,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

-- ─── UNIDADES / SALAS ──────────────────────────────────────────
create table if not exists units (
  id              uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
  nome            text not null,
  tipo            text default 'sala' check (tipo in ('unidade','sala','equipamento')),
  created_at      timestamptz default now()
);

-- ─── PERFIS (usuários, ligados ao Supabase Auth) ───────────────
-- id = auth.users.id. Cargo define permissões.
create table if not exists profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  organization_id uuid references organizations(id) on delete cascade,
  nome            text,
  email           text,
  telefone        text,
  cargo           text default 'profissional'
                  check (cargo in ('admin','gestor','recepcao','comercial','profissional','financeiro')),
  is_profissional boolean default false,   -- aparece na agenda como quem atende
  ativo           boolean default true,
  created_at      timestamptz default now()
);

-- ─── PACIENTES ─────────────────────────────────────────────────
create table if not exists patients (
  id              uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
  nome            text not null,
  telefone        text,
  email           text,
  nascimento      date,
  profissao       text,
  cidade          text,
  instagram       text,
  origem          text,               -- instagram, indicacao, google, etc.
  indicado_por    uuid references patients(id),
  observacoes     text,
  primeiro_contato timestamptz default now(),
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- ─── PROCEDIMENTOS (catálogo) ──────────────────────────────────
create table if not exists procedures (
  id              uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
  nome            text not null,
  categoria       text,
  duracao_min     integer default 60,
  valor           numeric(10,2) default 0,
  retorno_dias    integer,            -- período recomendado de retorno (motor de recorrência, fase 4)
  ativo           boolean default true,
  created_at      timestamptz default now()
);

-- ─── AGENDAMENTOS ──────────────────────────────────────────────
create table if not exists appointments (
  id              uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
  patient_id      uuid references patients(id) on delete set null,
  procedure_id    uuid references procedures(id) on delete set null,
  profissional_id uuid references profiles(id) on delete set null,
  unit_id         uuid references units(id) on delete set null,
  inicio          timestamptz not null,
  fim             timestamptz not null,
  valor           numeric(10,2),
  forma_pagamento text,
  status          text default 'aguardando'
                  check (status in ('aguardando','confirmado','chegou','em_atendimento','finalizado','faltou','cancelado','reagendado')),
  observacoes     text,
  origem          text,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- ─── LOG DE AUDITORIA ──────────────────────────────────────────
create table if not exists audit_logs (
  id              uuid primary key default uuid_generate_v4(),
  organization_id uuid references organizations(id) on delete cascade,
  user_id         uuid references profiles(id),
  acao            text not null,
  tabela          text,
  registro_id     uuid,
  detalhe         jsonb default '{}',
  created_at      timestamptz default now()
);

-- ─── ÍNDICES ───────────────────────────────────────────────────
create index if not exists idx_units_org on units(organization_id);
create index if not exists idx_profiles_org on profiles(organization_id);
create index if not exists idx_patients_org on patients(organization_id);
create index if not exists idx_procedures_org on procedures(organization_id);
create index if not exists idx_appts_org on appointments(organization_id);
create index if not exists idx_appts_inicio on appointments(inicio);
create index if not exists idx_appts_patient on appointments(patient_id);
create index if not exists idx_audit_org on audit_logs(organization_id);

-- ═══════════════════════════════════════════════════════════════
-- RLS — o coração da segurança multi-tenant.
-- Cada usuário só enxerga linhas da SUA organização.
-- ═══════════════════════════════════════════════════════════════

-- Função auxiliar: a organização do usuário logado.
create or replace function auth_org_id()
returns uuid language sql stable security definer set search_path = public as $$
  select organization_id from profiles where id = auth.uid()
$$;

-- Função auxiliar: o cargo do usuário logado.
create or replace function auth_cargo()
returns text language sql stable security definer set search_path = public as $$
  select cargo from profiles where id = auth.uid()
$$;

alter table organizations enable row level security;
alter table units          enable row level security;
alter table profiles       enable row level security;
alter table patients       enable row level security;
alter table procedures     enable row level security;
alter table appointments   enable row level security;
alter table audit_logs     enable row level security;

-- organizations: vê/edita só a própria.
create policy org_select on organizations for select using (id = auth_org_id());
create policy org_update on organizations for update using (id = auth_org_id() and auth_cargo() in ('admin','gestor'));

-- profiles: vê colegas da mesma org; só admin/gestor gerencia.
create policy prof_select on profiles for select using (organization_id = auth_org_id());
create policy prof_update on profiles for update using (organization_id = auth_org_id() and auth_cargo() in ('admin','gestor'));
create policy prof_self   on profiles for update using (id = auth.uid());

-- Tabelas de negócio: acesso restrito à própria organização.
create policy units_all      on units        for all using (organization_id = auth_org_id());
create policy patients_all   on patients      for all using (organization_id = auth_org_id());
create policy procedures_all on procedures    for all using (organization_id = auth_org_id());
create policy appts_all      on appointments  for all using (organization_id = auth_org_id());
create policy audit_select   on audit_logs    for select using (organization_id = auth_org_id());
create policy audit_insert   on audit_logs    for insert with check (organization_id = auth_org_id());

select 'Schema Estética OS — Fase 1 criado com sucesso ✓' as resultado;
