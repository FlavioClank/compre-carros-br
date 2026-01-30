# Guia de Migração de Usuários (auth.users)

Este guia explica como recriar os usuários de autenticação no seu Supabase externo.

## ⚠️ IMPORTANTE

Os usuários do `auth.users` **NÃO podem ser exportados diretamente** por motivos de segurança (as senhas são hashes).

Você precisa:
1. Criar os usuários manualmente via Admin API
2. Ou pedir para os usuários redefinirem suas senhas

---

## Método 1: Recriar via Admin API (Recomendado)

### Passo 1: Obtenha sua Service Role Key

No Dashboard do seu Supabase externo:
- Vá em **Settings → API**
- Copie a **service_role key** (⚠️ nunca exponha essa chave!)

### Passo 2: Crie os usuários via API

Execute estes comandos (substitua `YOUR_PROJECT_URL` e `YOUR_SERVICE_ROLE_KEY`):

```bash
# Usuário 1: Super Admin
curl -X POST 'YOUR_PROJECT_URL/auth/v1/admin/users' \
  -H "apikey: YOUR_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "3a2095d3-f1d6-41e8-9c90-5705b1536e08",
    "email": "flaviofernandesv@gmail.com",
    "password": "DEFINIR_NOVA_SENHA",
    "email_confirm": true
  }'

# Usuário 2: Prime Veiculos (Garage)
curl -X POST 'YOUR_PROJECT_URL/auth/v1/admin/users' \
  -H "apikey: YOUR_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "c7314718-33e5-41f0-96c6-61d3c3300086",
    "email": "primeveiculos@gmail.com",
    "password": "DEFINIR_NOVA_SENHA",
    "email_confirm": true
  }'

# Usuário 3: EliteCar (Garage)
curl -X POST 'YOUR_PROJECT_URL/auth/v1/admin/users' \
  -H "apikey: YOUR_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "aa9a14b0-13a5-49ee-97b5-a068a0d6cfdd",
    "email": "elitecar@gmail.com",
    "password": "DEFINIR_NOVA_SENHA",
    "email_confirm": true
  }'

# Usuário 4: G12 Automóveis (Garage)
curl -X POST 'YOUR_PROJECT_URL/auth/v1/admin/users' \
  -H "apikey: YOUR_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "2a13bffa-e70b-4f74-a7d7-9643f0929c78",
    "email": "g12@gmail.com",
    "password": "DEFINIR_NOVA_SENHA",
    "email_confirm": true
  }'
```

### Passo 3: Verifique os usuários criados

```bash
curl -X GET 'YOUR_PROJECT_URL/auth/v1/admin/users' \
  -H "apikey: YOUR_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY"
```

---

## Método 2: Reset de Senha por Email

Se preferir, você pode:

1. Criar os usuários com senhas temporárias (método acima)
2. Enviar link de redefinição de senha para cada usuário:

```bash
curl -X POST 'YOUR_PROJECT_URL/auth/v1/recover' \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"email": "flaviofernandesv@gmail.com"}'
```

---

## Resumo dos Usuários

| UUID | Email | Função |
|------|-------|--------|
| `3a2095d3-f1d6-41e8-9c90-5705b1536e08` | flaviofernandesv@gmail.com | Super Admin |
| `c7314718-33e5-41f0-96c6-61d3c3300086` | primeveiculos@gmail.com | Garage |
| `aa9a14b0-13a5-49ee-97b5-a068a0d6cfdd` | elitecar@gmail.com | Garage |
| `2a13bffa-e70b-4f74-a7d7-9643f0929c78` | g12@gmail.com | Garage |

---

## Checklist

- [ ] Usuários criados via Admin API
- [ ] IDs preservados (UUIDs iguais)
- [ ] Emails confirmados (`email_confirm: true`)
- [ ] Senhas definidas ou links de reset enviados
- [ ] Script de profiles executado após criação dos usuários
