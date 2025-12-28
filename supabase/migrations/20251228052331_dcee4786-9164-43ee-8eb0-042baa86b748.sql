-- Add category column to brands table to distinguish car/motorcycle brands
ALTER TABLE public.brands 
ADD COLUMN category text NOT NULL DEFAULT 'car' 
CHECK (category IN ('car', 'motorcycle'));

-- Create index for category filtering
CREATE INDEX idx_brands_category ON public.brands(category);