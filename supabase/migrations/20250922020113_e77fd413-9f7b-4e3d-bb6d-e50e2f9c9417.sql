-- Create table to track contact deletions for reporting
CREATE TABLE public.contact_deletions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contact_id UUID NOT NULL,
  contact_name TEXT NOT NULL,
  deleted_by UUID REFERENCES public.profiles(user_id),
  deleted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  reason TEXT,
  ip_address INET,
  user_agent TEXT
);

-- Enable RLS
ALTER TABLE public.contact_deletions ENABLE ROW LEVEL SECURITY;

-- Only admins can view deletions
CREATE POLICY "Admins can view all deletions" 
ON public.contact_deletions 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Allow logging deletions
CREATE POLICY "Allow deletion logging" 
ON public.contact_deletions 
FOR INSERT 
WITH CHECK (true);