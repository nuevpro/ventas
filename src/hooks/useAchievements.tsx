
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

      // Obtener todos los logros disponibles
      const { data: allAchievements, error: achievementsError } = await supabase
        .from('achievements')
        .select('*')
        .eq('is_active', true);

      if (achievementsError) {
        console.error('Error loading achievements:', achievementsError);
        throw achievementsError;
      }

      setAvailableAchievements(allAchievements || []);

      // Obtener los logros del usuario
      const { data: userAchievements, error: userError } = await supabase
        .from('user_achievements')
        .select(`
          *,
          achievement:achievements(*)
        `)
        .eq('user_id', user.id);

      if (userError) {
        console.error('Error loading user achievements:', userError);
        throw userError;
      }

      // Transformar los datos para que coincidan con el tipo UserAchievement
      const transformedAchievements: UserAchievement[] = (userAchievements || []).map(ua => ({
        id: ua.id,
        user_id: ua.user_id || '',
        achievement_id: ua.achievement_id || '',
        progress: ua.progress || 0,
        target: ua.target || 1,
        earned_at: ua.earned_at,
        achievement: ua.achievement as Achievement
      }));

      setAchievements(transformedAchievements);
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
