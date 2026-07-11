-- ═══════════════════════════════════════════════════════════════
-- ESTÉTICA OS — Schema Fase 4 (Recorrência · parte 2)
-- Campanhas de reativação + Programa de indicação.
-- Cole no Supabase → SQL Editor → New Query → Run (depois das Fases 1-3).
-- ═══════════════════════════════════════════════════════════════

-- ─── CAMPANHAS DE REATIVAÇÃO ───────────────────────────────────
create table if not exists campaigns (
  id              uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
  nome            text not null,
  segmento        text not null default 'inativos'
                  check (segmento in ('inativos','aniversariantes_mes','pacote_incompleto','todos')),
  canal           text default 'whatsapp',
  mensagem        text,
  status          text default 'rascunho' check (status in ('rascunho','ativa','encerrada')),
  created_by      uuid references profiles(id) on delete set null,
  created_at      timestamptz default now()
);

-- ─── PROGRAMA DE INDICAÇÃO ─────────────────────────────────────
create table if not exists referrals (
  id              uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
  indicador_id    uuid references patients(id) on delete set null,  -- quem indicou
  indicado_id     uuid references patients(id) on delete set null,  -- vira paciente ao converter
  indicado_nome   text,
  status          text default 'pendente' check (status in ('pendente','convertido')),
  beneficio       text,
  created_at      timestamptz default now()
);

-- ─── ÍNDICES ───────────────────────────────────────────────────
create index if not exists idx_camp_org on campaigns(organization_id);
create index if not exists idx_ref_org on referrals(organization_id);
create index if not exists idx_ref_indicador on referrals(indicador_id);

-- ─── RLS ───────────────────────────────────────────────────────
alter table campaigns enable row level security;
alter table referrals enable row level security;

create policy camp_all on campaigns for all using (organization_id = auth_org_id());
create policy ref_all  on referrals for all using (organization_id = auth_org_id());

select 'Schema Estética OS — Fase 4 criado com sucesso ✓' as resultado;
