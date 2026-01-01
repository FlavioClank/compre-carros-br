-- Add metrics_reset_at column to ad_billing for tracking when metrics should reset
ALTER TABLE public.ad_billing 
ADD COLUMN metrics_reset_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Update existing records to have metrics_reset_at set to their created_at
UPDATE public.ad_billing SET metrics_reset_at = created_at WHERE metrics_reset_at IS NULL;

-- Add whatsapp_number column to store company's WhatsApp for direct messaging
ALTER TABLE public.ad_billing 
ADD COLUMN whatsapp_number TEXT;