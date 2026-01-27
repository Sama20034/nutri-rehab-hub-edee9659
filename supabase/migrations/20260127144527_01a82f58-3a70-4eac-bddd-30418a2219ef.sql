-- Create client_progress table to track daily progress
CREATE TABLE public.client_progress (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    exercises_completed INTEGER DEFAULT 0,
    exercises_total INTEGER DEFAULT 0,
    meals_completed INTEGER DEFAULT 0,
    meals_total INTEGER DEFAULT 4, -- breakfast, lunch, dinner, snack
    progress_percentage INTEGER DEFAULT 0,
    notes TEXT,
    admin_feedback TEXT,
    updated_by UUID,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(client_id, date)
);

-- Enable RLS
ALTER TABLE public.client_progress ENABLE ROW LEVEL SECURITY;

-- Clients can view their own progress
CREATE POLICY "Clients can view own progress"
ON public.client_progress
FOR SELECT
USING (auth.uid() = client_id);

-- Clients can insert/update their own progress
CREATE POLICY "Clients can manage own progress"
ON public.client_progress
FOR ALL
USING (auth.uid() = client_id)
WITH CHECK (auth.uid() = client_id);

-- Admins can view and manage all progress
CREATE POLICY "Admins can manage all progress"
ON public.client_progress
FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Create trigger for updated_at
CREATE TRIGGER update_client_progress_updated_at
    BEFORE UPDATE ON public.client_progress
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Add meal_completed tracking to meal_plans for client-specific completion
CREATE TABLE public.client_meal_tracking (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID NOT NULL,
    meal_plan_id UUID REFERENCES public.meal_plans(id) ON DELETE CASCADE,
    meal_type TEXT NOT NULL, -- breakfast, lunch, dinner, snack
    completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMP WITH TIME ZONE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(client_id, meal_plan_id, meal_type, date)
);

-- Enable RLS
ALTER TABLE public.client_meal_tracking ENABLE ROW LEVEL SECURITY;

-- Clients can view and update their own meal tracking
CREATE POLICY "Clients can view own meal tracking"
ON public.client_meal_tracking
FOR SELECT
USING (auth.uid() = client_id);

CREATE POLICY "Clients can manage own meal tracking"
ON public.client_meal_tracking
FOR ALL
USING (auth.uid() = client_id)
WITH CHECK (auth.uid() = client_id);

-- Admins can manage all meal tracking
CREATE POLICY "Admins can manage all meal tracking"
ON public.client_meal_tracking
FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));