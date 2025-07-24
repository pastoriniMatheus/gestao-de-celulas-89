
-- Create user_ministry_access table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_ministry_access (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  can_access_ministries BOOLEAN NOT NULL DEFAULT false,
  can_access_kids BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.user_ministry_access ENABLE ROW LEVEL SECURITY;

-- Create policies for user_ministry_access
CREATE POLICY "Users can view their own ministry access" 
  ON public.user_ministry_access 
  FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all ministry access" 
  ON public.user_ministry_access 
  FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  ));
