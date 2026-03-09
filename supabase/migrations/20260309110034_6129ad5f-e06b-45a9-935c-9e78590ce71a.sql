
-- First, drop ALL existing policies on orders (by querying pg_policies to be thorough)
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN 
    SELECT policyname FROM pg_policies WHERE tablename = 'orders' AND schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.orders', pol.policyname);
  END LOOP;
  
  FOR pol IN 
    SELECT policyname FROM pg_policies WHERE tablename = 'order_items' AND schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.order_items', pol.policyname);
  END LOOP;
END $$;

-- Recreate orders policies as PERMISSIVE (default)
CREATE POLICY "Admins can manage all orders" ON public.orders
FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Authenticated users can create orders" ON public.orders
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Guest can create orders" ON public.orders
FOR INSERT TO anon
WITH CHECK (user_id IS NULL AND guest_email IS NOT NULL);

CREATE POLICY "Users can update own orders" ON public.orders
FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can view own orders" ON public.orders
FOR SELECT TO authenticated
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'::app_role));

-- Recreate order_items policies as PERMISSIVE (default)
CREATE POLICY "Admins can manage all order items" ON public.order_items
FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can create order items" ON public.order_items
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.id = order_items.order_id
    AND orders.user_id = auth.uid()
  )
);

CREATE POLICY "Users can view order items" ON public.order_items
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.id = order_items.order_id
    AND (orders.user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'::app_role))
  )
);
