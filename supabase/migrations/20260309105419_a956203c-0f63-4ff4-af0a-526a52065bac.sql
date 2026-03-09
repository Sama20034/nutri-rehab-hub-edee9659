
-- Drop all RESTRICTIVE policies on orders
DROP POLICY IF EXISTS "Admins can manage all orders" ON public.orders;
DROP POLICY IF EXISTS "Anyone can create orders" ON public.orders;
DROP POLICY IF EXISTS "Users can update own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can view orders" ON public.orders;

-- Recreate as PERMISSIVE (default)
CREATE POLICY "Admins can manage all orders" ON public.orders
FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can create orders" ON public.orders
FOR INSERT TO authenticated
WITH CHECK (
  (auth.uid() IS NOT NULL AND auth.uid() = user_id)
  OR (user_id IS NULL AND guest_email IS NOT NULL)
);

CREATE POLICY "Guest can create orders" ON public.orders
FOR INSERT TO anon
WITH CHECK (user_id IS NULL AND guest_email IS NOT NULL);

CREATE POLICY "Users can update own orders" ON public.orders
FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can view orders" ON public.orders
FOR SELECT TO authenticated
USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));

-- Drop all RESTRICTIVE policies on order_items
DROP POLICY IF EXISTS "Admins can manage all order items" ON public.order_items;
DROP POLICY IF EXISTS "Anyone can create order items for their orders" ON public.order_items;
DROP POLICY IF EXISTS "Users can view order items" ON public.order_items;

-- Recreate as PERMISSIVE (default)
CREATE POLICY "Admins can manage all order items" ON public.order_items
FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can create order items for their orders" ON public.order_items
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = order_items.order_id
    AND (orders.user_id = auth.uid() OR orders.user_id IS NULL)
  )
);

CREATE POLICY "Users can view order items" ON public.order_items
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = order_items.order_id
    AND (orders.user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role))
  )
);
