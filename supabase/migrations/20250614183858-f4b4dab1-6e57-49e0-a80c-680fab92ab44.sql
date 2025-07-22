
-- Add visitor column to attendances table
ALTER TABLE public.attendances 
ADD COLUMN visitor boolean NOT NULL DEFAULT false;
