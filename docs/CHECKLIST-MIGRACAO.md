# ✅ Checklist de Migração - Lovable Cloud → Supabase Externo

## 📋 Resumo da Migração

| Item | Quantidade | Status |
|------|------------|--------|
| Tabelas | 12 | ⏳ |
| Enums | 4 | ⏳ |
| Funções | 12 | ⏳ |
| Triggers | 12 | ⏳ |
| RLS Policies | 45+ | ⏳ |
| Storage Buckets | 3 | ⏳ |
| Brands | 31 | ⏳ |
| Profiles | 4 | ⏳ |
| User Roles | 4 | ⏳ |
| Garages | 3 | ⏳ |
| Cars | 6 | ⏳ |
| Ads | 12 | ⏳ |
| Ad Billing | 4 | ⏳ |
| Banners | 6 | ⏳ |
| Internal Expenses | 1 | ⏳ |
| Action Logs | 629 | ⏳ (opcional) |

---

## 🔧 Passo a Passo

### 1️⃣ Criar Usuários no auth.users

No Dashboard do Supabase externo → **Authentication → Users → Add User**

Crie os 4 usuários mantendo os UUIDs originais:

| Email | UUID | Senha |
|-------|------|-------|
| flaviofernandesv@gmail.com | `3a2095d3-f1d6-41e8-9c90-5705b1536e08` | (definir) |
| primeveiculos@gmail.com | `c7314718-33e5-41f0-96c6-61d3c3300086` | (definir) |
| elitecar@gmail.com | `aa9a14b0-13a5-49ee-97b5-a068a0d6cfdd` | (definir) |
| g12@gmail.com | `2a13bffa-e70b-4f74-a7d7-9643f0929c78` | (definir) |

**Opção via API (curl):**
```bash
curl -X POST 'https://SEU_PROJECT.supabase.co/auth/v1/admin/users' \
  -H "apikey: SUA_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer SUA_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "3a2095d3-f1d6-41e8-9c90-5705b1536e08",
    "email": "flaviofernandesv@gmail.com",
    "password": "SUA_SENHA_AQUI",
    "email_confirm": true
  }'
```

- [ ] Usuário Super Admin criado
- [ ] Usuário Prime Veículos criado
- [ ] Usuário EliteCar criado
- [ ] Usuário G12 criado

---

### 2️⃣ Executar Script Principal de Migração

No Dashboard → **SQL Editor → New Query**

1. Cole o conteúdo de `supabase/MIGRATION-FINAL-EXTERNAL.sql`
2. Execute

- [ ] Script principal executado sem erros

---

### 3️⃣ Executar Script de Carros

No Dashboard → **SQL Editor → New Query**

1. Cole o conteúdo de `supabase/MIGRATION-CARS-DATA.sql`
2. Execute

- [ ] 6 carros migrados

---

### 4️⃣ Migrar Storage (Imagens)

#### Baixar do Lovable Cloud:

Acesse: `https://kgtscjvgipowuvuindxt.supabase.co` (se tiver acesso)

Ou use a CLI:
```bash
# Listar arquivos
supabase storage ls car-photos --project-ref kgtscjvgipowuvuindxt
supabase storage ls ad-images --project-ref kgtscjvgipowuvuindxt
supabase storage ls banners --project-ref kgtscjvgipowuvuindxt
```

#### Upload para Supabase Externo:

Via Dashboard → **Storage → Upload**

- [ ] Bucket `car-photos` migrado
- [ ] Bucket `ad-images` migrado
- [ ] Bucket `banners` migrado

---

### 5️⃣ Atualizar URLs do Storage

Após upload das imagens:

1. Edite `supabase/migration-update-storage-urls.sql`
2. Substitua `SEU_PROJECT_ID` pelo ID real
3. Execute no SQL Editor

- [ ] URLs atualizadas em `ads`
- [ ] URLs atualizadas em `banners`
- [ ] URLs atualizadas em `cars`

---

### 6️⃣ Deploy das Edge Functions (CRÍTICO!)

⚠️ **IMPORTANTE**: As Edge Functions precisam ser deployadas no Supabase EXTERNO para funcionarem em produção!

```bash
cd seu-projeto

# 1. Instalar Supabase CLI (se ainda não tiver)
npm install -g supabase

# 2. Fazer login
supabase login

# 3. Linkar ao projeto EXTERNO (vpunpbozwidlzukplfts)
supabase link --project-ref vpunpbozwidlzukplfts

# 4. Configurar secrets ANTES do deploy
supabase secrets set SUPABASE_URL=https://vpunpbozwidlzukplfts.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key_do_projeto_externo

# 5. Deploy de todas as funções
supabase functions deploy create-garage
supabase functions deploy reset-garage-password
supabase functions deploy track-analytics
supabase functions deploy update-garage-email
supabase functions deploy sitemap

# 6. Verificar se funcionam
curl https://vpunpbozwidlzukplfts.supabase.co/functions/v1/sitemap
```

**Verificação pós-deploy:**
```bash
# Testar se CORS está funcionando para produção
curl -X OPTIONS https://vpunpbozwidlzukplfts.supabase.co/functions/v1/create-garage \
  -H "Origin: https://comprecarrosbr.com.br" \
  -H "Access-Control-Request-Method: POST" \
  -v
```

- [ ] `create-garage` deployada no Supabase externo
- [ ] `reset-garage-password` deployada no Supabase externo
- [ ] `track-analytics` deployada no Supabase externo
- [ ] `update-garage-email` deployada no Supabase externo
- [ ] `sitemap` deployada no Supabase externo
- [ ] Secrets configurados no Supabase externo

---

### 7️⃣ Publicar o App (NÃO precisa de hosting externo!)

✅ **BOA NOTÍCIA**: O código do frontend foi atualizado para detectar automaticamente o ambiente:
- Em `comprecarrosbr.com.br` → usa Supabase externo
- Em preview Lovable → usa Lovable Cloud

Basta **Publicar** o app no Lovable e configurar o domínio customizado!

- [ ] App publicado no Lovable
- [ ] Domínio customizado configurado (comprecarrosbr.com.br)

---

### 8️⃣ Validação Final

| Teste | Status |
|-------|--------|
| Login Super Admin | ⏳ |
| Login Garage | ⏳ |
| Listagem pública de veículos | ⏳ |
| Detalhe de veículo | ⏳ |
| Imagens carregando | ⏳ |
| Anúncios na home | ⏳ |
| Carrossel de banners | ⏳ |
| Tracking funcionando | ⏳ |
| Admin: estatísticas | ⏳ |
| Admin: criar anúncio | ⏳ |
| Garage: adicionar veículo | ⏳ |

---

## 🔐 Credenciais Necessárias

Você precisará ter em mãos:

- [ ] URL do projeto: `https://SEU_PROJECT_ID.supabase.co`
- [ ] Anon Key (publishable)
- [ ] Service Role Key (para edge functions)
- [ ] Senhas definidas para os 4 usuários

---

## ⚠️ Importante

1. **O Lovable Cloud não pode ser desconectado** de um projeto existente
2. Para usar o Supabase externo em produção, você precisa:
   - Hospedar o frontend externamente (Vercel, Netlify, etc.)
   - OU usar um domínio customizado
3. Os action_logs (629 registros) são opcionais - pode começar zerado
4. Todos os scripts são **idempotentes** - podem ser executados múltiplas vezes

---

## 📞 Após a Migração

Quando todos os itens estiverem ✅:

1. Teste todas as funcionalidades
2. Monitore os logs por 24-48h
3. Considere configurar backups automáticos
4. Ative Image Transformation (plano Pro)
