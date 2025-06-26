-- Allow canteen admins to view profiles of users who have placed orders in their canteen
CREATE POLICY "Canteen admins can view profiles for their orders" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders
      JOIN public.canteens ON orders.canteen_id = canteens.id
      WHERE orders.user_id = profiles.id
        AND canteens.admin_user_id = auth.uid()
    )
  ); 