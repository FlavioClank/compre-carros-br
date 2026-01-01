-- Tabela de cobrança de anúncios com vencimento fixo
CREATE TABLE public.ad_billing (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ad_id UUID NOT NULL REFERENCES public.ads(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  monthly_fee NUMERIC NOT NULL DEFAULT 0,
  billing_day INTEGER NOT NULL CHECK (billing_day >= 1 AND billing_day <= 31),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(ad_id)
);

-- Tabela de histórico de pagamentos (um registro por mês pago)
CREATE TABLE public.ad_billing_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  billing_id UUID NOT NULL REFERENCES public.ad_billing(id) ON DELETE CASCADE,
  reference_month INTEGER NOT NULL CHECK (reference_month >= 1 AND reference_month <= 12),
  reference_year INTEGER NOT NULL CHECK (reference_year >= 2020),
  paid_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(billing_id, reference_month, reference_year)
);

-- Enable RLS
ALTER TABLE public.ad_billing ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_billing_payments ENABLE ROW LEVEL SECURITY;

-- Policies: Only super_admin can access
CREATE POLICY "Super admin full access on ad_billing" 
ON public.ad_billing 
FOR ALL 
USING (is_super_admin())
WITH CHECK (is_super_admin());

CREATE POLICY "Super admin full access on ad_billing_payments" 
ON public.ad_billing_payments 
FOR ALL 
USING (is_super_admin())
WITH CHECK (is_super_admin());

-- Block anonymous access
CREATE POLICY "Block anonymous access to ad_billing" 
ON public.ad_billing 
FOR ALL 
TO anon
USING (false)
WITH CHECK (false);

CREATE POLICY "Block anonymous access to ad_billing_payments" 
ON public.ad_billing_payments 
FOR ALL 
TO anon
USING (false)
WITH CHECK (false);

-- Trigger for updated_at
CREATE TRIGGER update_ad_billing_updated_at
BEFORE UPDATE ON public.ad_billing
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();

-- Create index for fast lookups
CREATE INDEX idx_ad_billing_ad_id ON public.ad_billing(ad_id);
CREATE INDEX idx_ad_billing_payments_billing_id ON public.ad_billing_payments(billing_id);
CREATE INDEX idx_ad_billing_payments_reference ON public.ad_billing_payments(reference_year, reference_month);