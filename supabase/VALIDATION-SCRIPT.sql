-- ============================================================
-- SCRIPT DE VALIDAÇÃO DE MIGRAÇÃO
-- ============================================================
--
-- Execute este script em AMBOS os bancos (Cloud e Externo)
-- Compare os resultados para garantir que a migração foi completa
--
-- ============================================================

-- ============================================================
-- 1. CONTAGEM DE REGISTROS POR TABELA
-- ============================================================

SELECT '=== CONTAGEM DE REGISTROS ===' as info;

SELECT 
  'brands' as tabela, 
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE is_active = true) as ativos
FROM brands
UNION ALL
SELECT 
  'profiles', 
  COUNT(*),
  COUNT(*)
FROM profiles
UNION ALL
SELECT 
  'user_roles', 
  COUNT(*),
  COUNT(*)
FROM user_roles
UNION ALL
SELECT 
  'garages', 
  COUNT(*),
  COUNT(*) FILTER (WHERE is_active = true)
FROM garages
UNION ALL
SELECT 
  'cars', 
  COUNT(*),
  COUNT(*) FILTER (WHERE status = 'available')
FROM cars
UNION ALL
SELECT 
  'ads', 
  COUNT(*),
  COUNT(*) FILTER (WHERE is_active = true)
FROM ads
UNION ALL
SELECT 
  'ad_billing', 
  COUNT(*),
  COUNT(*)
FROM ad_billing
UNION ALL
SELECT 
  'ad_billing_payments', 
  COUNT(*),
  COUNT(*)
FROM ad_billing_payments
UNION ALL
SELECT 
  'banners', 
  COUNT(*),
  COUNT(*) FILTER (WHERE is_active = true)
FROM banners
UNION ALL
SELECT 
  'internal_expenses', 
  COUNT(*),
  COUNT(*)
FROM internal_expenses
UNION ALL
SELECT 
  'sales_history', 
  COUNT(*),
  COUNT(*)
FROM sales_history
UNION ALL
SELECT 
  'action_logs', 
  COUNT(*),
  COUNT(*)
FROM action_logs
ORDER BY tabela;

-- ============================================================
-- 2. VERIFICAÇÃO DE UUIDs CRÍTICOS
-- ============================================================

SELECT '=== UUIDs CRÍTICOS (PROFILES) ===' as info;

SELECT id, email, name, created_at
FROM profiles
ORDER BY created_at;

SELECT '=== UUIDs CRÍTICOS (GARAGES) ===' as info;

SELECT id, name, user_id, is_active, created_at
FROM garages
ORDER BY created_at;

-- ============================================================
-- 3. VERIFICAÇÃO DE INTEGRIDADE REFERENCIAL
-- ============================================================

SELECT '=== INTEGRIDADE: CARS SEM GARAGE ===' as info;

SELECT COUNT(*) as cars_sem_garage_valida
FROM cars c
WHERE NOT EXISTS (SELECT 1 FROM garages g WHERE g.id = c.garage_id);

SELECT '=== INTEGRIDADE: CARS SEM BRAND ===' as info;

SELECT COUNT(*) as cars_sem_brand_valida
FROM cars c
WHERE NOT EXISTS (SELECT 1 FROM brands b WHERE b.id = c.brand_id);

SELECT '=== INTEGRIDADE: AD_BILLING SEM AD ===' as info;

SELECT COUNT(*) as billing_sem_ad
FROM ad_billing ab
WHERE NOT EXISTS (SELECT 1 FROM ads a WHERE a.id = ab.ad_id);

SELECT '=== INTEGRIDADE: GARAGES SEM PROFILE ===' as info;

SELECT COUNT(*) as garages_sem_profile
FROM garages g
WHERE NOT EXISTS (SELECT 1 FROM profiles p WHERE p.id = g.user_id);

-- ============================================================
-- 4. VERIFICAÇÃO DE STORAGE (URLs)
-- ============================================================

SELECT '=== STORAGE: URLs EM CARS ===' as info;

SELECT 
  COUNT(*) as total_cars,
  COUNT(*) FILTER (WHERE photos IS NOT NULL AND array_length(photos, 1) > 0) as cars_com_fotos,
  COUNT(*) FILTER (WHERE array_to_string(photos, ',') LIKE '%kgtscjvgipowuvuindxt%') as urls_cloud_antigo,
  COUNT(*) FILTER (WHERE array_to_string(photos, ',') LIKE '%vpunpbozwidlzukplfts%') as urls_externo_novo
FROM cars;

