-- Add slug column to ads table for SEO-friendly URLs
ALTER TABLE public.ads ADD COLUMN slug text;

-- Create unique index for slug (only for non-null values)
CREATE UNIQUE INDEX ads_slug_unique ON public.ads (slug) WHERE slug IS NOT NULL;

-- Create function to normalize slug (lowercase, no accents, no special chars)
CREATE OR REPLACE FUNCTION public.normalize_slug(input_text text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
SET search_path TO 'public'
AS $$
DECLARE
  normalized TEXT;
BEGIN
  -- Convert to lowercase
  normalized := LOWER(COALESCE(input_text, ''));
  
  -- Remove accents
  normalized := translate(normalized, 'áàâãäåéèêëíìîïóòôõöúùûüñç', 'aaaaaaeeeeiiiiooooouuuunc');
  
  -- Remove special characters except alphanumeric and hyphens
  normalized := regexp_replace(normalized, '[^a-z0-9\s-]', '', 'g');
  
  -- Replace spaces with hyphens
  normalized := regexp_replace(normalized, '\s+', '-', 'g');
  
  -- Remove multiple consecutive hyphens
  normalized := regexp_replace(normalized, '-+', '-', 'g');
  
  -- Trim hyphens from start and end
  normalized := trim(both '-' from normalized);
  
  RETURN normalized;
END;
$$;