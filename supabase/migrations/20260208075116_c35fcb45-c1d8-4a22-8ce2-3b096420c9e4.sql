
-- Fix 1: Coupons - explicitly require authentication in USING clause
DROP POLICY IF EXISTS "Active coupons viewable by authenticated" ON public.coupons;
CREATE POLICY "Authenticated users can view active coupons"
ON public.coupons
FOR SELECT
TO authenticated
USING (is_active = true AND auth.uid() IS NOT NULL);

-- Fix 2: Profiles - add explicit anonymous access block
-- The existing policies are restrictive and check auth.uid() = user_id,
-- but adding an explicit block for anon role ensures no anonymous access
CREATE POLICY "Block anonymous access to profiles"
ON public.profiles
FOR SELECT
TO anon
USING (false);

-- Fix 3: Orders - add explicit anonymous access block  
CREATE POLICY "Block anonymous access to orders"
ON public.orders
FOR SELECT
TO anon
USING (false);
