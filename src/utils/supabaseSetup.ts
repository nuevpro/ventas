
import { supabase } from '@/integrations/supabase/client';

export const setupRLSPolicies = async () => {
  try {
    // Configurar políticas RLS para training_sessions
    await supabase.rpc('exec_sql', {
      sql: `
        -- Configurar políticas RLS para training_sessions
        ALTER TABLE public.training_sessions ENABLE ROW LEVEL SECURITY;

        -- Política para que los usuarios puedan ver sus propias sesiones
        CREATE POLICY "Users can view own training sessions" 
          ON public.training_sessions 
          FOR SELECT 
          USING (auth.uid() = user_id);

        -- Política para que los usuarios puedan insertar sus propias sesiones
        CREATE POLICY "Users can insert own training sessions" 
          ON public.training_sessions 
          FOR INSERT 
          WITH CHECK (auth.uid() = user_id);

        -- Política para que los usuarios puedan actualizar sus propias sesiones
        CREATE POLICY "Users can update own training sessions" 
          ON public.training_sessions 
          FOR UPDATE 
          USING (auth.uid() = user_id);

        -- Configurar políticas RLS para conversation_messages
        ALTER TABLE public.conversation_messages ENABLE ROW LEVEL SECURITY;

        -- Política para que los usuarios puedan ver mensajes de sus sesiones
        CREATE POLICY "Users can view own conversation messages" 
          ON public.conversation_messages 
          FOR SELECT 
          USING (EXISTS (
            SELECT 1 FROM public.training_sessions 
            WHERE id = conversation_messages.session_id 
            AND user_id = auth.uid()
          ));

        -- Política para que los usuarios puedan insertar mensajes en sus sesiones
        CREATE POLICY "Users can insert own conversation messages" 
          ON public.conversation_messages 
          FOR INSERT 
          WITH CHECK (EXISTS (
            SELECT 1 FROM public.training_sessions 
            WHERE id = conversation_messages.session_id 
            AND user_id = auth.uid()
          ));

        -- Configurar políticas RLS para session_evaluations
        ALTER TABLE public.session_evaluations ENABLE ROW LEVEL SECURITY;

        -- Política para que los usuarios puedan ver evaluaciones de sus sesiones
        CREATE POLICY "Users can view own session evaluations" 
          ON public.session_evaluations 
          FOR SELECT 
          USING (EXISTS (
            SELECT 1 FROM public.training_sessions 
            WHERE id = session_evaluations.session_id 
            AND user_id = auth.uid()
          ));

        -- Política para que los usuarios puedan insertar evaluaciones en sus sesiones
        CREATE POLICY "Users can insert own session evaluations" 
          ON public.session_evaluations 
          FOR INSERT 
          WITH CHECK (EXISTS (
            SELECT 1 FROM public.training_sessions 
            WHERE id = session_evaluations.session_id 
            AND user_id = auth.uid()
          ));

        -- Configurar políticas RLS para real_time_metrics
        ALTER TABLE public.real_time_metrics ENABLE ROW LEVEL SECURITY;

        -- Política para que los usuarios puedan ver métricas de sus sesiones
        CREATE POLICY "Users can view own real time metrics" 
          ON public.real_time_metrics 
          FOR SELECT 
          USING (EXISTS (
            SELECT 1 FROM public.training_sessions 
            WHERE id = real_time_metrics.session_id 
            AND user_id = auth.uid()
          ));

        -- Política para que los usuarios puedan insertar métricas en sus sesiones
        CREATE POLICY "Users can insert own real time metrics" 
          ON public.real_time_metrics 
          FOR INSERT 
          WITH CHECK (EXISTS (
            SELECT 1 FROM public.training_sessions 
            WHERE id = real_time_metrics.session_id 
            AND user_id = auth.uid()
          ));
      `
    });

    console.log('RLS policies configured successfully');
  } catch (error) {
    console.error('Error configuring RLS policies:', error);
  }
};
