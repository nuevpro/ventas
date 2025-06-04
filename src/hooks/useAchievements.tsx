
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import type { Database } from '@/integrations/supabase/types';

type Achievement = Database['public']['Tables']['achievements']['Row'];
type UserAchievement = Database['public']['Tables']['user_achievements']['Row'] & {
  achievement: Achievement;
};

export const useAchievements = () => {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState<UserAchievement[]>([]);
  const [availableAchievements, setAvailableAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    loadAchievements();
  }, [user?.id]);

  const loadAchievements = async () => {
    try {
      setLoading(true);

      // Cargar logros del usuario
      const { data: userAchievements, error: userError } = await supabase
        .from('user_achievements')
        .select(`
          *,
          achievement:achievements(*)
        `)
        .eq('user_id', user!.id);

      if (userError) throw userError;

      // Cargar todos los logros disponibles
      const { data: allAchievements, error: allError } = await supabase
        .from('achievements')
        .select('*')
        .eq('is_active', true);

      if (allError) throw allError;

      setAchievements(userAchievements as UserAchievement[]);
      setAvailableAchievements(allAchievements);

      // Verificar logros automáticamente
      await checkAchievements();
    } catch (err) {
      console.error('Error loading achievements:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const checkAchievements = async () => {
    try {
      const { error } = await supabase.rpc('check_and_grant_achievements', {
        p_user_id: user!.id
      });

      if (error) throw error;
    } catch (err) {
      console.error('Error checking achievements:', err);
    }
  };

  const refreshAchievements = () => {
    if (user?.id) {
      loadAchievements();
    }
  };

  return {
    achievements,
    availableAchievements,
    loading,
    error,
    refreshAchievements,
    checkAchievements
  };
};
