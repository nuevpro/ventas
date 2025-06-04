
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface SessionData {
  id: string;
  user_id: string;
  scenario_id: string;
  scenario_title: string;
  client_emotion: string;
  interaction_mode: string;
  voice_used?: string;
  session_status: string;
  started_at: string;
  ended_at?: string;
  duration_seconds: number;
  total_messages: number;
  user_words_count: number;
  ai_words_count: number;
  created_at: string;
  updated_at: string;
}

interface Message {
  id: string;
  session_id: string;
  sender: 'user' | 'ai';
  content: string;
  timestamp_in_session: number;
  audio_url?: string;
  created_at: string;
}

interface SessionEvaluation {
  id: string;
  session_id: string;
  rapport_score?: number;
  clarity_score?: number;
  empathy_score?: number;
  accuracy_score?: number;
  overall_score?: number;
  strengths?: string[];
  improvements?: string[];
  specific_feedback?: string;
  ai_analysis?: any;
}

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
  }

  async startSession(config: any): Promise<string | null> {
    if (!this.userId) {
      console.error('No user ID available');
      return null;
    }

    try {
      const sessionData = {
        user_id: this.userId,
        scenario_id: config.scenario || 'default',
        scenario_title: config.scenarioTitle || 'Entrenamiento General',
        client_emotion: config.clientEmotion || 'neutral',
        interaction_mode: config.interactionMode || 'call',
        voice_used: config.selectedVoice || null,
        session_status: 'in_progress',
        started_at: new Date().toISOString(),
        duration_seconds: 0,
        total_messages: 0,
        user_words_count: 0,
        ai_words_count: 0
      };

      const { data, error } = await supabase
        .from('training_sessions')
        .insert(sessionData)
        .select()
        .single();

      if (error) {
        console.error('Error creating session:', error);
        this.toast?.({
          title: "Error",
          description: "No se pudo crear la sesión de entrenamiento",
          variant: "destructive",
        });
        return null;
      }

      this.currentSession = data as SessionData;
      return data.id;
    } catch (error) {
      console.error('Error starting session:', error);
      return null;
    }
  }

  async saveMessage(content: string, sender: 'user' | 'ai', timestampInSession: number, audioUrl?: string): Promise<boolean> {
    if (!this.currentSession) {
      console.error('No active session');
      return false;
    }

    try {
      const messageData = {
        session_id: this.currentSession.id,
        sender,
        content,
        timestamp_in_session: timestampInSession,
        audio_url: audioUrl || null
      };

      const { error } = await supabase
        .from('conversation_messages')
        .insert(messageData);

      if (error) {
        console.error('Error saving message:', error);
        return false;
      }

      // Actualizar contadores de la sesión
      const wordCount = content.split(' ').length;
      const updates: any = {
        total_messages: this.currentSession.total_messages + 1,
      };
      
      if (sender === 'user') {
        updates.user_words_count = this.currentSession.user_words_count + wordCount;
      } else {
        updates.ai_words_count = this.currentSession.ai_words_count + wordCount;
      }
      
      await supabase
        .from('training_sessions')
        .update(updates)
        .eq('id', this.currentSession.id);

      // Actualizar la sesión local
      this.currentSession = { ...this.currentSession, ...updates };

      return true;
    } catch (error) {
      console.error('Error saving message:', error);
      return false;
    }
  }

  async saveRealTimeMetric(metricName: string, metricValue: number): Promise<void> {
    if (!this.currentSession) return;

    try {
      await supabase
        .from('real_time_metrics')
        .insert({
          session_id: this.currentSession.id,
          metric_name: metricName,
          metric_value: metricValue
        });
    } catch (error) {
      console.error('Error saving metric:', error);
    }
  }

  async endSession(evaluation?: any): Promise<void> {
    if (!this.currentSession) return;

    try {
      const endTime = new Date();
      const startTime = new Date(this.currentSession.started_at);
      const durationSeconds = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);

      // Actualizar sesión
      await supabase
        .from('training_sessions')
        .update({
          session_status: 'completed',
          ended_at: endTime.toISOString(),
          duration_seconds: durationSeconds
        })
        .eq('id', this.currentSession.id);

      // Guardar evaluación si existe
      if (evaluation) {
        await this.saveEvaluation(evaluation);
      }

      this.currentSession = null;
    } catch (error) {
      console.error('Error ending session:', error);
    }
  }

  async saveEvaluation(evaluation: any): Promise<void> {
    if (!this.currentSession) return;

    try {
      const evaluationData = {
        session_id: this.currentSession.id,
        rapport_score: evaluation.rapport || null,
        clarity_score: evaluation.clarity || null,
        empathy_score: evaluation.empathy || null,
        accuracy_score: evaluation.accuracy || null,
        overall_score: evaluation.overallScore || null,
        strengths: evaluation.strengths || [],
        improvements: evaluation.improvements || [],
        specific_feedback: evaluation.specificFeedback || null,
        ai_analysis: evaluation.aiAnalysis || null
      };

      const { error } = await supabase
        .from('session_evaluations')
        .insert(evaluationData);

      if (error) {
        console.error('Error saving evaluation:', error);
      }
    } catch (error) {
      console.error('Error saving evaluation:', error);
    }
  }

  async getUserSessions(limit: number = 10): Promise<SessionData[]> {
    if (!this.userId) return [];

    try {
      const { data, error } = await supabase
        .from('training_sessions')
        .select('*')
        .eq('user_id', this.userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching sessions:', error);
        return [];
      }

      return (data || []) as SessionData[];
    } catch (error) {
      console.error('Error fetching sessions:', error);
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
        console.error('Error fetching messages:', error);
        return [];
      }

      return (data || []) as Message[];
    } catch (error) {
      console.error('Error fetching messages:', error);
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
        console.error('Error fetching evaluation:', error);
        return null;
      }

      return data as SessionEvaluation | null;
    } catch (error) {
      console.error('Error fetching evaluation:', error);
      return null;
    }
  }

  getCurrentSession(): SessionData | null {
    return this.currentSession;
  }
}

// Hook para usar el SessionManager
export const useSessionManager = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const sessionManager = SessionManager.getInstance();

  useEffect(() => {
    sessionManager.setToast(toast);
    if (user?.id) {
      sessionManager.setUserId(user.id);
    }
  }, [user, toast]);

  return sessionManager;
};
