-- Create client_meal_plans table for assigning meal plans to clients
CREATE TABLE public.client_meal_plans (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID NOT NULL,
    meal_plan_id UUID NOT NULL REFERENCES public.meal_plans(id) ON DELETE CASCADE,
    assigned_by UUID,
    start_date DATE DEFAULT CURRENT_DATE,
    end_date DATE,
    status VARCHAR(20) DEFAULT 'active',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.client_meal_plans ENABLE ROW LEVEL SECURITY;

-- Create policies for client_meal_plans
CREATE POLICY "Admins and doctors can manage client meal plan assignments"
ON public.client_meal_plans
FOR ALL
TO authenticated
USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'doctor')
)
WITH CHECK (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'doctor')
);

CREATE POLICY "Clients can view their own meal plan assignments"
ON public.client_meal_plans
FOR SELECT
TO authenticated
USING (client_id = auth.uid());

-- Create index for faster queries
CREATE INDEX idx_client_meal_plans_client_id ON public.client_meal_plans(client_id);
CREATE INDEX idx_client_meal_plans_meal_plan_id ON public.client_meal_plans(meal_plan_id);