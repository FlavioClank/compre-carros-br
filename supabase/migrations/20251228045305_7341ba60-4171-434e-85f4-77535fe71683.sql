-- Add category column to cars table
ALTER TABLE public.cars 
ADD COLUMN category text NOT NULL DEFAULT 'car' 
CHECK (category IN ('car', 'motorcycle'));

-- Create index for category filtering
CREATE INDEX idx_cars_category ON public.cars(category);