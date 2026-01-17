-- Allow clients to view diet plans that are assigned to them
CREATE POLICY "Clients can view their assigned diet plans" 
ON public.diet_plans 
FOR SELECT 
USING (
  has_role(auth.uid(), 'client'::app_role) AND
  EXISTS (
    SELECT 1 FROM public.client_diet_plans cdp
    WHERE cdp.diet_plan_id = diet_plans.id AND cdp.client_id = auth.uid()
  )
);