-- Create a function to update user role after signup (bypasses RLS)
CREATE OR REPLACE FUNCTION public.update_user_role_on_signup(p_user_id uuid, p_role app_role)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.user_roles
  SET role = p_role
  WHERE user_id = p_user_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.update_user_role_on_signup(uuid, app_role) TO authenticated;