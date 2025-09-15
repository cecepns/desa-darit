-- Add village head fields to village_profile table
-- This migration adds fields for village head information including photo, name, and welcome message

-- Check if columns exist before adding them
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = DATABASE() 
     AND TABLE_NAME = 'village_profile' 
     AND COLUMN_NAME = 'head_village_image') = 0,
    'ALTER TABLE village_profile ADD COLUMN head_village_image VARCHAR(255) DEFAULT NULL COMMENT "Photo filename for village head"',
    'SELECT "head_village_image column already exists"'
));
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = DATABASE() 
     AND TABLE_NAME = 'village_profile' 
     AND COLUMN_NAME = 'name_head_village') = 0,
    'ALTER TABLE village_profile ADD COLUMN name_head_village VARCHAR(255) DEFAULT NULL COMMENT "Name of the village head"',
    'SELECT "name_head_village column already exists"'
));
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = DATABASE() 
     AND TABLE_NAME = 'village_profile' 
     AND COLUMN_NAME = 'description_head_village') = 0,
    'ALTER TABLE village_profile ADD COLUMN description_head_village TEXT DEFAULT NULL COMMENT "Welcome message from village head (HTML format)"',
    'SELECT "description_head_village column already exists"'
));
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Verify columns exist
SELECT 
    COLUMN_NAME, 
    DATA_TYPE, 
    IS_NULLABLE, 
    COLUMN_DEFAULT, 
    COLUMN_COMMENT
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'village_profile'
  AND COLUMN_NAME IN ('head_village_image', 'name_head_village', 'description_head_village');
