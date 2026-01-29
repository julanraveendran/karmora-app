-- Add current_scrape_run_id column to profiles table
-- This tracks the active Apify scraping run for each user to prevent duplicate scrapes

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS current_scrape_run_id TEXT;

-- Add comment
COMMENT ON COLUMN profiles.current_scrape_run_id IS 'Stores the Apify run ID of the current active scraping job to prevent duplicate scrapes';
