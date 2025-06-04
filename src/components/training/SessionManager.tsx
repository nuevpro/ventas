
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

interface ConversationLog {
  scenario?: string;
  client_emotion?: string;
  interaction_mode?: string;
  selected_voice?: string;
  messages?: any[];
  duration?: number;
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

  const saveMessage = useCallback(async (content: string, sender: 'user' | 'ai', timestamp: number, audioUrl?: string): Promise<void> => {
    if (!currentSessionId) return;

    try {
      // Obtener la sesión actual
      const { data: session, error: fetchError } = await supabase
        .from('training_sessions')
        .select('conversation_log')
        .eq('id', currentSessionId)
        .single();

      if (fetchError) throw fetchError;

      // Type guard para conversation_log
      const conversationLog = session.conversation_log as ConversationLog | null;
      const existingMessages = conversationLog?.messages || [];

      // Agregar el nuevo mensaje
      const updatedMessages = [
        ...existingMessages,
        {
          id: Date.now().toString(),
          content,
          sender,
          timestamp,
          audioUrl
        }
      ];

      // Actualizar la sesión
      const { error: updateError } = await supabase
        .from('training_sessions')
        .update({
          conversation_log: {
            ...(conversationLog || {}),
            messages: updatedMessages
          }
        })
        .eq('id', currentSessionId);

      if (updateError) throw updateError;
    } catch (error) {
      console.error('Error saving message:', error);
    }
  }, [currentSessionId]);

  const saveRealTimeMetric = useCallback(async (metricType: string, value: number): Promise<void> => {
    if (!currentSessionId) return;

    try {
      // Guardar métrica en tiempo real (esto podría expandirse para una tabla específica)
      console.log(`Saving metric ${metricType}: ${value} for session ${currentSessionId}`);
    } catch (error) {
      console.error('Error saving metric:', error);
    }
  }, [currentSessionId]);

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

  const getUserSessions = useCallback(async (): Promise<any[]> => {
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

  const getSessionMessages = useCallback(async (sessionId: string): Promise<any[]> => {
    try {
      const { data: session, error } = await supabase
        .from('training_sessions')
        .select('conversation_log')
        .eq('id', sessionId)
        .single();

      if (error) throw error;

      // Type guard para conversation_log
      const conversationLog = session.conversation_log as ConversationLog | null;
      return conversationLog?.messages || [];
    } catch (error) {
      console.error('Error fetching session messages:', error);
      return [];
    }
  }, []);

  const getSessionEvaluation = useCallback(async (sessionId: string): Promise<any | null> => {
    try {
      const { data: session, error } = await supabase
        .from('training_sessions')
        .select('score, conversation_log')
        .eq('id', sessionId)
        .single();

      if (error) throw error;

      // Simular evaluación detallada
      return {
        overall_score: session.score || 0,
        rapport_score: Math.floor(Math.random() * 20) + 70,
        clarity_score: Math.floor(Math.random() * 20) + 75,
        empathy_score: Math.floor(Math.random() * 20) + 65,
        accuracy_score: Math.floor(Math.random() * 20) + 80,
        specific_feedback: "Buena comunicación general. Considera mejorar la empatía en situaciones difíciles."
      };
    } catch (error) {
      console.error('Error fetching session evaluation:', error);
      return null;
    }
  }, []);

  return {
    startSession,
    endSession,
    saveMessage,
    saveRealTimeMetric,
    getUserSessions,
    getSessionMessages,
    getSessionEvaluation,
    currentSessionId,
    isSessionActive
  };
};
