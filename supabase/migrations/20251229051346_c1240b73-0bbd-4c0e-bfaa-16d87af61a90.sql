-- Add separate image columns for Home and Search
ALTER TABLE public.ads 
ADD COLUMN image_url_home TEXT,
ADD COLUMN image_url_search TEXT;

-- Migrate existing image_url to both new columns (so existing ads work)
UPDATE public.ads 
SET image_url_home = image_url, 
    image_url_search = image_url 
WHERE image_url IS NOT NULL;

-- Drop the description column (no longer needed)
ALTER TABLE public.ads DROP COLUMN IF EXISTS description;

-- Drop the old image_url column after migration
ALTER TABLE public.ads DROP COLUMN IF EXISTS image_url;