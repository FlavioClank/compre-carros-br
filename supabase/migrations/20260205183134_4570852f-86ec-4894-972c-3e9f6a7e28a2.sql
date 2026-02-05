-- Corrigir coluna id da tabela ad_billing para gerar UUID automaticamente
-- Idempotente: não falha se já tiver o default

-- Habilitar extensão pgcrypto (caso gen_random_uuid não esteja disponível)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Alterar coluna id para ter default gen_random_uuid()
-- Isso resolve o erro 23502: null value in column "id" violates not-null constraint
ALTER TABLE public.ad_billing 
ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Garantir que a coluna é NOT NULL (provavelmente já é, mas por segurança)
ALTER TABLE public.ad_billing 
ALTER COLUMN id SET NOT NULL;