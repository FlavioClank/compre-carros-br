-- Create internal expenses table for admin tracking
CREATE TABLE public.internal_expenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'outros',
  amount NUMERIC NOT NULL DEFAULT 0,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.internal_expenses ENABLE ROW LEVEL SECURITY;

-- Only super_admin can access this table
CREATE POLICY "Super admin full access on internal_expenses" 
ON public.internal_expenses 
FOR ALL 
USING (is_super_admin())
WITH CHECK (is_super_admin());

-- Block anonymous access
CREATE POLICY "Block anonymous access to internal_expenses" 
ON public.internal_expenses 
FOR ALL 
USING (false)
WITH CHECK (false);

-- Add trigger for updated_at
CREATE TRIGGER update_internal_expenses_updated_at
BEFORE UPDATE ON public.internal_expenses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();