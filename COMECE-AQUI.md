# Estética OS — Comece aqui 🌸

Sistema operacional para clínicas de estética. Feito com **Next.js + Supabase**.

Este guia é para conectar o banco e ver o sistema funcionando. Leva ~10 minutos.

---

## Passo 1 — Criar o projeto no Supabase (grátis)

1. Acesse **supabase.com** e entre (pode usar o Google).
2. Clique em **New Project**.
3. Dê um nome (ex: `estetica-os`), crie uma **senha do banco** (guarde) e escolha a região **South America (São Paulo)**.
4. Espere ~2 min o projeto ficar pronto.

## Passo 2 — Criar as tabelas

1. No projeto, menu lateral → **SQL Editor** → **New query**.
2. Abra o arquivo `supabase/schema_fase1.sql` (nesta pasta), copie **tudo** e cole no editor.
3. Clique em **Run**. Deve aparecer: *"Schema Estética OS — Fase 1 criado com sucesso ✓"*.

## Passo 3 — Pegar as 3 chaves

No Supabase → **Settings** (engrenagem) → **API**. Copie:

| No Supabase | Cola no arquivo `.env.local` |
|---|---|
| **Project URL** | `NEXT_PUBLIC_SUPABASE_URL` |
| **anon public** | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| **service_role** (clique em "reveal") | `SUPABASE_SERVICE_ROLE_KEY` |

> A `service_role` é secreta — ela fica só no `.env.local` (que **nunca** vai para o GitHub).

## Passo 4 — Desligar a confirmação de e-mail (por enquanto)

Para testar rápido sem configurar envio de e-mail:
Supabase → **Authentication** → **Sign In / Providers** → **Email** → desative **"Confirm email"** → **Save**.
(Depois, em produção, a gente reativa com envio de e-mail configurado.)

## Passo 5 — Rodar o sistema

No terminal, dentro desta pasta:

```
npm run dev
```

Abra **http://localhost:3000**. Clique em **Criar conta** → preencha → você cai no **onboarding** (criar a clínica) → e entra no **painel**.

---

## O que já funciona (Fase 1 — Fundação)

- ✅ Login e cadastro reais (Supabase Auth)
- ✅ Cada clínica é isolada (multi-tenant com RLS — uma clínica nunca vê a outra)
- ✅ Onboarding (criação da clínica)
- ✅ **Pacientes** — cadastro, busca, perfil com histórico, edição, exclusão
- ✅ **Procedimentos** — catálogo com valor, duração e retorno recomendado
- ✅ **Agenda** — agendamento, navegação por dia, mudança de status
- ✅ **Dashboard** — faturamento do mês, atendimentos de hoje, agenda do dia
- ✅ **Equipe e permissões** — convidar membros, definir cargos (recepção não vê o que não deve)

## Próximas fases (na ordem)

2. Prontuário, fotos antes/depois, planos e sessões
3. Vendas: leads, pipeline Kanban, orçamentos
4. Recorrência: retorno automático, campanhas, indicações
5. Gestão: financeiro, estoque, metas, comissões
6. Inteligência: dashboard de oportunidades + assistente de IA