SELECT '=== STORAGE: URLs EM ADS ===' as info;

SELECT 
  COUNT(*) as total_ads,
  COUNT(*) FILTER (WHERE image_url_home IS NOT NULL) as ads_com_imagem_home,
  COUNT(*) FILTER (WHERE image_url_home LIKE '%kgtscjvgipowuvuindxt%') as urls_cloud_antigo,
  COUNT(*) FILTER (WHERE image_url_home LIKE '%vpunpbozwidlzukplfts%') as urls_externo_novo
FROM ads;

SELECT '=== STORAGE: URLs EM BANNERS ===' as info;

SELECT 
  COUNT(*) as total_banners,
  COUNT(*) FILTER (WHERE image_url IS NOT NULL) as banners_com_imagem,
  COUNT(*) FILTER (WHERE image_url LIKE '%kgtscjvgipowuvuindxt%') as urls_cloud_antigo,
  COUNT(*) FILTER (WHERE image_url LIKE '%vpunpbozwidlzukplfts%') as urls_externo_novo
FROM banners;

-- ============================================================
-- 5. VERIFICAÇÃO DE FUNÇÕES
-- ============================================================

SELECT '=== FUNÇÕES EXISTENTES ===' as info;

SELECT 
  routine_name as funcao,
  routine_type as tipo
FROM information_schema.routines 
WHERE routine_schema = 'public'
  AND routine_type = 'FUNCTION'
ORDER BY routine_name;

-- ============================================================
-- 6. VERIFICAÇÃO DE RLS POLICIES
-- ============================================================

SELECT '=== RLS POLICIES POR TABELA ===' as info;

SELECT 
  schemaname,
  tablename,
  COUNT(*) as total_policies
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY schemaname, tablename
ORDER BY tablename;

-- ============================================================
-- 7. VERIFICAÇÃO DE STORAGE BUCKETS
-- ============================================================

SELECT '=== STORAGE BUCKETS ===' as info;

SELECT 
  id,
  name,
  public,
  created_at
FROM storage.buckets
ORDER BY name;

-- ============================================================
-- 8. RESUMO FINAL
-- ============================================================

SELECT '=== RESUMO DA VALIDAÇÃO ===' as info;

WITH counts AS (
  SELECT 'brands' as t, COUNT(*) as c FROM brands
  UNION ALL SELECT 'profiles', COUNT(*) FROM profiles
  UNION ALL SELECT 'user_roles', COUNT(*) FROM user_roles
  UNION ALL SELECT 'garages', COUNT(*) FROM garages
  UNION ALL SELECT 'cars', COUNT(*) FROM cars
  UNION ALL SELECT 'ads', COUNT(*) FROM ads
  UNION ALL SELECT 'ad_billing', COUNT(*) FROM ad_billing
  UNION ALL SELECT 'ad_billing_payments', COUNT(*) FROM ad_billing_payments
  UNION ALL SELECT 'banners', COUNT(*) FROM banners
  UNION ALL SELECT 'internal_expenses', COUNT(*) FROM internal_expenses
  UNION ALL SELECT 'sales_history', COUNT(*) FROM sales_history
  UNION ALL SELECT 'action_logs', COUNT(*) FROM action_logs
)
SELECT 
  SUM(c) as total_registros,
  COUNT(*) as total_tabelas,
  (SELECT COUNT(*) FROM information_schema.routines WHERE routine_schema = 'public' AND routine_type = 'FUNCTION') as total_funcoes,
  (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public') as total_rls_policies,
  (SELECT COUNT(*) FROM storage.buckets) as total_buckets
FROM counts;

-- ============================================================
-- VALORES ESPERADOS (LOVABLE CLOUD - REFERÊNCIA)
-- ============================================================
--
-- | Tabela              | Total | Ativos |
-- |---------------------|-------|--------|
-- | brands              | 31    | 31     |
-- | profiles            | 4     | 4      |
-- | user_roles          | 4     | 4      |
-- | garages             | 3     | 3      |
-- | cars                | 6     | 6      |
-- | ads                 | 12    | 12     |
-- | ad_billing          | 4     | 4      |
-- | ad_billing_payments | 7     | 7      |
-- | banners             | 6     | 6      |
-- | internal_expenses   | 1     | 1      |
-- | sales_history       | 0     | 0      |
-- | action_logs         | ~630  | ~630   |
--
-- Storage Buckets: 3 (car-photos, ad-images, banners)
-- Funções: 12+
-- RLS Policies: 45+
--
-- ============================================================
