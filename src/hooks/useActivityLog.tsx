
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import type { Database } from '@/integrations/supabase/types';

type ActivityLog = Database['public']['Tables']['user_activity_log']['Row'];

export const useActivityLog = () => {
  const { user } = useAuth();
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    loadActivityLog();
  }, [user?.id]);

  const loadActivityLog = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('useActivityLog: Loading activities for user:', user.id);
      
      const { data, error } = await supabase
        .from('user_activity_log')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      setActivities(data || []);
    } catch (err) {
      console.error('useActivityLog: Error loading activities:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const logActivity = async (activityType: string, activityData?: any, pointsEarned: number = 0) => {
    if (!user?.id) {
      console.log('useActivityLog: No user ID for logActivity');
      return;
    }

    try {
      const { error } = await supabase
        .from('user_activity_log')
        .insert({
          user_id: user.id,
          activity_type: activityType,
          activity_data: activityData,
          points_earned: pointsEarned
        });

      if (error) throw error;

      loadActivityLog(); // Recargar para mostrar nueva actividad
    } catch (err) {
      console.error('useActivityLog: Error logging activity:', err);
    }
  };

  return {
    activities,
    loading,
    error,
    logActivity,
    refreshActivityLog: loadActivityLog
  };
};
