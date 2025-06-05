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