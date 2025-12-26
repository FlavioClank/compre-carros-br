-- Drop and recreate the public access policy with explicit role
DROP POLICY IF EXISTS "Anyone can view available cars from active garages" ON public.cars;

-- Create a new policy that explicitly allows anonymous and authenticated users to view available cars
CREATE POLICY "Public can view available cars from active garages" 
ON public.cars 
FOR SELECT 
TO anon, authenticated
USING (
  status = 'available'::car_status 
  AND EXISTS (
    SELECT 1 FROM public.garages 
    WHERE garages.id = cars.garage_id 
    AND garages.is_active = true
  )
);