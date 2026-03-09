-- Fix: Change orders INSERT policy from RESTRICTIVE to PERMISSIVE
DROP POLICY IF EXISTS "Anyone can create orders" ON public.orders;
CREATE POLICY "Anyone can create orders" ON public.orders
FOR INSERT
WITH CHECK (
  ((auth.uid() IS NOT NULL) AND (auth.uid() = user_id))
  OR
  ((user_id IS NULL) AND (guest_email IS NOT NULL))
);

-- Also fix order_items INSERT policy
DROP POLICY IF EXISTS "Anyone can create order items for their orders" ON public.order_items;
CREATE POLICY "Anyone can create order items for their orders" ON public.order_items
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = order_items.order_id
    AND (orders.user_id = auth.uid() OR orders.user_id IS NULL)
  )
);