-- Enforce brand uniqueness per vehicle type (case-insensitive)
CREATE UNIQUE INDEX IF NOT EXISTS uniq_brands_name_category
ON public.brands (lower(name), category);
