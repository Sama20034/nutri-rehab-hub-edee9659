-- Create recipes table for nutrition content
CREATE TABLE public.recipes (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT, -- breakfast, lunch, dinner, snack
    meal_type TEXT, -- الإفطار، الغداء، العشاء، سناكس
    calories INTEGER,
    protein_g DECIMAL(5,1),
    carbs_g DECIMAL(5,1),
    fat_g DECIMAL(5,1),
    prep_time_minutes INTEGER,
    cook_time_minutes INTEGER,
    ingredients JSONB, -- Array of ingredients with quantities
    instructions JSONB, -- Array of step-by-step instructions
    image_url TEXT,
    video_url TEXT,
    difficulty TEXT DEFAULT 'easy', -- easy, medium, hard
    tags TEXT[],
    package_type TEXT, -- basic, premium, vip - which packages can see this
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create client_recipes for assigned recipes
CREATE TABLE public.client_recipes (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID NOT NULL,
    recipe_id UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
    assigned_by UUID,
    day_of_week INTEGER, -- 0-6 (Sunday-Saturday)
    meal_type TEXT, -- breakfast, lunch, dinner, snack
    completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create meal_plans table for daily structured plans
CREATE TABLE public.meal_plans (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    package_type TEXT, -- basic, premium, vip
    day_number INTEGER, -- Day 1, Day 2, etc.
    breakfast JSONB, -- {recipe_id, title, calories, time}
    lunch JSONB,
    dinner JSONB,
    snacks JSONB[], -- Array of snacks
    total_calories INTEGER,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_plans ENABLE ROW LEVEL SECURITY;

-- RLS policies for recipes
CREATE POLICY "Users can view recipes matching their package" 
ON public.recipes 
FOR SELECT 
USING (true);

CREATE POLICY "Doctors and admins can manage recipes" 
ON public.recipes 
FOR ALL 
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'doctor'));

-- RLS policies for client_recipes
CREATE POLICY "Clients can view own recipes" 
ON public.client_recipes 
FOR SELECT 
USING (auth.uid() = client_id);

CREATE POLICY "Clients can update own recipes" 
ON public.client_recipes 
FOR UPDATE 
USING (auth.uid() = client_id);

CREATE POLICY "Doctors can manage client recipes" 
ON public.client_recipes 
FOR ALL 
USING (has_role(auth.uid(), 'doctor') OR has_role(auth.uid(), 'admin'));

-- RLS policies for meal_plans
CREATE POLICY "Users can view meal plans" 
ON public.meal_plans 
FOR SELECT 
USING (true);

CREATE POLICY "Doctors and admins can manage meal plans" 
ON public.meal_plans 
FOR ALL 
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'doctor'));

-- Add update trigger for recipes
CREATE TRIGGER update_recipes_updated_at
    BEFORE UPDATE ON public.recipes
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();