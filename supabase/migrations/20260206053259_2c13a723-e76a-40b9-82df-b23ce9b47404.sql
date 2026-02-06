-- Add is_active status column to categories table
ALTER TABLE public.categories 
ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;

-- Add index for filtering by status
CREATE INDEX IF NOT EXISTS idx_categories_is_active ON public.categories(is_active);