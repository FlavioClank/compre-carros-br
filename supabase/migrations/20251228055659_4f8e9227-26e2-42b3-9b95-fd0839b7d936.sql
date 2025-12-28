-- Fix database linter warnings: set immutable search_path on functions

CREATE OR REPLACE FUNCTION public.cars_set_garage_is_active()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  SELECT g.is_active
    INTO NEW.garage_is_active
  FROM public.garages g
  WHERE g.id = NEW.garage_id;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.garages_sync_cars_garage_is_active()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
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
