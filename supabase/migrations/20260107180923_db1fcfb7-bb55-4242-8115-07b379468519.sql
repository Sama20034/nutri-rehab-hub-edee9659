-- Fix the permissive INSERT policy for notifications
DROP POLICY IF EXISTS "Anyone can create notifications" ON public.notifications;

-- Create a more secure policy - allow authenticated users to create notifications for others
CREATE POLICY "Authenticated users can create notifications"
ON public.notifications FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);