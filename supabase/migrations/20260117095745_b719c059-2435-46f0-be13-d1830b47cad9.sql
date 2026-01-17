-- Create receipts storage bucket for payment receipts
INSERT INTO storage.buckets (id, name, public) 
VALUES ('receipts', 'receipts', false)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for receipts bucket
-- Users can upload their own receipts
CREATE POLICY "Users can upload receipts" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'receipts' AND auth.uid() IS NOT NULL);

-- Users can view their own receipts
CREATE POLICY "Users can view own receipts" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'receipts' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Admins can view all receipts
CREATE POLICY "Admins can view all receipts" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'receipts' AND EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

-- Create payments table to track payment submissions
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'EGP',
  payment_method TEXT NOT NULL,
  payment_type TEXT NOT NULL CHECK (payment_type IN ('manual', 'electronic')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected')),
  receipt_url TEXT,
  sender_name TEXT,
  sender_phone TEXT,
  notes TEXT,
  package_id TEXT,
  verified_by UUID,
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Users can create their own payments
CREATE POLICY "Users can create own payments" 
ON public.payments 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can view their own payments
CREATE POLICY "Users can view own payments" 
ON public.payments 
FOR SELECT 
USING (auth.uid() = user_id);

-- Admins can manage all payments
CREATE POLICY "Admins can manage all payments" 
ON public.payments 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

-- Create trigger for updated_at
CREATE TRIGGER update_payments_updated_at
BEFORE UPDATE ON public.payments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();