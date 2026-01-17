-- Allow clients to view exercises that are assigned to them through client_exercises
CREATE POLICY "Clients can view their assigned exercises" 
ON public.exercises 
FOR SELECT 
USING (
  has_role(auth.uid(), 'client'::app_role) AND
  EXISTS (
    SELECT 1 FROM public.client_exercises ce
    WHERE ce.exercise_id = exercises.id AND ce.client_id = auth.uid()
  )
);