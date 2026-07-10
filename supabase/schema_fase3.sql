-- ═══════════════════════════════════════════════════════════════
-- ESTÉTICA OS — Schema Fase 3 (Vendas)
-- Leads, funil comercial (pipeline), orçamentos/propostas.
-- Cole no Supabase → SQL Editor → New Query → Run (DEPOIS das Fases 1 e 2).
-- ═══════════════════════════════════════════════════════════════

-- ─── LEADS (funil comercial) ───────────────────────────────────
create table if not exists leads (
  id                    uuid primary key default uuid_generate_v4(),
  organization_id       uuid not null references organizations(id) on delete cascade,
  nome                  text not null,
  telefone              text,
  email                 text,
  instagram             text,
  procedimento_interesse text,
  origem                text,
  valor_potencial       numeric(10,2) default 0,
  responsavel_id        uuid references profiles(id) on delete set null,
  temperatura           text default 'morno' check (temperatura in ('frio','morno','quente')),
  status                text default 'novo'
                        check (status in ('novo','contato','avaliacao_agendada','avaliacao_realizada','proposta','negociacao','fechado','perdido')),
  patient_id            uuid references patients(id) on delete set null,  -- preenchido ao converter
  observacoes           text,
  ultimo_contato        timestamptz,
  created_at            timestamptz default now(),
  updated_at            timestamptz default now()
);

-- ─── PROPOSTAS / ORÇAMENTOS ────────────────────────────────────
create table if not exists proposals (
  id                 uuid primary key default uuid_generate_v4(),
  organization_id    uuid not null references organizations(id) on delete cascade,
  lead_id            uuid references leads(id) on delete set null,
  patient_id         uuid references patients(id) on delete set null,
  titulo             text not null,
  desconto           numeric(10,2) default 0,
  condicao_pagamento text,
  validade           date,
  status             text default 'rascunho'
                     check (status in ('rascunho','enviado','visualizado','negociacao','aprovado','recusado','expirado')),
  observacoes        text,
  created_by         uuid references profiles(id) on delete set null,
  created_at         timestamptz default now()
);

-- ─── ITENS DA PROPOSTA ─────────────────────────────────────────
create table if not exists proposal_items (
  id              uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
  proposal_id     uuid not null references proposals(id) on delete cascade,
  procedure_id    uuid references procedures(id) on delete set null,
  descricao       text not null,
  quantidade      integer default 1,
  valor_unitario  numeric(10,2) default 0
);

-- ─── ÍNDICES ───────────────────────────────────────────────────
create index if not exists idx_leads_org on leads(organization_id);
create index if not exists idx_leads_status on leads(status);
create index if not exists idx_leads_resp on leads(responsavel_id);
create index if not exists idx_prop_org on proposals(organization_id);
create index if not exists idx_prop_lead on proposals(lead_id);
create index if not exists idx_propitem_prop on proposal_items(proposal_id);

-- ─── RLS ───────────────────────────────────────────────────────
alter table leads          enable row level security;
alter table proposals      enable row level security;
alter table proposal_items enable row level security;

create policy leads_all     on leads          for all using (organization_id = auth_org_id());
create policy prop_all      on proposals      for all using (organization_id = auth_org_id());
create policy propitem_all  on proposal_items for all using (organization_id = auth_org_id());

select 'Schema Estética OS — Fase 3 criado com sucesso ✓' as resultado;
