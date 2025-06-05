/*
  # Fix duplicate foreign key constraints

  1. Changes
    - Remove duplicate foreign key constraint between user_achievements and achievements tables
    - Keep only one foreign key constraint for clarity and proper API functionality

  2. Security
    - No changes to RLS policies
    - No impact on existing data or permissions
*/

DO $$ 
BEGIN
  -- Drop the duplicate foreign key constraint if it exists
  IF EXISTS (
    SELECT 1 
    FROM information_schema.table_constraints 
    WHERE constraint_name = 'fk_user_achievements_achievement_id'
    AND table_name = 'user_achievements'
  ) THEN
    ALTER TABLE user_achievements 
    DROP CONSTRAINT fk_user_achievements_achievement_id;
  END IF;
END $$;