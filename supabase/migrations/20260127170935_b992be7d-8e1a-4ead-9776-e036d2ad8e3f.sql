-- Create storage bucket for uploaded images
INSERT INTO storage.buckets (id, name, public)
VALUES ('uploads', 'uploads', true)
ON CONFLICT (id) DO NOTHING;

-- Create policy to allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'uploads');

-- Create policy to allow public read access
CREATE POLICY "Public read access for uploads"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'uploads');

-- Create policy to allow authenticated users to update their files
CREATE POLICY "Authenticated users can update files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'uploads');

-- Create policy to allow authenticated users to delete files
CREATE POLICY "Authenticated users can delete files"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'uploads');