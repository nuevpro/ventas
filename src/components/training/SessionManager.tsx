
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type DbTrainingSession = Database['public']['Tables']['training_sessions']['Row'];
type DbTrainingSessionInsert = Database['public']['Tables']['training_sessions']['Insert'];
type DbConversationMessage = Database['public']['Tables']['conversation_messages']['Row'];
type DbSessionEvaluation = Database['public']['Tables']['session_evaluations']['Row'];

interface SessionData extends DbTrainingSession {
  scenario_title?: string;
  client_emotion?: string;
  interaction_mode?: string;
  voice_used?: string;
  session_status?: string;
  started_at?: string;
  ended_at?: string;
  duration_seconds?: number;
  total_messages?: number;
  user_words_count?: number;
  ai_words_count?: number;
}

interface Message extends DbConversationMessage {
  sender: 'user' | 'ai';
}

interface SessionEvaluation extends DbSessionEvaluation {}

export class SessionManager {
  private static instance: SessionManager;
  private currentSession: SessionData | null = null;
  private toast: any;
  private userId: string | null = null;

  private constructor() {}

  static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager();
    }
    return SessionManager.instance;
  }

  setToast(toast: any) {
    this.toast = toast;
  }

  setUserId(userId: string) {
    this.userId = userId;
    console.log('SessionManager: Setting user ID:', userId);
  }

  async startSession(config: any): Promise<string | null> {
    if (!this.userId) {
      console.error('SessionManager: No user ID available');
      this.toast?.({
        title: "Error",
        description: "Usuario no autenticado",
        variant: "destructive",
      });
      return null;
    }

    try {
      console.log('SessionManager: Creating session for user:', this.userId);
      
      const conversationLog = {
        scenario_title: config.scenarioTitle || 'Entrenamiento General',
        client_emotion: config.clientEmotion || 'neutral',
        interaction_mode: config.interactionMode || 'chat',
        voice_used: config.selectedVoiceName || null,
        session_status: 'in_progress',
        started_at: new Date().toISOString(),
        total_messages: 0,
        user_words_count: 0,
        ai_words_count: 0
      };

      const sessionData: DbTrainingSessionInsert = {
        user_id: this.userId,
        scenario_id: config.scenario || 'sales-cold-call',
        duration_minutes: 0,
        score: 0,
        conversation_log: conversationLog as any
      };

      console.log('SessionManager: Inserting session data:', sessionData);

      const { data, error } = await supabase
        .from('training_sessions')
        .insert(sessionData)
        .select()
        .single();

      if (error) {
        console.error('SessionManager: Error creating session:', error);
        this.toast?.({
          title: "Error",
          description: `No se pudo crear la sesión: ${error.message}`,
          variant: "destructive",
        });
        return null;
      }

      this.currentSession = {
        ...data,
        ...conversationLog
      };

      console.log('SessionManager: Session created successfully:', data.id);
      this.toast?.({
        title: "¡Éxito!",
        description: "Sesión iniciada correctamente",
      });
      
      return data.id;
    } catch (error) {
      console.error('SessionManager: Error starting session:', error);
      this.toast?.({
        title: "Error",
        description: "Error al iniciar la sesión",
        variant: "destructive",
      });
      return null;
    }
  }

  async saveMessage(sessionId: string, content: string, sender: 'user' | 'ai', timestampInSession: number): Promise<void> {
    try {
      const { error } = await supabase
        .from('conversation_messages')
        .insert({
          session_id: sessionId,
          content,
          sender,
          timestamp_in_session: timestampInSession
        });

      if (error) {
        console.error('SessionManager: Error saving message:', error);
        throw error;
      }
    } catch (error) {
      console.error('SessionManager: Error in saveMessage:', error);
    }
  }

  async saveRealTimeMetric(sessionId: string, metricName: string, metricValue: number): Promise<void> {
    try {
      const { error } = await supabase
        .from('real_time_metrics')
        .insert({
          session_id: sessionId,
          metric_name: metricName,
          metric_value: metricValue
        });

      if (error) {
        console.error('SessionManager: Error saving metric:', error);
        throw error;
      }
    } catch (error) {
      console.error('SessionManager: Error in saveRealTimeMetric:', error);
    }
  }

  async endSession(sessionId: string, finalScore: number): Promise<void> {
    try {
      const endTime = new Date().toISOString();
      const currentSession = this.currentSession;
      
      if (currentSession?.conversation_log) {
        const updatedConversationLog = {
          ...currentSession.conversation_log as any,
          session_status: 'completed',
          ended_at: endTime
        };

        const { error } = await supabase
          .from('training_sessions')
          .update({
            completed_at: endTime,
            score: finalScore,
            conversation_log: updatedConversationLog
          })
          .eq('id', sessionId);

        if (error) {
          console.error('SessionManager: Error ending session:', error);
          throw error;
        }

        this.currentSession = null;
        console.log('SessionManager: Session ended successfully');
      }
    } catch (error) {
      console.error('SessionManager: Error in endSession:', error);
    }
  }

  async saveEvaluation(sessionId: string, evaluation: Partial<SessionEvaluation>): Promise<void> {
    try {
      const { error } = await supabase
        .from('session_evaluations')
        .insert({
          session_id: sessionId,
          ...evaluation
        });

      if (error) {
        console.error('SessionManager: Error saving evaluation:', error);
        throw error;
      }
    } catch (error) {
      console.error('SessionManager: Error in saveEvaluation:', error);
    }
  }

  async getUserSessions(limit: number = 10): Promise<SessionData[]> {
    if (!this.userId) {
      console.log('SessionManager: No user ID for getUserSessions');
      return [];
    }

    try {
      console.log('SessionManager: Fetching sessions for user:', this.userId);
      
      const { data, error } = await supabase
        .from('training_sessions')
        .select('*')
        .eq('user_id', this.userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('SessionManager: Error fetching sessions:', error);
        return [];
      }

      console.log('SessionManager: Sessions fetched:', data?.length || 0);

      return (data || []).map(session => ({
        ...session,
        scenario_title: (session.conversation_log as any)?.scenario_title,
        client_emotion: (session.conversation_log as any)?.client_emotion,
        interaction_mode: (session.conversation_log as any)?.interaction_mode,
        voice_used: (session.conversation_log as any)?.voice_used,
        session_status: (session.conversation_log as any)?.session_status || 'completed',
        started_at: (session.conversation_log as any)?.started_at,
        ended_at: (session.conversation_log as any)?.ended_at,
        duration_seconds: session.duration_minutes ? session.duration_minutes * 60 : 0,
        total_messages: (session.conversation_log as any)?.total_messages || 0,
        user_words_count: (session.conversation_log as any)?.user_words_count || 0,
        ai_words_count: (session.conversation_log as any)?.ai_words_count || 0
      })) as SessionData[];
    } catch (error) {
      console.error('SessionManager: Error in getUserSessions:', error);
      return [];
    }
  }

  async getSessionMessages(sessionId: string): Promise<Message[]> {
    try {
      const { data, error } = await supabase
        .from('conversation_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('timestamp_in_session', { ascending: true });

      if (error) {
        console.error('SessionManager: Error fetching messages:', error);
        return [];
      }

      return (data || []).map(msg => ({
        ...msg,
        sender: msg.sender as 'user' | 'ai'
      }));
    } catch (error) {
      console.error('SessionManager: Error in getSessionMessages:', error);
      return [];
    }
  }

  async getSessionEvaluation(sessionId: string): Promise<SessionEvaluation | null> {
    try {
      const { data, error } = await supabase
        .from('session_evaluations')
        .select('*')
        .eq('session_id', sessionId)
        .maybeSingle();

      if (error) {
        console.error('SessionManager: Error fetching evaluation:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('SessionManager: Error in getSessionEvaluation:', error);
      return null;
    }
  }

  getCurrentSession(): SessionData | null {
    return this.currentSession;
  }
}

export const useSessionManager = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const sessionManager = SessionManager.getInstance();

  useEffect(() => {
    sessionManager.setToast(toast);
    if (user?.id) {
      console.log('useSessionManager: Setting user ID:', user.id);
      sessionManager.setUserId(user.id);
    }
  }, [user, toast]);

  return sessionManager;
};
