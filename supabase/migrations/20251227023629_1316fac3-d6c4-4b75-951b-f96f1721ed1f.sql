-- Fix search_path for set_car_slug function
CREATE OR REPLACE FUNCTION public.set_car_slug()
RETURNS TRIGGER AS $$
DECLARE
  brand_name TEXT;
  base_slug TEXT;
  final_slug TEXT;
BEGIN
  -- Get brand name
  SELECT name INTO brand_name FROM public.brands WHERE id = NEW.brand_id;
  
  -- Generate base slug
  base_slug := public.generate_car_slug(brand_name, NEW.model, NEW.version, NEW.year);
  final_slug := base_slug;
  
  -- Check for duplicates and append code if needed
  IF EXISTS (SELECT 1 FROM public.cars WHERE slug = final_slug AND id != NEW.id) THEN
    final_slug := base_slug || '-' || NEW.code;
  END IF;
  
  NEW.slug := final_slug;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;