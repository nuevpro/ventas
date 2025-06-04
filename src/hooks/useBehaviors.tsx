
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

// Define the Behavior type manually since it's not in the generated types yet
type Behavior = {
  id: string;
  name: string;
  scenario_id?: string;
  client_personality: string;
  emotional_tone?: string;
  technical_level?: string;
  common_objections?: string[] | any;
  knowledge_base?: string;
  response_style?: string;
  voice?: string;
  is_active?: boolean;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
};

type BehaviorInsert = {
  name: string;
  scenario_id?: string;
  client_personality: string;
  emotional_tone?: string;
  technical_level?: string;
  common_objections?: string[];
  knowledge_base?: string;
  response_style?: string;
  voice?: string;
};

export const useBehaviors = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [behaviors, setBehaviors] = useState<Behavior[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadBehaviors();
  }, []);

  const loadBehaviors = async () => {
    try {
      setLoading(true);
      setError(null);

      // Use any to bypass TypeScript errors until types are updated
      const { data, error } = await (supabase as any)
        .from('behaviors')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading behaviors:', error);
        throw error;
      }

      setBehaviors(data || []);
    } catch (err) {
      console.error('Error in loadBehaviors:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const createBehavior = async (behaviorData: {
    name: string;
    scenario_id?: string;
    client_personality: string;
    emotional_tone?: string;
    technical_level?: string;
    common_objections?: string[];
    knowledge_base?: string;
    response_style?: string;
    voice?: string;
  }) => {
    try {
      // Use any to bypass TypeScript errors until types are updated
      const { data, error } = await (supabase as any).rpc('create_behavior', {
        p_name: behaviorData.name,
        p_scenario_id: behaviorData.scenario_id || null,
        p_client_personality: behaviorData.client_personality,
        p_emotional_tone: behaviorData.emotional_tone || 'neutral',
        p_technical_level: behaviorData.technical_level || 'intermediate',
        p_common_objections: behaviorData.common_objections || [],
        p_knowledge_base: behaviorData.knowledge_base || '',
        p_response_style: behaviorData.response_style || '',
        p_voice: behaviorData.voice || 'Sarah'
      });

      if (error) {
        console.error('Error creating behavior:', error);
        throw error;
      }

      toast({
        title: "¡Éxito!",
        description: "Comportamiento creado correctamente",
      });

      await loadBehaviors();
      return data;
    } catch (err) {
      console.error('Error in createBehavior:', err);
      toast({
        title: "Error",
        description: "No se pudo crear el comportamiento",
        variant: "destructive",
      });
      throw err;
    }
  };

  const updateBehavior = async (behaviorId: string, behaviorData: {
    name: string;
    scenario_id?: string;
    client_personality: string;
    emotional_tone?: string;
    technical_level?: string;
    common_objections?: string[];
    knowledge_base?: string;
    response_style?: string;
    voice?: string;
  }) => {
    try {
      // Use any to bypass TypeScript errors until types are updated
      const { data, error } = await (supabase as any).rpc('update_behavior', {
        p_behavior_id: behaviorId,
        p_name: behaviorData.name,
        p_scenario_id: behaviorData.scenario_id || null,
        p_client_personality: behaviorData.client_personality,
        p_emotional_tone: behaviorData.emotional_tone || 'neutral',
        p_technical_level: behaviorData.technical_level || 'intermediate',
        p_common_objections: behaviorData.common_objections || [],
        p_knowledge_base: behaviorData.knowledge_base || '',
        p_response_style: behaviorData.response_style || '',
        p_voice: behaviorData.voice || 'Sarah'
      });

      if (error) {
        console.error('Error updating behavior:', error);
        throw error;
      }

      toast({
        title: "¡Éxito!",
        description: "Comportamiento actualizado correctamente",
      });

      await loadBehaviors();
      return data;
    } catch (err) {
      console.error('Error in updateBehavior:', err);
      toast({
        title: "Error",
        description: "No se pudo actualizar el comportamiento",
        variant: "destructive",
      });
      throw err;
    }
  };

  const deleteBehavior = async (behaviorId: string) => {
    try {
      // Use any to bypass TypeScript errors until types are updated
      const { error } = await (supabase as any)
        .from('behaviors')
        .delete()
        .eq('id', behaviorId);

      if (error) {
        console.error('Error deleting behavior:', error);
        throw error;
      }

      toast({
        title: "¡Éxito!",
        description: "Comportamiento eliminado correctamente",
      });

      await loadBehaviors();
    } catch (err) {
      console.error('Error in deleteBehavior:', err);
      toast({
        title: "Error",
        description: "No se pudo eliminar el comportamiento",
        variant: "destructive",
      });
      throw err;
    }
  };

  return {
    behaviors,
    loading,
    error,
    loadBehaviors,
    createBehavior,
    updateBehavior,
    deleteBehavior
  };
};
