
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type Challenge = Database['public']['Tables']['challenges']['Row'];
type ChallengeInsert = Database['public']['Tables']['challenges']['Insert'];

export const useChallengesData = () => {
  const { toast } = useToast();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadChallenges();
  }, []);

  const loadChallenges = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('challenges')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading challenges:', error);
        throw error;
      }

      setChallenges(data || []);
    } catch (err) {
      console.error('Error in loadChallenges:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const createChallenge = async (challengeData: {
    title: string;
    description: string;
    challenge_type: string;
    difficulty_level?: number;
    target_score?: number;
    objective_type?: string;
    objective_value?: number;
    end_date?: string;
    team_id?: string;
  }) => {
    try {
      const { data, error } = await supabase.rpc('create_custom_challenge', {
        p_title: challengeData.title,
        p_description: challengeData.description,
        p_challenge_type: challengeData.challenge_type,
        p_difficulty_level: challengeData.difficulty_level || 1,
        p_target_score: challengeData.target_score,
        p_objective_type: challengeData.objective_type || 'score',
        p_objective_value: challengeData.objective_value,
        p_end_date: challengeData.end_date ? new Date(challengeData.end_date).toISOString() : null,
        p_team_id: challengeData.team_id || null,
        p_is_public: true
      });

      if (error) {
        console.error('Error creating challenge:', error);
        throw error;
      }

      toast({
        title: "¡Éxito!",
        description: "Desafío creado correctamente",
      });

      await loadChallenges();
      return data;
    } catch (err) {
      console.error('Error in createChallenge:', err);
      toast({
        title: "Error",
        description: "No se pudo crear el desafío",
        variant: "destructive",
      });
      throw err;
    }
  };

  return {
    challenges,
    loading,
    error,
    loadChallenges,
    createChallenge
  };
};
