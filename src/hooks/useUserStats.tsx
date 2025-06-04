
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import type { Database } from '@/integrations/supabase/types';

type UserStats = Database['public']['Tables']['user_stats']['Row'];

export const useUserStats = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    loadUserStats();
  }, [user?.id]);

  const loadUserStats = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', user!.id)
        .maybeSingle();

      if (error) throw error;

      // Si no existen estadísticas, crear nuevas
      if (!data) {
        const { data: newStats, error: insertError } = await supabase
          .from('user_stats')
          .insert({
            user_id: user!.id,
            total_sessions: 0,
            total_time_minutes: 0,
            best_score: 0,
            average_score: 0,
            total_xp: 0,
            level: 1,
            current_streak: 0
          })
          .select()
          .single();

        if (insertError) throw insertError;
        setStats(newStats);
      } else {
        setStats(data);
      }
    } catch (err) {
      console.error('Error loading user stats:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const refreshStats = () => {
    if (user?.id) {
      loadUserStats();
    }
  };

  return {
    stats,
    loading,
    error,
    refreshStats
  };
};
