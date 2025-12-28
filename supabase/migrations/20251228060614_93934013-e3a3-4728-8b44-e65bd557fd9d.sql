-- Remove old unique constraint on name only (we already have unique on name+category)
ALTER TABLE public.brands DROP CONSTRAINT IF EXISTS brands_name_key;