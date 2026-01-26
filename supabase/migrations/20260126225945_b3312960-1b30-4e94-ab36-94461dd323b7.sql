-- Add guest order fields to orders table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS guest_name TEXT,
ADD COLUMN IF NOT EXISTS guest_email TEXT;

-- Update RLS policy to allow guest orders (insert without user_id)
DROP POLICY IF EXISTS "Users can create own orders" ON public.orders;

CREATE POLICY "Anyone can create orders" 
ON public.orders 
FOR INSERT 
WITH CHECK (
  -- Either logged in user creating their own order
  (auth.uid() = user_id) 
  OR 
  -- Or guest order (user_id is null and guest_email is provided)
  (user_id IS NULL AND guest_email IS NOT NULL)
);

-- Allow guests to view their orders by phone (for order tracking)
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;

CREATE POLICY "Users can view orders" 
ON public.orders 
FOR SELECT 
USING (
  auth.uid() = user_id 
  OR 
  has_role(auth.uid(), 'admin'::app_role)
);

-- Make user_id nullable for guest orders
ALTER TABLE public.orders 
ALTER COLUMN user_id DROP NOT NULL;

-- Update order_items policy to allow inserting items for guest orders
DROP POLICY IF EXISTS "Users can create order items for own orders" ON public.order_items;

CREATE POLICY "Anyone can create order items for their orders" 
ON public.order_items 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM orders 
    WHERE orders.id = order_items.order_id 
    AND (
      orders.user_id = auth.uid() 
      OR orders.user_id IS NULL
    )
  )
);

-- Allow viewing order items for own orders
DROP POLICY IF EXISTS "Users can view own order items" ON public.order_items;

CREATE POLICY "Users can view order items" 
ON public.order_items 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM orders 
    WHERE orders.id = order_items.order_id 
    AND (
      orders.user_id = auth.uid() 
      OR has_role(auth.uid(), 'admin'::app_role)
    )
  )
);