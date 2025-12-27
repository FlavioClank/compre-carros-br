-- ============================================
-- RESTORE CORRECT LISTING + TOTAL ISOLATION (cars)
-- NO VIEW. NO SECURITY DEFINER. POLICIES NON-CONFLICTING.
-- ============================================

-- 1) Ensure CASCADE DELETE: recreate FK cars.garage_id -> garages.id
ALTER TABLE public.cars DROP CONSTRAINT IF EXISTS cars_garage_id_fkey;
ALTER TABLE public.cars
  ADD CONSTRAINT cars_garage_id_fkey
  FOREIGN KEY (garage_id)
  REFERENCES public.garages(id)
  ON DELETE CASCADE;

-- 2) Drop ALL existing RLS policies on public.cars (avoid OR conflicts)
DO $$
DECLARE
  p record;
BEGIN
  FOR p IN (
    SELECT policyname
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'cars'
  ) LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.cars', p.policyname);
  END LOOP;
END $$;

-- 3) Create ONLY the required policies (separated)

-- A) PUBLIC (anon): list/details for available cars from active garages
CREATE POLICY "Public (anon) can view available cars"
ON public.cars
FOR SELECT
TO anon
USING (
  status = 'available'::car_status
  AND garage_is_active = true
);

-- A2) PUBLIC (authenticated but NOT garage): keep public browsing working for non-garage users
-- (prevents garage users from matching public policy and seeing other garages' cars)
CREATE POLICY "Public (authenticated non-garage) can view available cars"
ON public.cars
FOR SELECT
TO authenticated
USING (
  status = 'available'::car_status
  AND garage_is_active = true
  AND NOT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
      AND ur.role = 'garage'::app_role
  )
);

-- B1) GARAGE: SELECT only own cars
CREATE POLICY "Garage can view own cars"
ON public.cars
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
      AND ur.role = 'garage'::app_role
  )
  AND garage_id IN (
    SELECT g.id
    FROM public.garages g
    WHERE g.user_id = auth.uid()
  )
);

-- B2) GARAGE: INSERT only own cars
CREATE POLICY "Garage can insert own cars"
ON public.cars
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
      AND ur.role = 'garage'::app_role
  )
  AND garage_id IN (
    SELECT g.id
    FROM public.garages g
    WHERE g.user_id = auth.uid()
  )
);

-- B3) GARAGE: UPDATE only own cars
CREATE POLICY "Garage can update own cars"
ON public.cars
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
      AND ur.role = 'garage'::app_role
  )
  AND garage_id IN (
    SELECT g.id
    FROM public.garages g
    WHERE g.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
      AND ur.role = 'garage'::app_role
  )
  AND garage_id IN (
    SELECT g.id
    FROM public.garages g
    WHERE g.user_id = auth.uid()
  )
);

-- C) SUPER ADMIN: FOR ALL, unrestricted
CREATE POLICY "Super admin full access on cars"
ON public.cars
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
      AND ur.role = 'super_admin'::app_role
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
      AND ur.role = 'super_admin'::app_role
  )
);

-- 4) Ensure garage_is_active stays consistent WITHOUT SECURITY DEFINER

-- Set garage_is_active on car insert / garage_id change
CREATE OR REPLACE FUNCTION public.cars_set_garage_is_active()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  SELECT g.is_active
    INTO NEW.garage_is_active
  FROM public.garages g
  WHERE g.id = NEW.garage_id;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_car_garage_is_active ON public.cars;
CREATE TRIGGER set_car_garage_is_active
BEFORE INSERT OR UPDATE OF garage_id
ON public.cars
FOR EACH ROW
EXECUTE FUNCTION public.cars_set_garage_is_active();

-- Sync all cars when a garage is activated/deactivated
CREATE OR REPLACE FUNCTION public.garages_sync_cars_garage_is_active()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF OLD.is_active IS DISTINCT FROM NEW.is_active THEN
    UPDATE public.cars
    SET garage_is_active = NEW.is_active
    WHERE garage_id = NEW.id;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS sync_garage_is_active ON public.garages;
CREATE TRIGGER sync_garage_is_active
AFTER UPDATE OF is_active
ON public.garages
FOR EACH ROW
EXECUTE FUNCTION public.garages_sync_cars_garage_is_active();
