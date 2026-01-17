-- Allow clients to view their assigned doctor's profile
CREATE POLICY "Clients can view their assigned doctor profile"
ON public.profiles
FOR SELECT
USING (
  has_role(auth.uid(), 'client'::app_role) 
  AND EXISTS (
    SELECT 1 FROM client_assignments ca 
    WHERE ca.client_id = auth.uid() 
    AND ca.doctor_id = profiles.user_id 
    AND ca.status = 'active'
  )
);