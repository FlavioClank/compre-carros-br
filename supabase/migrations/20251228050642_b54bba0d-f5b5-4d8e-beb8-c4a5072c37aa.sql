-- Add motorcycle-specific columns to cars table
ALTER TABLE public.cars 
ADD COLUMN IF NOT EXISTS engine_cc INTEGER NULL,
ADD COLUMN IF NOT EXISTS cooling_type TEXT NULL,
ADD COLUMN IF NOT EXISTS motorcycle_category TEXT NULL;

-- Add comments for documentation
COMMENT ON COLUMN public.cars.engine_cc IS 'Motorcycle engine displacement in cc (e.g., 160, 300, 600)';
COMMENT ON COLUMN public.cars.cooling_type IS 'Motorcycle cooling type: air, liquid, oil';
COMMENT ON COLUMN public.cars.motorcycle_category IS 'Motorcycle category: sport, touring, offroad, leisure, urban';

-- Create index for category filtering
CREATE INDEX IF NOT EXISTS idx_cars_category ON public.cars(category);
CREATE INDEX IF NOT EXISTS idx_cars_motorcycle_category ON public.cars(motorcycle_category) WHERE category = 'motorcycle';