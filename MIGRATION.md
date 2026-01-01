# Guia de Migração para Supabase Próprio

Este documento descreve como migrar o projeto para seu próprio projeto Supabase.

## Pré-requisitos

1. Criar uma conta no [Supabase](https://supabase.com)
2. Criar um novo projeto Supabase
3. Anotar as credenciais do projeto:
   - **Project URL**: `https://[PROJECT_ID].supabase.co`
   - **Anon Key**: Chave pública (publishable)
   - **Service Role Key**: Chave privada (apenas para edge functions)

## Passo 1: Exportar Schema do Banco de Dados

No projeto atual (Lovable Cloud), exporte o schema usando a ferramenta de SQL:

```sql
-- Exportar estrutura das tabelas
-- Execute isso no SQL Editor do Supabase atual ou use pg_dump
```

## Passo 2: Exportar Dados

Use o Dashboard do Supabase para exportar dados de cada tabela:
- brands
- garages
- cars
- ads
- banners
- profiles
- user_roles
- sales_history
- action_logs

## Passo 3: Configurar Storage Buckets

No novo projeto Supabase, crie os buckets:

```sql
-- Criar buckets de storage
INSERT INTO storage.buckets (id, name, public) VALUES ('car-photos', 'car-photos', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('ad-images', 'ad-images', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('banners', 'banners', true);
```

## Passo 4: Migrar Arquivos de Storage

1. Baixe todos os arquivos dos buckets atuais
2. Faça upload para os novos buckets
3. Atualize as URLs nas tabelas `cars.photos`, `ads.image_url_*`, `banners.image_url`

## Passo 5: Atualizar Variáveis de Ambiente

Crie um arquivo `.env.local` (não commitado) com suas credenciais:

```env
VITE_SUPABASE_URL=https://[SEU_PROJECT_ID].supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=[SUA_ANON_KEY]
VITE_SUPABASE_PROJECT_ID=[SEU_PROJECT_ID]
```

## Passo 6: Configurar Edge Functions

Copie as edge functions de `supabase/functions/` para seu projeto:

```bash
# No diretório do seu projeto Supabase
supabase functions deploy create-garage
supabase functions deploy reset-garage-password
supabase functions deploy track-analytics
supabase functions deploy update-garage-email
```

Configure os secrets das edge functions:
```bash
supabase secrets set SUPABASE_URL=https://[SEU_PROJECT_ID].supabase.co
supabase secrets set SUPABASE_ANON_KEY=[SUA_ANON_KEY]
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=[SUA_SERVICE_ROLE_KEY]
```

## Passo 7: Habilitar Image Transformation (Opcional - Plano Pro)

Quando fizer upgrade para o plano Pro ($25/mês):

1. No Dashboard Supabase: **Settings → Project Settings → Add-ons**
2. Ative **Image Transformation**
3. No código, edite `src/components/ui/optimized-image.tsx`:
   - Descomente a seção de transformação de imagem
   - Defina `IMAGE_TRANSFORMATION_ENABLED = true`

### Benefícios do Image Transformation:
- Conversão automática para WebP
- Redimensionamento on-the-fly
- Compressão com qualidade configurável
- CDN integrado

## Passo 8: Configurar RLS Policies

Execute as migrations em `supabase/migrations/` no novo projeto para criar todas as políticas de segurança.

## Passo 9: Configurar Autenticação

1. No Dashboard: **Authentication → Settings**
2. Configure:
   - Email templates
   - Redirect URLs
   - Rate limits

## Checklist Final

- [ ] Banco de dados migrado com todas as tabelas
- [ ] RLS policies configuradas
- [ ] Storage buckets criados
- [ ] Arquivos migrados para novos buckets
- [ ] Edge functions deployadas
- [ ] Secrets configurados
- [ ] Variáveis de ambiente atualizadas
- [ ] Autenticação configurada
- [ ] Teste de login funcionando
- [ ] Teste de listagem de veículos funcionando
- [ ] Teste de upload de imagens funcionando

## Rollback

Se precisar reverter, basta restaurar as variáveis de ambiente originais do Lovable Cloud.

## Suporte

Para problemas de migração, consulte:
- [Documentação Supabase](https://supabase.com/docs)
- [Guia de Migração Supabase](https://supabase.com/docs/guides/platform/migrating-and-upgrading-projects)
