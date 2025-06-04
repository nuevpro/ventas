
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type Challenge = Database['public']['Tables']['challenges']['Row'];
type ChallengeWithParticipation = Challenge & {
  is_participating: boolean;
  participant_count: number;
  user_score: number | null;
};

export const useChallenges = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [challenges, setChallenges] = useState<ChallengeWithParticipation[]>([]);
  const [customChallenges, setCustomChallenges] = useState<ChallengeWithParticipation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      loadChallenges();
    } else {
      setLoading(false);
    }
  }, [user?.id]);

  const loadChallenges = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);

      // Cargar desafíos públicos
      const { data: publicChallenges, error: publicError } = await supabase
        .from('challenges')
        .select('*')
        .eq('is_active', true)
        .eq('is_custom', false)
        .order('created_at', { ascending: false });

      if (publicError) {
        console.error('Error loading public challenges:', publicError);
        throw publicError;
      }

      // Cargar desafíos personalizados
      const { data: userCustomChallenges, error: customError } = await supabase
        .from('challenges')
        .select('*')
        .eq('is_active', true)
        .eq('is_custom', true)
        .order('created_at', { ascending: false });

      if (customError) {
        console.error('Error loading custom challenges:', customError);
        throw customError;
      }

      // Procesar desafíos públicos
      const processedPublic = await Promise.all(
        (publicChallenges || []).map(async (challenge) => {
          const { count: participantCount } = await supabase
            .from('challenge_participants')
            .select('*', { count: 'exact', head: true })
            .eq('challenge_id', challenge.id);

          const { data: participation } = await supabase
            .from('challenge_participants')
            .select('*')
            .eq('challenge_id', challenge.id)
            .eq('participant_id', user.id)
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

      // Procesar desafíos personalizados
      const processedCustom = await Promise.all(
        (userCustomChallenges || []).map(async (challenge) => {
          const { count: participantCount } = await supabase
            .from('challenge_participants')
            .select('*', { count: 'exact', head: true })
            .eq('challenge_id', challenge.id);

          const { data: participation } = await supabase
            .from('challenge_participants')
            .select('*')
            .eq('challenge_id', challenge.id)
            .eq('participant_id', user.id)
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

      setChallenges(processedPublic);
      setCustomChallenges(processedCustom);
    } catch (err) {
      console.error('Error loading challenges:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      toast({
        title: "Error",
        description: "No se pudieron cargar los desafíos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createCustomChallenge = async (challengeData: {
    title: string;
    description: string;
    challengeType: 'individual' | 'team';
    difficultyLevel: number;
    targetScore?: number;
    objectiveType?: string;
    objectiveValue?: number;
    endDate?: string;
    teamId?: string;
  }) => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "Debes estar autenticado para crear desafíos",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('Creating challenge with data:', challengeData);

      const { data, error } = await supabase.rpc('create_custom_challenge', {
        p_title: challengeData.title,
        p_description: challengeData.description,
        p_challenge_type: challengeData.challengeType,
        p_difficulty_level: challengeData.difficultyLevel,
        p_target_score: challengeData.targetScore || null,
        p_objective_type: challengeData.objectiveType || 'score',
        p_objective_value: challengeData.objectiveValue || null,
        p_end_date: challengeData.endDate ? new Date(challengeData.endDate).toISOString() : null,
        p_team_id: challengeData.teamId || null
      });

      if (error) {
        console.error('RPC Error:', error);
        throw error;
      }

      console.log('Challenge created successfully:', data);

      toast({
        title: "¡Éxito!",
        description: "Desafío personalizado creado correctamente.",
      });

      // Recargar los desafíos
      await loadChallenges();
      return data;
    } catch (err) {
      console.error('Error creating custom challenge:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      toast({
        title: "Error",
        description: `No se pudo crear el desafío: ${errorMessage}`,
        variant: "destructive",
      });
      throw err;
    }
  };

  const updateChallenge = async (challengeId: string, challengeData: any) => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('challenges')
        .update({
          title: challengeData.title,
          description: challengeData.description,
          challenge_type: challengeData.challengeType,
          difficulty_level: challengeData.difficultyLevel,
          target_score: challengeData.targetScore,
          objective_type: challengeData.objectiveType,
          objective_value: challengeData.objectiveValue,
          end_date: challengeData.endDate ? new Date(challengeData.endDate).toISOString() : null,
          team_id: challengeData.teamId,
          updated_at: new Date().toISOString()
        })
        .eq('id', challengeId)
        .eq('created_by', user.id);

      if (error) throw error;

      toast({
        title: "¡Éxito!",
        description: "Desafío actualizado correctamente.",
      });

      loadChallenges();
    } catch (err) {
      console.error('Error updating challenge:', err);
      toast({
        title: "Error",
        description: "No se pudo actualizar el desafío.",
        variant: "destructive",
      });
      throw err;
    }
  };

  const joinChallenge = async (challengeId: string) => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('challenge_participants')
        .insert({
          challenge_id: challengeId,
          participant_id: user.id,
          participant_type: 'user'
        });

      if (error) throw error;

      toast({
        title: "¡Éxito!",
        description: "Te has unido al desafío correctamente.",
      });

      loadChallenges();
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
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('challenge_participants')
        .delete()
        .eq('challenge_id', challengeId)
        .eq('participant_id', user.id)
        .eq('participant_type', 'user');

      if (error) throw error;

      toast({
        title: "Abandonado",
        description: "Has abandonado el desafío.",
      });

      loadChallenges();
    } catch (err) {
      console.error('Error leaving challenge:', err);
      toast({
        title: "Error",
        description: "No se pudo abandonar el desafío. Inténtalo de nuevo.",
        variant: "destructive",
      });
    }
  };

  const deleteChallenge = async (challengeId: string) => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('challenges')
        .delete()
        .eq('id', challengeId)
        .eq('created_by', user.id);

      if (error) throw error;

      toast({
        title: "Eliminado",
        description: "Desafío eliminado correctamente.",
      });

      loadChallenges();
    } catch (err) {
      console.error('Error deleting challenge:', err);
      toast({
        title: "Error",
        description: "No se pudo eliminar el desafío.",
        variant: "destructive",
      });
    }
  };

  return {
    challenges,
    customChallenges,
    loading,
    error,
    createCustomChallenge,
    updateChallenge,
    joinChallenge,
    leaveChallenge,
    deleteChallenge,
    refreshChallenges: loadChallenges
  };
};
