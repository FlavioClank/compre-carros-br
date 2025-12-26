-- Add is_featured column to cars table for featured vehicles
ALTER TABLE public.cars ADD COLUMN IF NOT EXISTS is_featured boolean NOT NULL DEFAULT false;

-- Create index for faster featured car queries
CREATE INDEX IF NOT EXISTS idx_cars_is_featured ON public.cars(is_featured) WHERE is_featured = true;

-- Update RLS policy to include is_featured in public view
DROP POLICY IF EXISTS "Anyone can view available cars" ON public.cars;
CREATE POLICY "Anyone can view available cars from active garages" ON public.cars
FOR SELECT
USING (
  status = 'available'::car_status 
  AND EXISTS (
    SELECT 1 FROM public.garages 
    WHERE garages.id = cars.garage_id 
    AND garages.is_active = true
  )
);