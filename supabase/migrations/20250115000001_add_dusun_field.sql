-- Add dusun field to village_profile table
-- This migration adds a new column to track the number of hamlets (dusun) in the village

ALTER TABLE village_profile ADD COLUMN IF NOT EXISTS dusun INT DEFAULT 8;

-- Update the existing record to set default dusun value
UPDATE village_profile SET dusun = 8 WHERE dusun IS NULL;

-- Add comment to the column for documentation
ALTER TABLE village_profile MODIFY COLUMN dusun INT DEFAULT 8 COMMENT 'Number of hamlets (dusun) in the village';
