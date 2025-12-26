-- Add permission column to garages table
ALTER TABLE public.garages 
ADD COLUMN can_add_vehicles boolean NOT NULL DEFAULT true;

-- Update RLS to allow garages to read their own permission
-- (already covered by existing policies)