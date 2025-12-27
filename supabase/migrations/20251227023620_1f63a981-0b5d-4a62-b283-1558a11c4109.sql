-- Add slug column to cars table
ALTER TABLE public.cars ADD COLUMN slug TEXT;

-- Create unique index on slug
CREATE UNIQUE INDEX cars_slug_unique ON public.cars(slug) WHERE slug IS NOT NULL;

-- Create function to generate slug from car data
CREATE OR REPLACE FUNCTION generate_car_slug(p_brand_name TEXT, p_model TEXT, p_version TEXT, p_year INTEGER)
RETURNS TEXT AS $$
DECLARE
  base_slug TEXT;
BEGIN
  -- Build base slug from brand, model, version, and year
  base_slug := LOWER(
    COALESCE(p_brand_name, '') || ' ' ||
    COALESCE(p_model, '') || ' ' ||
    COALESCE(p_version, '') || ' ' ||
    COALESCE(p_year::TEXT, '')
  );
  
  -- Remove accents
  base_slug := translate(base_slug, 'áàâãäåéèêëíìîïóòôõöúùûüñç', 'aaaaaaeeeeiiiiooooouuuunc');
  
  -- Remove special characters and replace spaces with hyphens
  base_slug := regexp_replace(base_slug, '[^a-z0-9\s-]', '', 'g');
  base_slug := regexp_replace(base_slug, '\s+', '-', 'g');
  base_slug := regexp_replace(base_slug, '-+', '-', 'g');
  base_slug := trim(both '-' from base_slug);
  
  RETURN base_slug;
END;
$$ LANGUAGE plpgsql IMMUTABLE SET search_path = public;

-- Update existing cars with slugs (handling potential duplicates by appending code)
UPDATE public.cars c
SET slug = subquery.new_slug
FROM (
  SELECT 
    c.id,
    CASE 
      WHEN COUNT(*) OVER (PARTITION BY generate_car_slug(b.name, c.model, c.version, c.year)) > 1 
      THEN generate_car_slug(b.name, c.model, c.version, c.year) || '-' || c.code
      ELSE generate_car_slug(b.name, c.model, c.version, c.year)
    END as new_slug
  FROM public.cars c
  JOIN public.brands b ON c.brand_id = b.id
) subquery
WHERE c.id = subquery.id;

-- Create trigger to auto-generate slug on insert/update
CREATE OR REPLACE FUNCTION set_car_slug()
RETURNS TRIGGER AS $$
DECLARE
  brand_name TEXT;
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  -- Get brand name
  SELECT name INTO brand_name FROM public.brands WHERE id = NEW.brand_id;
  
  -- Generate base slug
  base_slug := generate_car_slug(brand_name, NEW.model, NEW.version, NEW.year);
  final_slug := base_slug;
  
  -- Check for duplicates and append code if needed
  WHILE EXISTS (SELECT 1 FROM public.cars WHERE slug = final_slug AND id != NEW.id) LOOP
    final_slug := base_slug || '-' || NEW.code;
    EXIT; -- Use code as unique suffix
  END LOOP;
  
  NEW.slug := final_slug;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_set_car_slug ON public.cars;
CREATE TRIGGER trigger_set_car_slug
BEFORE INSERT OR UPDATE OF model, version, year, brand_id ON public.cars
FOR EACH ROW
EXECUTE FUNCTION set_car_slug();