
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type Scenario = Database['public']['Tables']['scenarios']['Row'];
type ScenarioInsert = Database['public']['Tables']['scenarios']['Insert'];

export const useScenarios = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadScenarios();
    }
  }, [user]);

  const loadScenarios = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('scenarios')
        .select('*')
        .eq('is_active', true)
        .order('scenario_type')
        .order('difficulty_level')
        .order('title');

      if (error) {
        console.error('Error loading scenarios:', error);
        throw error;
      }

      setScenarios(data || []);
    } catch (err) {
      console.error('Error in loadScenarios:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const createScenario = async (scenarioData: {
    title: string;
    description: string;
    scenario_type: string;
    difficulty_level: number;
    prompt_instructions?: string;
    expected_outcomes?: any;
  }) => {
    try {
      const { data, error } = await supabase.rpc('create_custom_scenario', {
        p_title: scenarioData.title,
        p_description: scenarioData.description,
        p_scenario_type: scenarioData.scenario_type,
        p_difficulty_level: scenarioData.difficulty_level,
        p_prompt_instructions: scenarioData.prompt_instructions,
        p_expected_outcomes: scenarioData.expected_outcomes
      });

      if (error) {
        console.error('Error creating scenario:', error);
        throw error;
      }

      toast({
        title: "¡Éxito!",
        description: "Escenario creado correctamente",
      });

      await loadScenarios();
      return data;
    } catch (err) {
      console.error('Error in createScenario:', err);
      toast({
        title: "Error",
        description: "No se pudo crear el escenario",
        variant: "destructive",
      });
      throw err;
    }
  };

  const updateScenario = async (scenarioId: string, scenarioData: {
    title: string;
    description: string;
    scenario_type: string;
    difficulty_level: number;
    prompt_instructions?: string;
    expected_outcomes?: any;
  }) => {
    try {
      const { data, error } = await supabase.rpc('update_scenario', {
        p_scenario_id: scenarioId,
        p_title: scenarioData.title,
        p_description: scenarioData.description,
        p_scenario_type: scenarioData.scenario_type,
        p_difficulty_level: scenarioData.difficulty_level,
        p_prompt_instructions: scenarioData.prompt_instructions,
        p_expected_outcomes: scenarioData.expected_outcomes
      });

      if (error) {
        console.error('Error updating scenario:', error);
        throw error;
      }

      toast({
        title: "¡Éxito!",
        description: "Escenario actualizado correctamente",
      });

      await loadScenarios();
      return data;
    } catch (err) {
      console.error('Error in updateScenario:', err);
      toast({
        title: "Error",
        description: "No se pudo actualizar el escenario",
        variant: "destructive",
      });
      throw err;
    }
  };

  const getScenariosByCategory = (category?: string) => {
    if (!category) return scenarios;
    return scenarios.filter(scenario => scenario.scenario_type === category);
  };

  const getCategories = () => {
    const categories = [...new Set(scenarios.map(s => s.scenario_type))];
    return categories;
  };

  return {
    scenarios,
    loading,
    error,
    loadScenarios,
    createScenario,
    updateScenario,
    getScenariosByCategory,
    getCategories
  };
};
