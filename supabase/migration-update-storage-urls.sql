-- ============================================================
-- SCRIPT DE ATUALIZAÇÃO DE URLs DE STORAGE
-- ============================================================
--
-- Execute este script APÓS migrar os arquivos do Storage
-- Substitua 'SEU_PROJECT_ID' pelo ID do seu Supabase externo
--
-- ============================================================

-- Defina seu novo project ID aqui:
DO $$
DECLARE
  old_url TEXT := 'https://kgtscjvgipowuvuindxt.supabase.co';
  new_url TEXT := 'https://SEU_PROJECT_ID.supabase.co'; -- ⚠️ ALTERAR AQUI!
BEGIN
  
  -- Atualizar URLs em ADS
  UPDATE public.ads SET 
    image_url_home = REPLACE(image_url_home, old_url, new_url),
    image_url_search = REPLACE(image_url_search, old_url, new_url)
  WHERE image_url_home LIKE old_url || '%' 
     OR image_url_search LIKE old_url || '%';
  
  RAISE NOTICE 'Ads atualizados: %', (SELECT COUNT(*) FROM ads WHERE image_url_home LIKE new_url || '%');
  
  -- Atualizar URLs em BANNERS
  UPDATE public.banners SET 
    image_url = REPLACE(image_url, old_url, new_url),
    image_desktop = REPLACE(image_desktop, old_url, new_url),
    image_mobile = REPLACE(image_mobile, old_url, new_url)
  WHERE image_url LIKE old_url || '%' 
     OR image_desktop LIKE old_url || '%'
     OR image_mobile LIKE old_url || '%';
  
  RAISE NOTICE 'Banners atualizados: %', (SELECT COUNT(*) FROM banners WHERE image_url LIKE new_url || '%');
  
  -- Atualizar URLs em CARS (array de photos)
  UPDATE public.cars SET 
    photos = (
      SELECT array_agg(REPLACE(photo, old_url, new_url))
      FROM unnest(photos) AS photo
    )
  WHERE photos IS NOT NULL 
    AND array_to_string(photos, ',') LIKE '%' || old_url || '%';
  
  RAISE NOTICE 'Cars atualizados: %', (SELECT COUNT(*) FROM cars WHERE array_to_string(photos, ',') LIKE '%' || new_url || '%');

END $$;

-- ============================================================
-- VERIFICAÇÃO
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
