
-- Add missing columns to children table
ALTER TABLE public.children 
ADD COLUMN is_autistic BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN has_food_restriction BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN food_restriction_details TEXT;
