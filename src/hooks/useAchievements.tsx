import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type Achievement = Database['public']['Tables']['achievements']['Row'];
type UserAchievement = {
  id: string;
  user_id: string;
  achievement_id: string;
  progress: number;
  target: number;
  earned_at: string | null;
  achievement: Achievement;
};

export const useAchievements = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [achievements, setAchievements] = useState<UserAchievement[]>([]);
  const [availableAchievements, setAvailableAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadAchievements();
    }
  }, [user]);

  const loadAchievements = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      // Get all available achievements
      const { data: allAchievements, error: achievementsError } = await supabase
        .from('achievements')
        .select('*')
        .eq('is_active', true);

      if (achievementsError) {
        console.error('Error loading achievements:', achievementsError);
        throw achievementsError;
      }

      setAvailableAchievements(allAchievements || []);

      // Get user achievements with a separate query for achievements
      const { data: userAchievements, error: userError } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', user.id);

      if (userError) {
        console.error('Error loading user achievements:', userError);
        throw userError;
      }

      // Fetch the full achievement details for each user achievement
      const achievementDetails = await Promise.all(
        (userAchievements || []).map(async (ua) => {
          const { data: achievement, error: achievementError } = await supabase
            .from('achievements')
            .select('*')
            .eq('id', ua.achievement_id)
            .single();

          if (achievementError) {
            console.error('Error loading achievement details:', achievementError);
            return null;
          }

          return {
            id: ua.id,
            user_id: ua.user_id,
            achievement_id: ua.achievement_id,
            progress: ua.progress || 0,
            target: ua.target || 1,
            earned_at: ua.earned_at,
            achievement: achievement
          };
        })
      );

      // Filter out any null results from failed queries
      const validAchievements = achievementDetails.filter((a): a is UserAchievement => a !== null);
      setAchievements(validAchievements);
    } catch (err) {
      console.error('Error in loadAchievements:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const checkAchievements = async () => {
    if (!user) return;

    try {
      const { error } = await supabase.rpc('check_and_grant_achievements', {
        p_user_id: user.id
      });

      if (error) {
        console.error('Error checking achievements:', error);
        throw error;
      }

      await loadAchievements();
    } catch (err) {
      console.error('Error in checkAchievements:', err);
      toast({
        title: "Error",
        description: "No se pudieron verificar los logros",
        variant: "destructive",
      });
    }
  };

  const getEarnedAchievements = () => {
    return achievements.filter(achievement => achievement.earned_at !== null);
  };

  const getProgressPercentage = (achievement: UserAchievement) => {
    return Math.min((achievement.progress / achievement.target) * 100, 100);
  };

  return {
    achievements,
    availableAchievements,
    loading,
    error,
    loadAchievements,
    checkAchievements,
    getEarnedAchievements,
    getProgressPercentage
  };
};