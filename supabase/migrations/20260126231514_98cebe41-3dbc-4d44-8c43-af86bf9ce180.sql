-- Drop the restrictive INSERT policy and create a permissive one
DROP POLICY IF EXISTS "Anyone can create orders" ON public.orders;

-- Create a PERMISSIVE INSERT policy that allows:
-- 1. Logged-in users to create orders with their user_id
-- 2. Guests (anonymous) to create orders with guest_email
CREATE POLICY "Anyone can create orders"
ON public.orders
FOR INSERT
TO anon, authenticated
WITH CHECK (
  (auth.uid() IS NOT NULL AND auth.uid() = user_id) 
  OR 
  (user_id IS NULL AND guest_email IS NOT NULL)
);