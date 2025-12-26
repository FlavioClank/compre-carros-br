-- Add new columns for expanded filters
ALTER TABLE public.cars ADD COLUMN IF NOT EXISTS doors INTEGER DEFAULT 4;
ALTER TABLE public.cars ADD COLUMN IF NOT EXISTS condition TEXT DEFAULT 'used' CHECK (condition IN ('new', 'used'));

-- Add index for better filter performance
CREATE INDEX IF NOT EXISTS idx_cars_doors ON public.cars(doors);
CREATE INDEX IF NOT EXISTS idx_cars_condition ON public.cars(condition);
CREATE INDEX IF NOT EXISTS idx_cars_color ON public.cars(color);