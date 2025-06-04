
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

// Use the actual database types
type DbTrainingSession = Database['public']['Tables']['training_sessions']['Row'];
type DbTrainingSessionInsert = Database['public']['Tables']['training_sessions']['Insert'];
type DbTrainingSessionUpdate = Database['public']['Tables']['training_sessions']['Update'];
type DbConversationMessage = Database['public']['Tables']['conversation_messages']['Row'];
type DbSessionEvaluation = Database['public']['Tables']['session_evaluations']['Row'];

// Extended interface for our application logic
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
  }

  async startSession(config: any): Promise<string | null> {
    if (!this.userId) {
      console.error('No user ID available');
      return null;
    }

    try {
      // Create a session data object that matches the database schema
      const sessionData: DbTrainingSessionInsert = {
        user_id: this.userId,
        scenario_id: config.scenario || 'default',
        duration_minutes: 0,
        score: 0,
        conversation_log: {
          scenario_title: config.scenarioTitle || 'Entrenamiento General',
          client_emotion: config.clientEmotion || 'neutral',
          interaction_mode: config.interactionMode || 'call',
          voice_used: config.selectedVoice || null,
          session_status: 'in_progress',
          started_at: new Date().toISOString(),
          total_messages: 0,
          user_words_count: 0,
          ai_words_count: 0
        }
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

      // Extend the session data with our application fields
      this.currentSession = {
        ...data,
        scenario_title: (data.conversation_log as any)?.scenario_title,
        client_emotion: (data.conversation_log as any)?.client_emotion,
        interaction_mode: (data.conversation_log as any)?.interaction_mode,
        voice_used: (data.conversation_log as any)?.voice_used,
        session_status: (data.conversation_log as any)?.session_status,
        started_at: (data.conversation_log as any)?.started_at,
        total_messages: (data.conversation_log as any)?.total_messages || 0,
        user_words_count: (data.conversation_log as any)?.user_words_count || 0,
        ai_words_count: (data.conversation_log as any)?.ai_words_count || 0
      };

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

      // Update session counters in conversation_log
      const wordCount = content.split(' ').length;
      const currentLog = this.currentSession.conversation_log as any || {};
      
      const updatedLog = {
        ...currentLog,
        total_messages: (this.currentSession.total_messages || 0) + 1,
        user_words_count: sender === 'user' 
          ? (this.currentSession.user_words_count || 0) + wordCount
          : (this.currentSession.user_words_count || 0),
        ai_words_count: sender === 'ai'
          ? (this.currentSession.ai_words_count || 0) + wordCount
          : (this.currentSession.ai_words_count || 0)
      };

      await supabase
        .from('training_sessions')
        .update({ conversation_log: updatedLog })
        .eq('id', this.currentSession.id);

      // Update local session
      this.currentSession.total_messages = updatedLog.total_messages;
      this.currentSession.user_words_count = updatedLog.user_words_count;
      this.currentSession.ai_words_count = updatedLog.ai_words_count;
      this.currentSession.conversation_log = updatedLog;

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
      const startTime = new Date(this.currentSession.started_at || this.currentSession.created_at || new Date());
      const durationMinutes = Math.floor((endTime.getTime() - startTime.getTime()) / (1000 * 60));

      const currentLog = this.currentSession.conversation_log as any || {};
      const updatedLog = {
        ...currentLog,
        session_status: 'completed',
        ended_at: endTime.toISOString()
      };

      await supabase
        .from('training_sessions')
        .update({
          completed_at: endTime.toISOString(),
          duration_minutes: durationMinutes,
          conversation_log: updatedLog
        })
        .eq('id', this.currentSession.id);

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

      // Transform the data to include our extended fields
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

      return (data || []).map(msg => ({
        ...msg,
        sender: msg.sender as 'user' | 'ai'
      })) as Message[];
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
