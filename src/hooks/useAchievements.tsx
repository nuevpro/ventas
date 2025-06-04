
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import type { Database } from '@/integrations/supabase/types';

type Achievement = Database['public']['Tables']['achievements']['Row'];
type UserAchievement = Database['public']['Tables']['user_achievements']['Row'] & {
  achievement: Achievement;
};

export const useAchievements = () => {
  const { user, loading: authLoading } = useAuth();
  const [achievements, setAchievements] = useState<UserAchievement[]>([]);
  const [availableAchievements, setAvailableAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    
    if (!user?.id) {
      setLoading(false);
      setAchievements([]);
      setAvailableAchievements([]);
      return;
    }

    loadAchievements();
  }, [user?.id, authLoading]);

  const loadAchievements = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('useAchievements: Loading achievements for user:', user.id);

      // Cargar todos los logros disponibles primero
      const { data: allAchievements, error: allError } = await supabase
        .from('achievements')
        .select('*')
        .eq('is_active', true);

      if (allError) {
        console.error('useAchievements: Error loading all achievements:', allError);
        throw allError;
      }

      setAvailableAchievements(allAchievements || []);

      // Cargar logros del usuario
      const { data: userAchievements, error: userError } = await supabase
        .from('user_achievements')
        .select(`
          *,
          achievement:achievements(*)
        `)
        .eq('user_id', user.id);

      if (userError) {
        console.error('useAchievements: Error loading user achievements:', userError);
        throw userError;
      }

      setAchievements(userAchievements as UserAchievement[] || []);

      // Verificar logros automáticamente solo si hay datos
      if (allAchievements && allAchievements.length > 0) {
        await checkAchievements();
      }
    } catch (err) {
      console.error('useAchievements: Error loading achievements:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const checkAchievements = async () => {
    if (!user?.id) return;

    try {
      const { error } = await supabase.rpc('check_and_grant_achievements', {
        p_user_id: user.id
      });

      if (error) {
        console.error('useAchievements: Error checking achievements:', error);
      }
    } catch (err) {
      console.error('useAchievements: Error in checkAchievements:', err);
    }
  };

  const refreshAchievements = () => {
    if (user?.id && !authLoading) {
      loadAchievements();
    }
  };

  return {
    achievements,
    availableAchievements,
    loading: loading || authLoading,
    error,
    refreshAchievements,
    checkAchievements
  };
};
