# Publicar a Estética OS online (Vercel)

O código já está pronto e o build de produção passa. Faltam 3 etapas — todas
com a SUA conta (login), por isso preciso que você faça os cliques.

## Etapa 1 — Subir o código para o GitHub (via GitHub Desktop)

1. Abra o **GitHub Desktop**.
2. Menu **File → Add local repository**.
3. Selecione a pasta `C:\Users\User\Desktop\estetica-os` → **Add repository**.
4. No topo, clique em **Publish repository**.
5. Marque **Keep this code private** (recomendado) → **Publish repository**.

Pronto: seu código está no GitHub.

## Etapa 2 — Importar na Vercel

1. Acesse **vercel.com** e entre com o **GitHub** (botão "Continue with GitHub").
2. Clique em **Add New… → Project**.
3. Encontre o repositório **estetica-os** → **Import**.
4. **NÃO clique em Deploy ainda** — primeiro abra **Environment Variables**.

## Etapa 3 — Variáveis de ambiente (as 3 chaves)

Em **Environment Variables**, adicione as 3 (copie os valores do seu arquivo
`.env.local`):

| Name | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | (o Project URL do Supabase) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | (a chave `sb_publishable_...`) |
| `SUPABASE_SERVICE_ROLE_KEY` | (a chave `sb_secret_...`) |

Depois clique em **Deploy**. Em ~2 minutos a Vercel te dá um endereço tipo
`https://estetica-os.vercel.app` — é o seu sistema no ar.

## Depois de publicar

- No **Supabase → Authentication → URL Configuration**, adicione o endereço da
  Vercel em **Site URL** e **Redirect URLs** (para o login funcionar online).
- Cada vez que a gente atualizar o código e você der **Push** no GitHub Desktop,
  a Vercel republica sozinha em ~2 min.
