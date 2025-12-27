-- 1. Add garage_is_active column to cars table
ALTER TABLE public.cars ADD COLUMN IF NOT EXISTS garage_is_active boolean NOT NULL DEFAULT true;

-- 2. Sync existing data from garages
UPDATE public.cars c
SET garage_is_active = g.is_active
FROM public.garages g
WHERE c.garage_id = g.id;

-- 3. Create function to sync garage_is_active when garage changes
CREATE OR REPLACE FUNCTION public.sync_garage_is_active()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- When garage is_active changes, update all cars from that garage
  IF OLD.is_active IS DISTINCT FROM NEW.is_active THEN
    UPDATE public.cars
    SET garage_is_active = NEW.is_active
    WHERE garage_id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$;

-- 4. Create trigger on garages table
DROP TRIGGER IF EXISTS trigger_sync_garage_is_active ON public.garages;
CREATE TRIGGER trigger_sync_garage_is_active
  AFTER UPDATE ON public.garages
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_garage_is_active();

-- 5. Create function to set garage_is_active on new car insert
CREATE OR REPLACE FUNCTION public.set_car_garage_is_active()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  SELECT is_active INTO NEW.garage_is_active
  FROM public.garages
  WHERE id = NEW.garage_id;
  RETURN NEW;
END;
$$;

-- 6. Create trigger on cars table for inserts
DROP TRIGGER IF EXISTS trigger_set_car_garage_is_active ON public.cars;
CREATE TRIGGER trigger_set_car_garage_is_active
  BEFORE INSERT ON public.cars
  FOR EACH ROW
  EXECUTE FUNCTION public.set_car_garage_is_active();

-- 7. Drop the problematic public policy with EXISTS
DROP POLICY IF EXISTS "Public can view available cars from active garages" ON public.cars;

-- 8. Create simple public policy without EXISTS
CREATE POLICY "Public can view available cars"
ON public.cars
FOR SELECT
TO anon, authenticated
USING (status = 'available' AND garage_is_active = true);