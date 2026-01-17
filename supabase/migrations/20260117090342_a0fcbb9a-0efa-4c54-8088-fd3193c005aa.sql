-- Create app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'doctor', 'client');

-- Create profiles table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    full_name TEXT,
    phone TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create user_roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    UNIQUE (user_id, role)
);

-- Create articles table
CREATE TABLE public.articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    content TEXT,
    excerpt TEXT,
    cover_image TEXT,
    category TEXT,
    status TEXT DEFAULT 'draft',
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create doctor_schedules table
CREATE TABLE public.doctor_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doctor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create client_assignments table
CREATE TABLE public.client_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    doctor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    assigned_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    status TEXT DEFAULT 'active',
    UNIQUE (client_id, doctor_id)
);

-- Create conversations table
CREATE TABLE public.conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    doctor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    last_message_at TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    UNIQUE (client_id, doctor_id)
);

-- Create messages table
CREATE TABLE public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
    sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create diet_plans table
CREATE TABLE public.diet_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    goal TEXT,
    calories_min INTEGER,
    calories_max INTEGER,
    duration_weeks INTEGER,
    status TEXT DEFAULT 'active',
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create client_diet_plans table
CREATE TABLE public.client_diet_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    diet_plan_id UUID REFERENCES public.diet_plans(id) ON DELETE CASCADE NOT NULL,
    start_date DATE,
    end_date DATE,
    status TEXT DEFAULT 'active',
    assigned_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create exercises table
CREATE TABLE public.exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    video_url TEXT,
    image_url TEXT,
    category TEXT,
    difficulty TEXT,
    duration_minutes INTEGER,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create client_exercises table
CREATE TABLE public.client_exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    exercise_id UUID REFERENCES public.exercises(id) ON DELETE CASCADE NOT NULL,
    assigned_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create videos table
CREATE TABLE public.videos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    url TEXT NOT NULL,
    thumbnail_url TEXT,
    category TEXT,
    duration_seconds INTEGER,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create client_videos table
CREATE TABLE public.client_videos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    video_id UUID REFERENCES public.videos(id) ON DELETE CASCADE NOT NULL,
    assigned_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    watched BOOLEAN DEFAULT false,
    watched_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create appointments table
CREATE TABLE public.appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    doctor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    scheduled_at TIMESTAMPTZ NOT NULL,
    duration_minutes INTEGER DEFAULT 30,
    status TEXT DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create notifications table
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    message TEXT,
    type TEXT,
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctor_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diet_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_diet_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create has_role function
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- User roles policies
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Articles policies
CREATE POLICY "Anyone can view published articles" ON public.articles FOR SELECT USING (status = 'published');
CREATE POLICY "Authors can manage own articles" ON public.articles FOR ALL TO authenticated USING (auth.uid() = author_id);
CREATE POLICY "Admins can manage all articles" ON public.articles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Doctor schedules policies
CREATE POLICY "Anyone can view schedules" ON public.doctor_schedules FOR SELECT TO authenticated USING (true);
CREATE POLICY "Doctors can manage own schedules" ON public.doctor_schedules FOR ALL TO authenticated USING (auth.uid() = doctor_id);

-- Client assignments policies
CREATE POLICY "Clients can view own assignments" ON public.client_assignments FOR SELECT TO authenticated USING (auth.uid() = client_id);
CREATE POLICY "Doctors can view their assignments" ON public.client_assignments FOR SELECT TO authenticated USING (auth.uid() = doctor_id);
CREATE POLICY "Admins can manage assignments" ON public.client_assignments FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Conversations policies
CREATE POLICY "Users can view own conversations" ON public.conversations FOR SELECT TO authenticated USING (auth.uid() = client_id OR auth.uid() = doctor_id);
CREATE POLICY "Users can create conversations" ON public.conversations FOR INSERT TO authenticated WITH CHECK (auth.uid() = client_id OR auth.uid() = doctor_id);
CREATE POLICY "Users can update own conversations" ON public.conversations FOR UPDATE TO authenticated USING (auth.uid() = client_id OR auth.uid() = doctor_id);

-- Messages policies
CREATE POLICY "Users can view messages in their conversations" ON public.messages FOR SELECT TO authenticated 
USING (EXISTS (SELECT 1 FROM public.conversations c WHERE c.id = conversation_id AND (c.client_id = auth.uid() OR c.doctor_id = auth.uid())));
CREATE POLICY "Users can send messages in their conversations" ON public.messages FOR INSERT TO authenticated 
WITH CHECK (EXISTS (SELECT 1 FROM public.conversations c WHERE c.id = conversation_id AND (c.client_id = auth.uid() OR c.doctor_id = auth.uid())));

-- Diet plans policies
CREATE POLICY "Authenticated users can view diet plans" ON public.diet_plans FOR SELECT TO authenticated USING (true);
CREATE POLICY "Doctors and admins can manage diet plans" ON public.diet_plans FOR ALL TO authenticated 
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'doctor'));

-- Client diet plans policies
CREATE POLICY "Clients can view own diet plans" ON public.client_diet_plans FOR SELECT TO authenticated USING (auth.uid() = client_id);
CREATE POLICY "Doctors can manage client diet plans" ON public.client_diet_plans FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'doctor') OR public.has_role(auth.uid(), 'admin'));

-- Exercises policies
CREATE POLICY "Authenticated users can view exercises" ON public.exercises FOR SELECT TO authenticated USING (true);
CREATE POLICY "Doctors and admins can manage exercises" ON public.exercises FOR ALL TO authenticated 
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'doctor'));

-- Client exercises policies
CREATE POLICY "Clients can view own exercises" ON public.client_exercises FOR SELECT TO authenticated USING (auth.uid() = client_id);
CREATE POLICY "Clients can update own exercises" ON public.client_exercises FOR UPDATE TO authenticated USING (auth.uid() = client_id);
CREATE POLICY "Doctors can manage client exercises" ON public.client_exercises FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'doctor') OR public.has_role(auth.uid(), 'admin'));

-- Videos policies
CREATE POLICY "Authenticated users can view videos" ON public.videos FOR SELECT TO authenticated USING (true);
CREATE POLICY "Doctors and admins can manage videos" ON public.videos FOR ALL TO authenticated 
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'doctor'));

-- Client videos policies
CREATE POLICY "Clients can view own videos" ON public.client_videos FOR SELECT TO authenticated USING (auth.uid() = client_id);
CREATE POLICY "Clients can update own videos" ON public.client_videos FOR UPDATE TO authenticated USING (auth.uid() = client_id);
CREATE POLICY "Doctors can manage client videos" ON public.client_videos FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'doctor') OR public.has_role(auth.uid(), 'admin'));

-- Appointments policies
CREATE POLICY "Users can view own appointments" ON public.appointments FOR SELECT TO authenticated USING (auth.uid() = client_id OR auth.uid() = doctor_id);
CREATE POLICY "Users can create appointments" ON public.appointments FOR INSERT TO authenticated WITH CHECK (auth.uid() = client_id);
CREATE POLICY "Users can update own appointments" ON public.appointments FOR UPDATE TO authenticated USING (auth.uid() = client_id OR auth.uid() = doctor_id);
CREATE POLICY "Admins can manage all appointments" ON public.appointments FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Add triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_articles_updated_at BEFORE UPDATE ON public.articles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (user_id, full_name)
    VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
    
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'client');
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();