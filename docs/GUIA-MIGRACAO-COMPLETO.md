# 🚀 Guia Completo de Migração para Supabase Externo

## 📋 Visão Geral

Este guia documenta o processo completo de migração do Lovable Cloud DB para um Supabase externo próprio.

### Inventário do Banco Atual

| Tabela | Registros | Descrição |
|--------|-----------|-----------|
| brands | 31 | Marcas de veículos |
| profiles | 4 | Perfis de usuários |
| user_roles | 4 | Roles (super_admin, garage) |
| garages | 3 | Lojas/garagens |
| cars | 6 | Veículos cadastrados |
| ads | 12 | Anúncios de parceiros |
| ad_billing | 4 | Faturamento de anúncios |
| ad_billing_payments | 7 | Pagamentos registrados |
| banners | 6 | Banners do carrossel |
| internal_expenses | 1 | Gastos internos |
| sales_history | 0 | Histórico de vendas |
| action_logs | 601 | Logs de analytics |

### Storage Buckets

| Bucket | Tipo | Arquivos |
|--------|------|----------|
| car-photos | Público | Fotos dos veículos |
| ad-images | Público | Imagens dos anúncios |
| banners | Público | Imagens dos banners |

---

## 📁 Arquivos de Migração

Todos os scripts estão em `supabase/`:

1. **`migration-complete-external.sql`** - Estrutura completa (enums, tabelas, índices, funções, triggers, RLS, storage)
2. **`migration-data-external.sql`** - Dados das tabelas principais
3. **`migration-update-storage-urls.sql`** - Atualização de URLs após migrar storage

Documentação em `docs/`:

4. **`GUIA-MIGRACAO-USUARIOS-AUTH.md`** - Como criar usuários no auth.users

---

## 🔧 Passo a Passo

### Fase 1: Preparação do Supabase Externo

1. **Criar projeto no Supabase**
   - Acesse https://supabase.com/dashboard
   - Crie um novo projeto
   - Anote: `Project URL`, `anon key`, `service_role key`

2. **Configurar autenticação**
   - Settings → Authentication → Email: ativar
   - Settings → Authentication → Disable signup: desabilitar (temporário)

### Fase 2: Criar Estrutura

3. **Executar script de estrutura**
   ```
   SQL Editor → New Query → Cole o conteúdo de migration-complete-external.sql → Run
   ```

4. **Criar usuários auth.users**
   - Siga o guia em `docs/GUIA-MIGRACAO-USUARIOS-AUTH.md`
   - Use a Admin API para criar com os mesmos UUIDs

### Fase 3: Migrar Dados

5. **Executar script de dados**
   ```
   SQL Editor → New Query → Cole o conteúdo de migration-data-external.sql → Run
   ```

6. **Migrar carros** (se não incluídos no script de dados)
   - Exporte os dados de `cars` com descrições completas
   - Importe mantendo os UUIDs

7. **Migrar action_logs** (opcional)
   - São 601 registros de analytics
   - Pode ser ignorado se quiser começar do zero

### Fase 4: Migrar Storage

8. **Baixar arquivos do Cloud**
   - Use a interface do Supabase ou scripts
   - Organize por bucket: `car-photos/`, `ad-images/`, `banners/`

9. **Upload para novo projeto**
   - Storage → Selecionar bucket → Upload

10. **Atualizar URLs no banco**
    ```
    SQL Editor → Cole migration-update-storage-urls.sql
    Altere 'SEU_PROJECT_ID' para o ID real
    Execute
    ```

### Fase 5: Configurar Projeto Lovable

11. **Desabilitar Lovable Cloud**
    - Settings → Connectors → Lovable Cloud → Disable Cloud
    - ⚠️ Isso afeta apenas novos projetos, não o atual

