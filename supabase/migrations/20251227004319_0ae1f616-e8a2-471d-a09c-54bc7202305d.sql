-- 1. Add ON DELETE CASCADE for cars when garage is deleted
-- First, drop the existing foreign key if it exists
ALTER TABLE public.cars DROP CONSTRAINT IF EXISTS cars_garage_id_fkey;

-- Recreate with CASCADE
ALTER TABLE public.cars 
ADD CONSTRAINT cars_garage_id_fkey 
FOREIGN KEY (garage_id) REFERENCES public.garages(id) ON DELETE CASCADE;

-- 2. Drop existing policies on cars that might conflict
DROP POLICY IF EXISTS "Garage can view own cars" ON public.cars;
DROP POLICY IF EXISTS "Garage can insert own cars" ON public.cars;
DROP POLICY IF EXISTS "Garage can update own cars" ON public.cars;

-- 3. Recreate garage policies to ensure STRICT isolation
-- Garage can ONLY see their own cars (using get_user_garage_id())
CREATE POLICY "Garage can view own cars"
ON public.cars
FOR SELECT
TO authenticated
USING (
  is_garage() AND garage_id = get_user_garage_id()
);

-- Garage can INSERT only their own cars
CREATE POLICY "Garage can insert own cars"
ON public.cars
FOR INSERT
TO authenticated
WITH CHECK (
  is_garage() AND garage_id = get_user_garage_id()
);

-- Garage can UPDATE only their own cars
CREATE POLICY "Garage can update own cars"
ON public.cars
FOR UPDATE
TO authenticated
USING (
  is_garage() AND garage_id = get_user_garage_id()
)
WITH CHECK (
  is_garage() AND garage_id = get_user_garage_id()
);

-- 4. Ensure super admin can delete cars
DROP POLICY IF EXISTS "Super admin can manage all cars" ON public.cars;
CREATE POLICY "Super admin can manage all cars"
ON public.cars
FOR ALL
TO authenticated
USING (is_super_admin())
WITH CHECK (is_super_admin());

-- 5. Public policy remains unchanged (already correct)
-- "Public can view available cars" - status = 'available' AND garage_is_active = true