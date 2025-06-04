
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface SessionData {
  scenario: string;
  scenarioTitle: string;
  clientEmotion: string;
  interactionMode: 'call' | 'chat';
  selectedVoice?: string;
}

interface SessionEndData {
  duration: number;
  messages: any[];
  scenario: string;
}

export const useSessionManager = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isSessionActive, setIsSessionActive] = useState(false);

  const startSession = useCallback(async (sessionData: SessionData): Promise<string | null> => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "Debes estar autenticado para iniciar una sesión",
        variant: "destructive",
      });
      return null;
    }

    try {
      console.log('Creating session for user:', user.id);
      
      // Crear una nueva sesión de entrenamiento
      const { data: session, error } = await supabase
        .from('training_sessions')
        .insert({
          user_id: user.id,
          conversation_log: {
            scenario: sessionData.scenario,
            client_emotion: sessionData.clientEmotion,
            interaction_mode: sessionData.interactionMode,
            selected_voice: sessionData.selectedVoice,
            messages: []
          }
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating session:', error);
        throw error;
      }

      console.log('Session created successfully:', session);
      setCurrentSessionId(session.id);
      setIsSessionActive(true);

      return session.id;
    } catch (error) {
      console.error('Error starting session:', error);
      toast({
        title: "Error",
        description: "No se pudo iniciar la sesión de entrenamiento",
        variant: "destructive",
      });
      return null;
    }
  }, [user?.id, toast]);

  const endSession = useCallback(async (sessionEndData: SessionEndData): Promise<void> => {
    if (!currentSessionId || !user?.id) {
      return;
    }

    try {
      console.log('Ending session:', currentSessionId);
      
      // Actualizar la sesión con los datos finales
      const { error } = await supabase
        .from('training_sessions')
        .update({
          completed_at: new Date().toISOString(),
          duration_minutes: sessionEndData.duration,
          conversation_log: {
            scenario: sessionEndData.scenario,
            messages: sessionEndData.messages,
            duration: sessionEndData.duration
          },
          score: Math.floor(Math.random() * 41) + 60 // Puntuación simulada entre 60-100
        })
        .eq('id', currentSessionId);

      if (error) {
        console.error('Error ending session:', error);
        throw error;
      }

      console.log('Session ended successfully');
      setCurrentSessionId(null);
      setIsSessionActive(false);
    } catch (error) {
      console.error('Error ending session:', error);
      toast({
        title: "Error",
        description: "Hubo un problema al finalizar la sesión",
        variant: "destructive",
      });
    }
  }, [currentSessionId, user?.id, toast]);

  const getUserSessions = useCallback(async () => {
    if (!user?.id) return [];

    try {
      const { data: sessions, error } = await supabase
        .from('training_sessions')
        .select(`
          *,
          scenario:scenarios(title, description)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching sessions:', error);
        throw error;
      }

      return sessions || [];
    } catch (error) {
      console.error('Error fetching sessions:', error);
      return [];
    }
  }, [user?.id]);

  return {
    startSession,
    endSession,
    getUserSessions,
    currentSessionId,
    isSessionActive
  };
};