12. **Configurar variáveis de ambiente**
    
    Como o arquivo `.env` é gerenciado automaticamente pelo Lovable Cloud, você precisará:
    
    **Opção A**: Hospedar o código externamente (Vercel, Netlify, etc.) e configurar:
    ```env
    VITE_SUPABASE_URL=https://SEU_PROJECT_ID.supabase.co
    VITE_SUPABASE_PUBLISHABLE_KEY=sua_anon_key
    VITE_SUPABASE_PROJECT_ID=SEU_PROJECT_ID
    ```
    
    **Opção B**: Manter no Lovable para desenvolvimento e configurar o domínio de produção com variáveis próprias

### Fase 6: Validação

13. **Testar funcionalidades**
    - [ ] Login como Super Admin
    - [ ] Login como Garage
    - [ ] Listagem de veículos (público)
    - [ ] Detalhe de veículo
    - [ ] Listagem de anúncios
    - [ ] Carrossel de banners
    - [ ] Upload de imagem (admin)
    - [ ] Estatísticas (admin)
    - [ ] Tracking de analytics

---

## ⚠️ Limitações Importantes

### Sobre o Lovable Cloud

1. **Não é possível desconectar um projeto existente do Lovable Cloud**
   - Uma vez habilitado, o Cloud permanece ativo
   - Os arquivos `.env`, `client.ts` e `types.ts` são gerenciados automaticamente

2. **Alternativas**:
   - Exportar código e hospedar externamente
   - Usar domínio customizado com configurações próprias
   - Manter Cloud para dev e Supabase externo para produção

### Sobre a Migração

1. **Usuários auth.users**
   - Senhas não podem ser exportadas (por segurança)
   - Usuários precisam ser recriados via Admin API
   - Senhas precisam ser redefinidas

2. **UUIDs**
   - Todos os IDs são preservados nos scripts
   - Não gere novos IDs, use os existentes

3. **Storage**
   - Arquivos precisam ser baixados e re-uploadados manualmente
   - URLs precisam ser atualizadas no banco após migração

---

## 🔐 Edge Functions

As Edge Functions em `supabase/functions/` precisam ser deployadas no seu projeto externo:

```bash
# Instalar Supabase CLI
npm install -g supabase

# Login
supabase login

# Link ao projeto
supabase link --project-ref SEU_PROJECT_ID

# Deploy das functions
supabase functions deploy create-garage
supabase functions deploy reset-garage-password
supabase functions deploy track-analytics
supabase functions deploy update-garage-email
supabase functions deploy sitemap
```

Configure os secrets:
```bash
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key
```

---

## 📊 Verificação Final

Execute esta query para verificar a migração:

```sql
SELECT 
  'brands' as tabela, COUNT(*) as registros FROM brands
UNION ALL SELECT 'profiles', COUNT(*) FROM profiles
UNION ALL SELECT 'user_roles', COUNT(*) FROM user_roles
UNION ALL SELECT 'garages', COUNT(*) FROM garages
UNION ALL SELECT 'cars', COUNT(*) FROM cars
UNION ALL SELECT 'ads', COUNT(*) FROM ads
UNION ALL SELECT 'ad_billing', COUNT(*) FROM ad_billing
UNION ALL SELECT 'ad_billing_payments', COUNT(*) FROM ad_billing_payments
UNION ALL SELECT 'banners', COUNT(*) FROM banners
UNION ALL SELECT 'internal_expenses', COUNT(*) FROM internal_expenses
ORDER BY tabela;
```

Resultado esperado:
- brands: 31
- profiles: 4
- user_roles: 4
- garages: 3
- cars: 6
- ads: 12
- ad_billing: 4
- ad_billing_payments: 7
- banners: 6
- internal_expenses: 1

---

## 🆘 Suporte

- [Documentação Supabase](https://supabase.com/docs)
- [Guia de Migração Oficial](https://supabase.com/docs/guides/platform/migrating-and-upgrading-projects)
- [Lovable Docs](https://docs.lovable.dev)
