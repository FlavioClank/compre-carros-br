-- ============================================================
-- SCRIPT DE ATUALIZAÇÃO DE URLs DE STORAGE
-- ============================================================
--
-- Execute este script APÓS migrar os arquivos do Storage
-- Substitua 'SEU_PROJECT_ID' pelo ID do seu Supabase externo
--
-- IMPORTANTE: Este script é IDEMPOTENTE - pode rodar múltiplas vezes
--
-- ============================================================

-- ⚠️ ALTERE A LINHA ABAIXO COM SEU PROJECT ID REAL!
-- Exemplo: 'https://abcd1234xyz.supabase.co'
DO $$
DECLARE
  old_url TEXT := 'https://kgtscjvgipowuvuindxt.supabase.co';
  new_url TEXT := 'https://SEU_PROJECT_ID.supabase.co'; -- ⚠️ ALTERAR AQUI!
  ads_count INTEGER;
  banners_count INTEGER;
  cars_count INTEGER;
BEGIN
  
  -- Verificar se já foi executado (se não há URLs antigas)
  SELECT COUNT(*) INTO ads_count FROM ads WHERE image_url_home LIKE old_url || '%';
  SELECT COUNT(*) INTO banners_count FROM banners WHERE image_url LIKE old_url || '%';
  SELECT COUNT(*) INTO cars_count FROM cars WHERE array_to_string(photos, ',') LIKE '%' || old_url || '%';
  
  IF ads_count = 0 AND banners_count = 0 AND cars_count = 0 THEN
    RAISE NOTICE 'Nenhuma URL antiga encontrada. Script já foi executado ou URLs já estão corretas.';
    RETURN;
  END IF;
  
  -- Atualizar URLs em ADS
  UPDATE public.ads SET 
    image_url_home = REPLACE(image_url_home, old_url, new_url),
    image_url_search = REPLACE(image_url_search, old_url, new_url)
  WHERE image_url_home LIKE old_url || '%' 
     OR image_url_search LIKE old_url || '%';
  
  GET DIAGNOSTICS ads_count = ROW_COUNT;
  RAISE NOTICE 'Ads atualizados: %', ads_count;
  
  -- Atualizar URLs em BANNERS
  UPDATE public.banners SET 
    image_url = REPLACE(image_url, old_url, new_url),
    image_desktop = REPLACE(image_desktop, old_url, new_url),
    image_mobile = REPLACE(image_mobile, old_url, new_url)
  WHERE image_url LIKE old_url || '%' 
     OR image_desktop LIKE old_url || '%'
     OR image_mobile LIKE old_url || '%';
  
  GET DIAGNOSTICS banners_count = ROW_COUNT;
  RAISE NOTICE 'Banners atualizados: %', banners_count;
  
  -- Atualizar URLs em CARS (array de photos)
  UPDATE public.cars SET 
    photos = (
      SELECT array_agg(REPLACE(photo, old_url, new_url))
      FROM unnest(photos) AS photo
    )
  WHERE photos IS NOT NULL 
    AND array_to_string(photos, ',') LIKE '%' || old_url || '%';
  
  GET DIAGNOSTICS cars_count = ROW_COUNT;
  RAISE NOTICE 'Cars atualizados: %', cars_count;

  RAISE NOTICE '✅ Atualização concluída!';
END $$;

-- ============================================================
-- VERIFICAÇÃO FINAL
-- ============================================================

-- Verificar se ainda existem URLs antigas
SELECT 'ads com URL antiga' as tabela, COUNT(*) as total 
FROM ads 
WHERE image_url_home LIKE '%kgtscjvgipowuvuindxt%' 
   OR image_url_search LIKE '%kgtscjvgipowuvuindxt%'
UNION ALL
SELECT 'banners com URL antiga', COUNT(*) 
FROM banners 
WHERE image_url LIKE '%kgtscjvgipowuvuindxt%'
   OR image_desktop LIKE '%kgtscjvgipowuvuindxt%'
   OR image_mobile LIKE '%kgtscjvgipowuvuindxt%'
UNION ALL
SELECT 'cars com URL antiga', COUNT(*) 
FROM cars 
WHERE array_to_string(photos, ',') LIKE '%kgtscjvgipowuvuindxt%';

-- ============================================================
-- RESUMO ESPERADO APÓS EXECUÇÃO:
-- ============================================================
-- ads com URL antiga    | 0
-- banners com URL antiga| 0  
-- cars com URL antiga   | 0
-- ============================================================
