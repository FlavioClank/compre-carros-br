# Deploy Externo - CompreCarrosBR

## Pré-requisitos

- Node.js 18+ instalado
- Supabase CLI instalado (`npm install -g supabase`)
- Conta Vercel (ou outro hosting)
- Projeto Supabase externo já configurado: `vpunpbozwidlzukplfts`

---

## Passo 1: Deploy das Edge Functions

1. Abra o terminal na pasta do projeto
2. Execute o arquivo `DEPLOY-COMMANDS-WINDOWS.cmd` (Windows) ou rode os comandos manualmente
3. Quando pedir, cole sua **Service Role Key** do Supabase

```bash
# Ou rode manualmente:
supabase login
supabase link --project-ref vpunpbozwidlzukplfts
supabase secrets set SUPABASE_URL=https://vpunpbozwidlzukplfts.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=SUA_KEY_AQUI

supabase functions deploy create-garage
supabase functions deploy reset-garage-password
supabase functions deploy update-garage-email
supabase functions deploy track-analytics
supabase functions deploy sitemap
```

---

## Passo 2: Deploy do Frontend na Vercel

1. Faça push do código para GitHub
2. Importe o projeto na Vercel
3. Configure as variáveis de ambiente (copie do `ENV-VERCEL.txt`):

```
VITE_SUPABASE_URL=https://vpunpbozwidlzukplfts.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=SUA_ANON_KEY_AQUI
VITE_SUPABASE_PROJECT_ID=vpunpbozwidlzukplfts
```

4. Build command: `npm run build`
5. Output directory: `dist`
6. Deploy!

---

## Passo 3: Configurar Domínio

1. Na Vercel, vá em Settings → Domains
2. Adicione `comprecarrosbr.com.br` e `www.comprecarrosbr.com.br`
3. Configure os DNS conforme instruções da Vercel

---

## Checklist de Validação

Após deploy, teste:

- [ ] **Login Admin**: `flaviofernandesv@gmail.com` consegue logar
- [ ] **Criar Garagem**: No painel admin, criar garagem sem erro de CORS
- [ ] **Login Garagem**: Garagem recém-criada consegue logar
- [ ] **Listar Carros**: Página `/carros` mostra veículos
- [ ] **Ver Detalhes**: Clicar em carro abre página de detalhes
- [ ] **RLS Funcionando**: Garagem só vê seus próprios carros

---

## Arquivos Incluídos

### Código Frontend
- `src/` - Código React completo
- `public/` - Assets públicos
- `index.html` - Entry point

### Supabase
- `supabase/functions/` - 5 Edge Functions
  - `create-garage/index.ts`
  - `reset-garage-password/index.ts`
  - `update-garage-email/index.ts`
  - `track-analytics/index.ts`
  - `sitemap/index.ts`
- `supabase/config.toml` - Configuração das functions

### Scripts SQL (já executados)
- `supabase/MIGRATION-FINAL-EXTERNAL.sql` - Schema completo
- `supabase/MIGRATION-CARS-DATA.sql` - Dados dos 7 veículos
- `supabase/VALIDATION-SCRIPT.sql` - Script de validação

### Deploy
- `DEPLOY-COMMANDS-WINDOWS.cmd` - Script Windows para CLI
- `ENV-VERCEL.txt` - Variáveis para Vercel
- `README-DEPLOY.md` - Este arquivo

---

## Comportamento do Sistema

| Ambiente | Supabase Usado |
|----------|----------------|
| `comprecarrosbr.com.br` | `vpunpbozwidlzukplfts` (externo) |
| `www.comprecarrosbr.com.br` | `vpunpbozwidlzukplfts` (externo) |
| Vercel Preview | `vpunpbozwidlzukplfts` (externo) |
| Localhost | Variáveis do `.env` local |

---

## Troubleshooting

### Erro de CORS ao criar garagem
- Verifique se as Edge Functions foram deployadas no Supabase externo
- Confirme que `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` estão setados

### Login de garagem não funciona
- Usuários devem existir no Supabase externo (`vpunpbozwidlzukplfts`)
- Execute a migração de usuários via Auth se necessário

### Imagens não aparecem
- Verifique se o Storage foi migrado (buckets: `car-photos`, `ad-images`, `banners`)
- URLs devem apontar para `vpunpbozwidlzukplfts.supabase.co`

---

## Suporte

Documentação Supabase: https://supabase.com/docs
Documentação Vercel: https://vercel.com/docs
