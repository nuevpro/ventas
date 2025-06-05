/*
  # Fix duplicate foreign key constraints

  1. Changes
    - Remove duplicate foreign key constraint between user_achievements and achievements tables
    - Keep the primary foreign key constraint 'fk_user_achievements_achievement_id'
    - Remove the redundant constraint 'user_achievements_achievement_id_fkey'

  Note: This is a data-safe migration that only removes a redundant constraint
*/

DO $$ 
BEGIN
  -- Check if the redundant constraint exists before trying to drop it
  IF EXISTS (
    SELECT 1 
    FROM information_schema.table_constraints 
    WHERE constraint_name = 'user_achievements_achievement_id_fkey'
    AND table_name = 'user_achievements'
  ) THEN
    ALTER TABLE user_achievements 
    DROP CONSTRAINT IF EXISTS user_achievements_achievement_id_fkey;
  END IF;
END $$;