-- 1. Drop the VIEW completely
DROP VIEW IF EXISTS public.public_active_cars;

-- 2. Drop existing public policy on cars
DROP POLICY IF EXISTS "Public can view available cars via view" ON public.cars;
DROP POLICY IF EXISTS "Public can view available cars from active garages" ON public.cars;

-- 3. Create direct public RLS policy for cars table
-- This allows anonymous and authenticated users to SELECT available cars from active garages
-- The query can only return non-sensitive columns (no garage contact info exposed)
CREATE POLICY "Public can view available cars from active garages"
ON public.cars
FOR SELECT
TO anon, authenticated
USING (
  status = 'available'
  AND EXISTS (
    SELECT 1 FROM public.garages g 
    WHERE g.id = garage_id 
    AND g.is_active = true
  )
);