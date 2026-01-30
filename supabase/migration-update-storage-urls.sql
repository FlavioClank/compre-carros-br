-- =====================================================
-- SCRIPT DE ATUALIZAÇÃO DE URLs DE STORAGE
-- =====================================================
-- Execute este script APÓS migrar os arquivos dos buckets
-- do projeto Cloud (kgtscjvgipowuvuindxt) para o 
-- projeto externo (vpunpbozwidlzukplfts)
-- =====================================================
--
-- ANTES DE EXECUTAR:
-- 1. Baixe todos os arquivos do Cloud:
--    - Bucket: car-photos
--    - Bucket: ad-images  
--    - Bucket: banners
--
-- 2. Faça upload para os mesmos buckets no Supabase externo
--    mantendo a mesma estrutura de pastas
--
-- 3. Então execute este script para atualizar as URLs
-- =====================================================

-- Variáveis para facilitar a substituição
-- OLD_URL: https://kgtscjvgipowuvuindxt.supabase.co
-- NEW_URL: https://vpunpbozwidlzukplfts.supabase.co

-- =====================================================
-- 1. ATUALIZAR URLs DAS FOTOS DOS CARROS
-- =====================================================
UPDATE public.cars
SET photos = (
  SELECT array_agg(
    REPLACE(photo, 'kgtscjvgipowuvuindxt', 'vpunpbozwidlzukplfts')
  )
  FROM unnest(photos) AS photo
)
WHERE photos IS NOT NULL 
  AND array_length(photos, 1) > 0
  AND EXISTS (
    SELECT 1 FROM unnest(photos) AS p 
    WHERE p LIKE '%kgtscjvgipowuvuindxt%'
  );

-- =====================================================
-- 2. ATUALIZAR URLs DAS IMAGENS DOS ANÚNCIOS (ADS)
-- =====================================================
UPDATE public.ads
SET 
  image_url_home = REPLACE(image_url_home, 'kgtscjvgipowuvuindxt', 'vpunpbozwidlzukplfts'),
  image_url_search = REPLACE(image_url_search, 'kgtscjvgipowuvuindxt', 'vpunpbozwidlzukplfts')
WHERE 
  image_url_home LIKE '%kgtscjvgipowuvuindxt%'
  OR image_url_search LIKE '%kgtscjvgipowuvuindxt%';

-- =====================================================
-- 3. ATUALIZAR URLs DOS BANNERS
-- =====================================================
UPDATE public.banners
SET 
  image_url = REPLACE(image_url, 'kgtscjvgipowuvuindxt', 'vpunpbozwidlzukplfts'),
  image_desktop = REPLACE(image_desktop, 'kgtscjvgipowuvuindxt', 'vpunpbozwidlzukplfts'),
  image_mobile = REPLACE(image_mobile, 'kgtscjvgipowuvuindxt', 'vpunpbozwidlzukplfts')
WHERE 
  image_url LIKE '%kgtscjvgipowuvuindxt%'
  OR image_desktop LIKE '%kgtscjvgipowuvuindxt%'
  OR image_mobile LIKE '%kgtscjvgipowuvuindxt%';

-- =====================================================
-- 4. VERIFICAR ATUALIZAÇÃO
-- =====================================================
-- Execute estas queries para verificar se ainda há URLs antigas:

-- SELECT id, photos[1] FROM cars WHERE photos[1] LIKE '%kgtscjvgipowuvuindxt%';
-- SELECT id, image_url_home FROM ads WHERE image_url_home LIKE '%kgtscjvgipowuvuindxt%';
-- SELECT id, image_url FROM banners WHERE image_url LIKE '%kgtscjvgipowuvuindxt%';

-- Se retornar 0 linhas em cada query, a migração de URLs está completa!
