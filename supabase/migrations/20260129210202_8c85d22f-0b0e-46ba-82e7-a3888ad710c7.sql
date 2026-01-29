-- Create store_categories table for managing product categories
CREATE TABLE public.store_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  name_ar TEXT,
  parent_id UUID REFERENCES public.store_categories(id) ON DELETE SET NULL,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.store_categories ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view active categories" 
ON public.store_categories 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage categories" 
ON public.store_categories 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_store_categories_updated_at
BEFORE UPDATE ON public.store_categories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default categories
-- Main Categories
INSERT INTO public.store_categories (name, name_ar, display_order) VALUES
('Proteins, Aminos & Creatine', 'البروتينات والأحماض الأمينية والكرياتين', 1),
('Pre-Workout & Natural Boosters', 'ما قبل التمرين والمعززات الطبيعية', 2),
('Weight Loss & Natural Healthy Foods', 'إنقاص الوزن والأغذية الصحية الطبيعية', 3),
('General Health Care', 'الرعاية الصحية العامة', 4),
('Fitness Equipment', 'معدات اللياقة البدنية', 5);

-- Subcategories for Proteins, Aminos & Creatine
INSERT INTO public.store_categories (name, name_ar, parent_id, display_order)
SELECT 'Proteins', 'البروتينات', id, 1 FROM public.store_categories WHERE name = 'Proteins, Aminos & Creatine';
INSERT INTO public.store_categories (name, name_ar, parent_id, display_order)
SELECT 'Weight Gainers & Carbs', 'زيادة الوزن والكربوهيدرات', id, 2 FROM public.store_categories WHERE name = 'Proteins, Aminos & Creatine';
INSERT INTO public.store_categories (name, name_ar, parent_id, display_order)
SELECT 'Bcaa & Recovery', 'BCAA والتعافي', id, 3 FROM public.store_categories WHERE name = 'Proteins, Aminos & Creatine';
INSERT INTO public.store_categories (name, name_ar, parent_id, display_order)
SELECT 'Pure Amino Acids', 'الأحماض الأمينية النقية', id, 4 FROM public.store_categories WHERE name = 'Proteins, Aminos & Creatine';
INSERT INTO public.store_categories (name, name_ar, parent_id, display_order)
SELECT 'Creatine', 'الكرياتين', id, 5 FROM public.store_categories WHERE name = 'Proteins, Aminos & Creatine';

-- Subcategories for Pre-Workout & Natural Boosters
INSERT INTO public.store_categories (name, name_ar, parent_id, display_order)
SELECT 'Pre-Workout', 'ما قبل التمرين', id, 1 FROM public.store_categories WHERE name = 'Pre-Workout & Natural Boosters';
INSERT INTO public.store_categories (name, name_ar, parent_id, display_order)
SELECT 'Test Boosters', 'معززات التستوستيرون', id, 2 FROM public.store_categories WHERE name = 'Pre-Workout & Natural Boosters';
INSERT INTO public.store_categories (name, name_ar, parent_id, display_order)
SELECT 'GH Boosters', 'معززات هرمون النمو', id, 3 FROM public.store_categories WHERE name = 'Pre-Workout & Natural Boosters';

-- Subcategories for Weight Loss & Natural Healthy Foods
INSERT INTO public.store_categories (name, name_ar, parent_id, display_order)
SELECT 'Stimulant Fat Burners', 'حارقات الدهون المنشطة', id, 1 FROM public.store_categories WHERE name = 'Weight Loss & Natural Healthy Foods';
INSERT INTO public.store_categories (name, name_ar, parent_id, display_order)
SELECT 'Non Stimulant Fat Burners', 'حارقات الدهون غير المنشطة', id, 2 FROM public.store_categories WHERE name = 'Weight Loss & Natural Healthy Foods';
INSERT INTO public.store_categories (name, name_ar, parent_id, display_order)
SELECT 'High Natural Foods', 'الأغذية الطبيعية العالية', id, 3 FROM public.store_categories WHERE name = 'Weight Loss & Natural Healthy Foods';
INSERT INTO public.store_categories (name, name_ar, parent_id, display_order)
SELECT 'Protein Bars & Snacks', 'ألواح البروتين والوجبات الخفيفة', id, 4 FROM public.store_categories WHERE name = 'Weight Loss & Natural Healthy Foods';

-- Subcategories for General Health Care
INSERT INTO public.store_categories (name, name_ar, parent_id, display_order)
SELECT 'Vitamins & Minerals', 'الفيتامينات والمعادن', id, 1 FROM public.store_categories WHERE name = 'General Health Care';
INSERT INTO public.store_categories (name, name_ar, parent_id, display_order)
SELECT 'Omega & Fish Oil', 'أوميغا وزيت السمك', id, 2 FROM public.store_categories WHERE name = 'General Health Care';
INSERT INTO public.store_categories (name, name_ar, parent_id, display_order)
SELECT 'Women Health', 'صحة المرأة', id, 3 FROM public.store_categories WHERE name = 'General Health Care';
INSERT INTO public.store_categories (name, name_ar, parent_id, display_order)
SELECT 'Kids Health', 'صحة الأطفال', id, 4 FROM public.store_categories WHERE name = 'General Health Care';
INSERT INTO public.store_categories (name, name_ar, parent_id, display_order)
SELECT 'Skin & Hair Care', 'العناية بالبشرة والشعر', id, 5 FROM public.store_categories WHERE name = 'General Health Care';
INSERT INTO public.store_categories (name, name_ar, parent_id, display_order)
SELECT 'Bones & Joint Supports', 'دعم العظام والمفاصل', id, 6 FROM public.store_categories WHERE name = 'General Health Care';

-- Subcategories for Fitness Equipment
INSERT INTO public.store_categories (name, name_ar, parent_id, display_order)
SELECT 'Training Supports', 'دعامات التدريب', id, 1 FROM public.store_categories WHERE name = 'Fitness Equipment';
INSERT INTO public.store_categories (name, name_ar, parent_id, display_order)
SELECT 'Shakers & Bottles', 'الشيكرات والزجاجات', id, 2 FROM public.store_categories WHERE name = 'Fitness Equipment';
INSERT INTO public.store_categories (name, name_ar, parent_id, display_order)
SELECT 'Sports Wear', 'الملابس الرياضية', id, 3 FROM public.store_categories WHERE name = 'Fitness Equipment';