-- Create storage bucket for videos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('videos', 'videos', true, 104857600, ARRAY['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime', 'video/x-msvideo']);

-- Allow authenticated users to upload videos
CREATE POLICY "Doctors can upload videos"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'videos' 
  AND has_role(auth.uid(), 'doctor'::app_role)
);

-- Allow anyone to view videos (public bucket)
CREATE POLICY "Anyone can view videos"
ON storage.objects
FOR SELECT
USING (bucket_id = 'videos');

-- Allow doctors to delete their own videos
CREATE POLICY "Doctors can delete their videos"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'videos' 
  AND has_role(auth.uid(), 'doctor'::app_role)
);