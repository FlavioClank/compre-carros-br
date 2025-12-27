-- ============================================
-- FIX RLS POLICIES FOR CARS TABLE
-- Make policies PERMISSIVE so they combine with OR
-- ============================================

-- 1. Ensure CASCADE DELETE on garage_id foreign key
ALTER TABLE public.cars DROP CONSTRAINT IF EXISTS cars_garage_id_fkey;
ALTER TABLE public.cars 
  ADD CONSTRAINT cars_garage_id_fkey 
  FOREIGN KEY (garage_id) 
  REFERENCES public.garages(id) 
  ON DELETE CASCADE;

-- 2. Drop ALL existing policies on cars table
DROP POLICY IF EXISTS "Public can view available cars" ON public.cars;
DROP POLICY IF EXISTS "Garage can view own cars" ON public.cars;
DROP POLICY IF EXISTS "Garage can insert own cars" ON public.cars;
DROP POLICY IF EXISTS "Garage can update own cars" ON public.cars;
DROP POLICY IF EXISTS "Super admin can manage all cars" ON public.cars;
DROP POLICY IF EXISTS "Anyone can view available cars" ON public.cars;
DROP POLICY IF EXISTS "Super admin can delete cars" ON public.cars;

-- 3. Create PERMISSIVE policies (combine with OR)

-- A) PUBLIC: SELECT available cars from active garages
-- Uses garage_is_active column to avoid EXISTS on garages table
CREATE POLICY "Public can view available cars"
ON public.cars
FOR SELECT
TO anon, authenticated
USING (
  status = 'available' 
  AND garage_is_active = true
);

-- B) GARAGE: SELECT own cars only
CREATE POLICY "Garage can view own cars"
ON public.cars
FOR SELECT
TO authenticated
USING (
  is_garage() 
  AND garage_id = get_user_garage_id()
);

-- C) GARAGE: INSERT own cars only
CREATE POLICY "Garage can insert own cars"
ON public.cars
FOR INSERT
TO authenticated
WITH CHECK (
  is_garage() 
  AND garage_id = get_user_garage_id()
);

-- D) GARAGE: UPDATE own cars only
CREATE POLICY "Garage can update own cars"
ON public.cars
FOR UPDATE
TO authenticated
USING (
  is_garage() 
  AND garage_id = get_user_garage_id()
)
WITH CHECK (
  is_garage() 
  AND garage_id = get_user_garage_id()
);

-- E) SUPER ADMIN: Full access to all cars (SELECT, INSERT, UPDATE, DELETE)
CREATE POLICY "Super admin can manage all cars"
ON public.cars
FOR ALL
TO authenticated
USING (is_super_admin())
WITH CHECK (is_super_admin());