# Guia de Migração de Usuários (Auth)

Este guia explica como recriar os usuários do `auth.users` no Supabase externo usando a Admin API.

## Contexto

Os usuários no Lovable Cloud estão vinculados ao projeto `kgtscjvgipowuvuindxt`. Para migrar para o projeto externo `vpunpbozwidlzukplfts`, precisamos recriar os usuários **com os mesmos UUIDs** para manter o vínculo com:

- `public.profiles` (via `profiles.id = auth.users.id`)
- `public.user_roles` (via `user_roles.user_id = auth.users.id`)
- `public.garages` (via `garages.user_id = profiles.id`)

## Usuários a Migrar

| Email | UUID (deve ser preservado) | Role | Garagem |
|-------|---------------------------|------|---------|
| flaviofernandesv@gmail.com | 3a2095d3-f1d6-41e8-9c90-5705b1536e08 | super_admin | - |
| primeveiculos@gmail.com | c7314718-33e5-41f0-96c6-61d3c3300086 | garage | Prime Veiculos |
| elitecar@gmail.com | aa9a14b0-13a5-49ee-97b5-a068a0d6cfdd | garage | EliteCar |
| g12@gmail.com | 2a13bffa-e70b-4f74-a7d7-9643f0929c78 | garage | G12 Automóveis |

## Passo a Passo

### Passo 1: Obter a Service Role Key

1. Acesse o dashboard do Supabase externo:
   https://supabase.com/dashboard/project/vpunpbozwidlzukplfts

2. Vá em **Settings → API**

3. Copie a **service_role key** (NUNCA exponha esta chave publicamente!)

### Passo 2: Criar Usuários via Admin API

Use a Admin API do Supabase para criar cada usuário com UUID específico.

#### Opção A: Via cURL (Terminal)

```bash
# Substitua YOUR_SERVICE_ROLE_KEY pela sua chave
SERVICE_ROLE_KEY="YOUR_SERVICE_ROLE_KEY"
SUPABASE_URL="https://vpunpbozwidlzukplfts.supabase.co"

# Usuário 1: Super Admin
curl -X POST "$SUPABASE_URL/auth/v1/admin/users" \
  -H "apikey: $SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "3a2095d3-f1d6-41e8-9c90-5705b1536e08",
    "email": "flaviofernandesv@gmail.com",
    "password": "NOVA_SENHA_SEGURA_1",
    "email_confirm": true,
    "user_metadata": { "name": "Super Admin" }
  }'

# Usuário 2: Prime Veiculos
curl -X POST "$SUPABASE_URL/auth/v1/admin/users" \
  -H "apikey: $SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "c7314718-33e5-41f0-96c6-61d3c3300086",
    "email": "primeveiculos@gmail.com",
    "password": "NOVA_SENHA_SEGURA_2",
    "email_confirm": true,
    "user_metadata": { "name": "Prime Veiculos" }
  }'

# Usuário 3: EliteCar
curl -X POST "$SUPABASE_URL/auth/v1/admin/users" \
  -H "apikey: $SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "aa9a14b0-13a5-49ee-97b5-a068a0d6cfdd",
    "email": "elitecar@gmail.com",
    "password": "NOVA_SENHA_SEGURA_3",
    "email_confirm": true,
    "user_metadata": { "name": "EliteCar" }
  }'

# Usuário 4: G12 Automóveis
curl -X POST "$SUPABASE_URL/auth/v1/admin/users" \
  -H "apikey: $SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "2a13bffa-e70b-4f74-a7d7-9643f0929c78",
    "email": "g12@gmail.com",
    "password": "NOVA_SENHA_SEGURA_4",
    "email_confirm": true,
    "user_metadata": { "name": "G12 Automóveis" }
  }'
```

#### Opção B: Via JavaScript (Node.js)

```javascript
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://vpunpbozwidlzukplfts.supabase.co';
const serviceRoleKey = 'YOUR_SERVICE_ROLE_KEY'; // NUNCA exponha isso!

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const users = [
  {
    id: '3a2095d3-f1d6-41e8-9c90-5705b1536e08',
    email: 'flaviofernandesv@gmail.com',
    password: 'NOVA_SENHA_SEGURA_1',
    user_metadata: { name: 'Super Admin' }
  },
  {
    id: 'c7314718-33e5-41f0-96c6-61d3c3300086',
    email: 'primeveiculos@gmail.com',
    password: 'NOVA_SENHA_SEGURA_2',
    user_metadata: { name: 'Prime Veiculos' }
  },
  {
    id: 'aa9a14b0-13a5-49ee-97b5-a068a0d6cfdd',
    email: 'elitecar@gmail.com',
    password: 'NOVA_SENHA_SEGURA_3',
    user_metadata: { name: 'EliteCar' }
  },
  {
    id: '2a13bffa-e70b-4f74-a7d7-9643f0929c78',
    email: 'g12@gmail.com',
    password: 'NOVA_SENHA_SEGURA_4',
    user_metadata: { name: 'G12 Automóveis' }
  }
];

async function createUsers() {
  for (const user of users) {
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      id: user.id, // UUID preservado!
      email: user.email,
      password: user.password,
      email_confirm: true,
      user_metadata: user.user_metadata
    });

    if (error) {
      console.error(`Erro ao criar ${user.email}:`, error.message);
    } else {
      console.log(`✅ Usuário criado: ${user.email}`);
    }
  }
}

createUsers();
```

### Passo 3: Verificar Vínculos

Após criar os usuários, verifique se os vínculos estão corretos:

```sql
-- Verificar profiles vinculados
SELECT p.id, p.email, p.name, ur.role
FROM profiles p
LEFT JOIN user_roles ur ON p.id = ur.user_id;

-- Verificar garages vinculadas
SELECT g.name, g.user_id, p.email
FROM garages g
JOIN profiles p ON g.user_id = p.id;
```

### Passo 4: Informar Novas Senhas aos Usuários

⚠️ **IMPORTANTE**: As senhas precisam ser comunicadas aos usuários de forma segura.

Opções:
1. Enviar por WhatsApp/email individual
2. Usar o fluxo de "Esqueci minha senha" do Supabase
3. Pedir que cada usuário redefina a senha no primeiro acesso

## Mapeamento auth.users ↔ profiles

O sistema está configurado para que:

```
auth.users.id  =  profiles.id  =  user_roles.user_id
                                  ↓
                              garages.user_id
```

Por isso é **CRÍTICO** preservar os UUIDs ao recriar os usuários!

## Troubleshooting

### Erro: "User already exists"

O usuário já foi criado anteriormente. Para atualizar:

```javascript
await supabaseAdmin.auth.admin.updateUserById(userId, {
  password: 'nova_senha'
});
```

### Erro: "Invalid UUID"

Verifique se o UUID está no formato correto: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`

### Verificar se usuário existe

```javascript
const { data } = await supabaseAdmin.auth.admin.getUserById(userId);
console.log(data);
```

## Checklist Final

- [ ] Service Role Key obtida do Supabase externo
- [ ] 4 usuários criados com UUIDs preservados
- [ ] Vínculos com profiles verificados
- [ ] Vínculos com user_roles verificados
- [ ] Vínculos com garages verificados
- [ ] Novas senhas comunicadas aos usuários
- [ ] Teste de login realizado com sucesso
