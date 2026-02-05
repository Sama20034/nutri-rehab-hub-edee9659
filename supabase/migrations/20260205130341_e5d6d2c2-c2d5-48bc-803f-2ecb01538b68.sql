-- Add attachment columns to diet_plans table
ALTER TABLE public.diet_plans 
ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS video_urls TEXT[] DEFAULT '{}';

-- Add comment for documentation
COMMENT ON COLUMN public.diet_plans.attachments IS 'Array of file attachments with name and url';
COMMENT ON COLUMN public.diet_plans.video_urls IS 'Array of video URLs (YouTube, etc.)';

-- Create storage bucket for diet plan files if not exists
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'diet-plan-files', 
  'diet-plan-files', 
  true,
  52428800, -- 50MB limit
  ARRAY['application/pdf', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'image/jpeg', 'image/png', 'image/webp', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for diet-plan-files bucket
CREATE POLICY "Authenticated users can upload diet plan files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'diet-plan-files');

CREATE POLICY "Authenticated users can update their diet plan files"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'diet-plan-files');

CREATE POLICY "Authenticated users can delete diet plan files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'diet-plan-files');

CREATE POLICY "Diet plan files are publicly accessible"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'diet-plan-files');