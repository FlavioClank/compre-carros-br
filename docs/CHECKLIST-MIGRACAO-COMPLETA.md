# Checklist Completo de Migração

## Projeto Origem (Lovable Cloud)
- **ID**: `kgtscjvgipowuvuindxt`
- **URL**: https://kgtscjvgipowuvuindxt.supabase.co

## Projeto Destino (Supabase Externo)
- **ID**: `vpunpbozwidlzukplfts`
- **URL**: https://vpunpbozwidlzukplfts.supabase.co

---

## FASE 1: Preparação

### 1.1 Desativar Lovable Cloud
- [ ] Acessar **Settings → Connectors → Lovable Cloud**
- [ ] Clicar em **Disable Cloud**
- [ ] Confirmar desativação

### 1.2 Conectar Supabase Externo
- [ ] Após desativar Cloud, conectar o projeto externo
- [ ] URL: `https://vpunpbozwidlzukplfts.supabase.co`
- [ ] Anon Key: (sua chave pública)

---

## FASE 2: Migração de Dados

### 2.1 Executar Script Principal
- [ ] Abrir SQL Editor: https://supabase.com/dashboard/project/vpunpbozwidlzukplfts/sql
- [ ] Executar `supabase/migration-complete-cloud-to-external.sql`
- [ ] Verificar se não houve erros

### 2.2 Verificar Dados Migrados
```sql
-- Contar registros
SELECT 'profiles' as tabela, count(*) as total FROM profiles
UNION ALL SELECT 'user_roles', count(*) FROM user_roles
UNION ALL SELECT 'garages', count(*) FROM garages
UNION ALL SELECT 'brands', count(*) FROM brands
UNION ALL SELECT 'cars', count(*) FROM cars
UNION ALL SELECT 'ads', count(*) FROM ads
UNION ALL SELECT 'banners', count(*) FROM banners
UNION ALL SELECT 'ad_billing', count(*) FROM ad_billing
UNION ALL SELECT 'ad_billing_payments', count(*) FROM ad_billing_payments
UNION ALL SELECT 'internal_expenses', count(*) FROM internal_expenses;
```

Resultado esperado:
| Tabela | Total |
|--------|-------|
| profiles | 4 |
| user_roles | 4 |
| garages | 3 |
| brands | 30 |
| cars | 6 |
| ads | 12 |
| banners | 6 |
| ad_billing | 4 |
| ad_billing_payments | 7 |
| internal_expenses | 1 |

---

## FASE 3: Migração de Storage

### 3.1 Baixar Arquivos do Cloud
- [ ] Acessar Storage do projeto Cloud
- [ ] Baixar conteúdo do bucket `car-photos`
- [ ] Baixar conteúdo do bucket `ad-images`
- [ ] Baixar conteúdo do bucket `banners`

### 3.2 Upload para Supabase Externo
- [ ] Criar buckets no projeto externo (se não existirem):
  ```sql
  INSERT INTO storage.buckets (id, name, public) VALUES 
    ('car-photos', 'car-photos', true),
    ('ad-images', 'ad-images', true),
    ('banners', 'banners', true)
  ON CONFLICT (id) DO NOTHING;
  ```
- [ ] Fazer upload dos arquivos mantendo estrutura de pastas
- [ ] Verificar se todas as imagens estão acessíveis

### 3.3 Atualizar URLs no Banco
- [ ] Executar `supabase/migration-update-storage-urls.sql`
- [ ] Verificar que nenhuma URL antiga permanece:
  ```sql
  SELECT count(*) FROM cars WHERE photos[1] LIKE '%kgtscjvgipowuvuindxt%';
  SELECT count(*) FROM ads WHERE image_url_home LIKE '%kgtscjvgipowuvuindxt%';
  SELECT count(*) FROM banners WHERE image_url LIKE '%kgtscjvgipowuvuindxt%';
  ```
  (Todos devem retornar 0)

---

## FASE 4: Migração de Usuários (Auth)

### 4.1 Obter Credenciais
- [ ] Obter Service Role Key do projeto externo
- [ ] Guardar em local seguro (NUNCA expor publicamente)

### 4.2 Criar Usuários
- [ ] Seguir guia `docs/GUIA-MIGRACAO-USUARIOS-AUTH.md`
- [ ] Criar 4 usuários com UUIDs preservados
- [ ] Verificar criação no dashboard Auth

### 4.3 Verificar Vínculos
- [ ] Testar login do Super Admin
- [ ] Testar login de cada garagem
- [ ] Verificar acesso às funcionalidades corretas

---

## FASE 5: Deploy de Edge Functions

### 5.1 Configurar Secrets
```bash
supabase secrets set SUPABASE_URL=https://vpunpbozwidlzukplfts.supabase.co
supabase secrets set SUPABASE_ANON_KEY=<SUA_ANON_KEY>
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=<SUA_SERVICE_ROLE_KEY>
```

### 5.2 Deploy das Functions
```bash
cd supabase/functions
supabase functions deploy create-garage
supabase functions deploy reset-garage-password
supabase functions deploy update-garage-email
supabase functions deploy track-analytics
supabase functions deploy sitemap
```

---

## FASE 6: Testes Finais

### 6.1 Testes Públicos (sem login)
- [ ] Homepage carrega veículos
- [ ] Filtros funcionam
- [ ] Imagens de carros carregam
- [ ] Banners exibem corretamente
- [ ] Anúncios exibem corretamente
- [ ] Página de detalhes do veículo funciona

### 6.2 Testes de Garagem
- [ ] Login funciona
- [ ] Dashboard exibe veículos da garagem
- [ ] Adicionar novo veículo
- [ ] Editar veículo existente
- [ ] Upload de fotos funciona
- [ ] Marcar como vendido

### 6.3 Testes de Super Admin
- [ ] Acesso ao painel admin
- [ ] Gerenciar garagens
- [ ] Gerenciar anúncios
- [ ] Gerenciar banners
- [ ] Visualizar logs/estatísticas

---

## FASE 7: Limpeza

### 7.1 Após Confirmar Migração Completa
- [ ] Fazer backup final do Cloud (opcional)
- [ ] Documentar qualquer ajuste manual realizado
- [ ] Atualizar documentação do projeto

---

## Problemas Comuns

### Imagens não carregam
1. Verificar se buckets são públicos
2. Verificar políticas RLS do storage
3. Confirmar que URLs foram atualizadas

### Login não funciona
1. Verificar se usuário foi criado no auth.users
2. Confirmar UUID está correto
3. Verificar email_confirm = true

### RLS bloqueando acesso
1. Verificar funções `is_super_admin()` e `is_garage()` existem
2. Confirmar user_roles está populado corretamente

---

## Contatos de Suporte

- Documentação Supabase: https://supabase.com/docs
- Dashboard do projeto: https://supabase.com/dashboard/project/vpunpbozwidlzukplfts
