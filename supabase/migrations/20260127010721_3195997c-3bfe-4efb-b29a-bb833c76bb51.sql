-- Add new columns for dual-image banner system
ALTER TABLE public.banners
ADD COLUMN image_desktop text,
ADD COLUMN image_mobile text;

-- Migrate existing data: copy image_url to both new columns as default
UPDATE public.banners
SET 
  image_desktop = image_url,
  image_mobile = image_url
WHERE image_url IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.banners.image_desktop IS 'Desktop/Tablet banner image (1920x840px, 16:7 ratio)';
COMMENT ON COLUMN public.banners.image_mobile IS 'Mobile banner image (1080x1440px, 4:3 ratio)';