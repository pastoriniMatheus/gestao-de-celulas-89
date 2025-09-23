-- Enable RLS on contact_deletions table
ALTER TABLE contact_deletions ENABLE ROW LEVEL SECURITY;

-- Allow admins to view all contact deletions
CREATE POLICY "Admins can view all contact deletions" 
ON contact_deletions 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Allow system/admins to insert contact deletions
CREATE POLICY "System can insert contact deletions" 
ON contact_deletions 
FOR INSERT 
WITH CHECK (true);