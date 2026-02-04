-- Drop existing restrictive policies and recreate as permissive
DROP POLICY IF EXISTS "Admins can manage categories" ON categories;
DROP POLICY IF EXISTS "Categories are viewable by everyone" ON categories;

-- Create permissive SELECT policy for everyone
CREATE POLICY "Categories are viewable by everyone" 
ON categories 
FOR SELECT 
TO authenticated, anon
USING (true);

-- Create permissive policy for admin to manage (INSERT, UPDATE, DELETE)
CREATE POLICY "Admins can insert categories" 
ON categories 
FOR INSERT 
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update categories" 
ON categories 
FOR UPDATE 
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete categories" 
ON categories 
FOR DELETE 
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));