-- Add RLS policy for clients to view videos they're assigned
CREATE POLICY "Clients can view their assigned videos data" ON public.videos
  FOR SELECT USING (
    has_role(auth.uid(), 'client'::app_role) AND 
    EXISTS (
      SELECT 1 FROM client_videos cv 
      WHERE cv.video_id = videos.id AND cv.client_id = auth.uid()
    )
  );