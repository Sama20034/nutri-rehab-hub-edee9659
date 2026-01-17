-- Create supplements/products table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  name_ar TEXT,
  description TEXT,
  description_ar TEXT,
  price NUMERIC NOT NULL DEFAULT 0,
  image_url TEXT,
  video_url TEXT,
  usage_instructions TEXT,
  usage_instructions_ar TEXT,
  suitable_for TEXT,
  suitable_for_ar TEXT,
  medical_followup_required BOOLEAN DEFAULT false,
  medical_followup_notes TEXT,
  medical_followup_notes_ar TEXT,
  category TEXT,
  stock_quantity INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create orders table
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  total_amount NUMERIC NOT NULL DEFAULT 0,
  status TEXT DEFAULT 'pending',
  shipping_address TEXT,
  phone TEXT,
  notes TEXT,
  grants_content_access BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create order items table
CREATE TABLE public.order_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create cart table
CREATE TABLE public.cart_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

-- Products policies (public read, admin/doctor manage)
CREATE POLICY "Anyone can view active products" 
  ON public.products FOR SELECT 
  USING (is_active = true);

CREATE POLICY "Admins can manage products" 
  ON public.products FOR ALL 
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Orders policies
CREATE POLICY "Users can view own orders" 
  ON public.orders FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own orders" 
  ON public.orders FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own orders" 
  ON public.orders FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all orders" 
  ON public.orders FOR ALL 
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Order items policies
CREATE POLICY "Users can view own order items" 
  ON public.order_items FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()
  ));

CREATE POLICY "Users can create order items for own orders" 
  ON public.order_items FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()
  ));

CREATE POLICY "Admins can manage all order items" 
  ON public.order_items FOR ALL 
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Cart policies
CREATE POLICY "Users can view own cart" 
  ON public.cart_items FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own cart" 
  ON public.cart_items FOR ALL 
  USING (auth.uid() = user_id);

-- Function to check if user has content access via order
CREATE OR REPLACE FUNCTION public.has_content_access_via_order(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM orders 
    WHERE user_id = p_user_id 
    AND grants_content_access = true 
    AND status IN ('confirmed', 'delivered')
  );
END;
$$;

-- Trigger to set grants_content_access when total > 7500
CREATE OR REPLACE FUNCTION public.check_order_content_access()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.total_amount >= 7500 THEN
    NEW.grants_content_access := true;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_order_content_access
  BEFORE INSERT OR UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.check_order_content_access();