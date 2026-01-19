-- Add new columns to transformations table to match the displayed data
ALTER TABLE public.transformations
ADD COLUMN IF NOT EXISTS client_name TEXT,
ADD COLUMN IF NOT EXISTS weight_before NUMERIC,
ADD COLUMN IF NOT EXISTS weight_after NUMERIC,
ADD COLUMN IF NOT EXISTS duration_text TEXT,
ADD COLUMN IF NOT EXISTS rating INTEGER DEFAULT 5;