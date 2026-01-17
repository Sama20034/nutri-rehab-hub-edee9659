-- Add status column to profiles table for user approval workflow
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'suspended'));

-- Add selected_package column to store the user's chosen package
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS selected_package text;

-- Add payment_method column
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS payment_method text;

-- Add medical_followup column to indicate if user wants medical followup
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS medical_followup boolean DEFAULT false;

-- Update existing profiles to be approved (so existing users aren't locked out)
UPDATE public.profiles SET status = 'approved' WHERE status IS NULL;