
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type Challenge = Database['public']['Tables']['challenges']['Row'];
type ChallengeParticipant = Database['public']['Tables']['challenge_participants']['Row'];
type ChallengeWithParticipation = Challenge & {
  is_participating: boolean;
  participant_count: number;
  user_score: number | null;
};

export const useChallenges = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [challenges, setChallenges] = useState<ChallengeWithParticipation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    loadChallenges();
  }, [user?.id]);

  const loadChallenges = async () => {
    try {
      setLoading(true);

      // Cargar desafíos activos
      const { data: challengesData, error: challengesError } = await supabase
        .from('challenges')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (challengesError) throw challengesError;

      // Para cada desafío, verificar participación del usuario
      const challengesWithParticipation = await Promise.all(
        (challengesData || []).map(async (challenge) => {
          // Contar participantes
          const { count: participantCount } = await supabase
            .from('challenge_participants')
            .select('*', { count: 'exact', head: true })
            .eq('challenge_id', challenge.id);

          // Verificar si el usuario está participando
          const { data: participation } = await supabase
            .from('challenge_participants')
            .select('*')
            .eq('challenge_id', challenge.id)
            .eq('participant_id', user!.id)
            .eq('participant_type', 'user')
            .maybeSingle();

          return {
            ...challenge,
            is_participating: !!participation,
            participant_count: participantCount || 0,
            user_score: participation?.score || null
          };
        })
      );

      setChallenges(challengesWithParticipation);
    } catch (err) {
      console.error('Error loading challenges:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const joinChallenge = async (challengeId: string) => {
    try {
      const { error } = await supabase
        .from('challenge_participants')
        .insert({
          challenge_id: challengeId,
          participant_id: user!.id,
          participant_type: 'user'
        });

      if (error) throw error;

      toast({
        title: "¡Éxito!",
        description: "Te has unido al desafío correctamente.",
      });

      loadChallenges(); // Recargar para actualizar estado
    } catch (err) {
      console.error('Error joining challenge:', err);
      toast({
        title: "Error",
        description: "No se pudo unir al desafío. Inténtalo de nuevo.",
        variant: "destructive",
      });
    }
  };

  const leaveChallenge = async (challengeId: string) => {
    try {
      const { error } = await supabase
        .from('challenge_participants')
        .delete()
        .eq('challenge_id', challengeId)
        .eq('participant_id', user!.id)
        .eq('participant_type', 'user');

      if (error) throw error;

      toast({
        title: "Abandonado",
        description: "Has abandonado el desafío.",
      });

      loadChallenges(); // Recargar para actualizar estado
    } catch (err) {
      console.error('Error leaving challenge:', err);
      toast({
        title: "Error",
        description: "No se pudo abandonar el desafío. Inténtalo de nuevo.",
        variant: "destructive",
      });
    }
  };

  return {
    challenges,
    loading,
    error,
    joinChallenge,
    leaveChallenge,
    refreshChallenges: loadChallenges
  };
};
