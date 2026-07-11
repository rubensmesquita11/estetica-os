-- ═══════════════════════════════════════════════════════════════
-- ESTÉTICA OS — Schema Fase 5 (Gestão)
-- Financeiro, estoque/insumos, metas e comissões.
-- Cole no Supabase → SQL Editor → New Query → Run (depois das Fases 1-4).
-- ═══════════════════════════════════════════════════════════════

-- ─── FINANCEIRO (lançamentos: receitas e despesas) ─────────────
create table if not exists financial_entries (
  id              uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
  tipo            text not null check (tipo in ('receita','despesa')),
  categoria       text,
  descricao       text,
  valor           numeric(10,2) not null default 0,
  data            date not null default current_date,
  status          text default 'pago' check (status in ('pago','pendente')),
  forma_pagamento text,
  patient_id      uuid references patients(id) on delete set null,
  created_by      uuid references profiles(id) on delete set null,
  created_at      timestamptz default now()
);

-- ─── ESTOQUE (itens/insumos) ───────────────────────────────────
create table if not exists inventory_items (
  id              uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
  nome            text not null,
  categoria       text,
  unidade         text default 'un',
  quantidade      numeric(10,2) default 0,
  estoque_minimo  numeric(10,2) default 0,
  custo           numeric(10,2) default 0,
  validade        date,
  fornecedor      text,
  lote            text,
  created_at      timestamptz default now()
);

-- ─── MOVIMENTAÇÕES DE ESTOQUE ──────────────────────────────────
create table if not exists inventory_movements (
  id              uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
  item_id         uuid not null references inventory_items(id) on delete cascade,
  tipo            text not null check (tipo in ('entrada','saida')),
  quantidade      numeric(10,2) not null,
  motivo          text,
  created_by      uuid references profiles(id) on delete set null,
  created_at      timestamptz default now()
);

-- ─── METAS ─────────────────────────────────────────────────────
create table if not exists goals (
  id              uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
  escopo          text not null default 'clinica' check (escopo in ('clinica','profissional')),
  profissional_id uuid references profiles(id) on delete cascade,
  ano             integer not null,
  mes             integer not null check (mes between 1 and 12),
  valor_meta      numeric(10,2) not null default 0,
  created_at      timestamptz default now()
);

-- ─── REGRAS DE COMISSÃO ────────────────────────────────────────
create table if not exists commission_rules (
  id              uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
  profissional_id uuid references profiles(id) on delete cascade,  -- null = regra geral
  percentual      numeric(5,2) not null default 0,
  created_at      timestamptz default now()
);

-- ─── ÍNDICES ───────────────────────────────────────────────────
create index if not exists idx_fin_org on financial_entries(organization_id);
create index if not exists idx_fin_data on financial_entries(data);
create index if not exists idx_inv_org on inventory_items(organization_id);
create index if not exists idx_invmov_item on inventory_movements(item_id);
create index if not exists idx_goals_org on goals(organization_id);
create index if not exists idx_comm_org on commission_rules(organization_id);

-- ─── RLS ───────────────────────────────────────────────────────
alter table financial_entries   enable row level security;
alter table inventory_items      enable row level security;
alter table inventory_movements  enable row level security;
alter table goals                enable row level security;
alter table commission_rules     enable row level security;

create policy fin_all     on financial_entries   for all using (organization_id = auth_org_id());
create policy inv_all     on inventory_items      for all using (organization_id = auth_org_id());
create policy invmov_all  on inventory_movements  for all using (organization_id = auth_org_id());
create policy goals_all   on goals                for all using (organization_id = auth_org_id());
create policy comm_all    on commission_rules     for all using (organization_id = auth_org_id());

select 'Schema Estética OS — Fase 5 criado com sucesso ✓' as resultado;
