-- Add contact_name column to contact_deletions table for better reporting
ALTER TABLE contact_deletions 
ADD COLUMN contact_name TEXT;