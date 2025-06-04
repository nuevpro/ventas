
import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Función para manejar cambios de autenticación
    const handleAuthChange = async (event: string, session: Session | null) => {
      if (!mounted) return;
      
      console.log('Auth state change:', event, session?.user?.id);
      setSession(session);
      setUser(session?.user ?? null);
      
      // Si hay un usuario nuevo, crear su perfil
      if (event === 'SIGNED_IN' && session?.user) {
        setTimeout(async () => {
          await ensureUserProfile(session.user);
        }, 100);
      }
      
      setLoading(false);
    };

    // Configurar listener de cambios de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthChange);

    // Obtener sesión inicial
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error getting session:', error);
        } else {
          console.log('Initial session:', session?.user?.id);
          if (mounted) {
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
              await ensureUserProfile(session.user);
            }
          }
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    getInitialSession();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const ensureUserProfile = async (user: User) => {
    try {
      // Verificar si el perfil ya existe
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();

      if (!existingProfile) {
        // Crear perfil si no existe
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email || '',
            full_name: user.user_metadata?.full_name || user.email || '',
            role: 'user'
          });

        if (profileError) {
          console.error('Error creating profile:', profileError);
        } else {
          console.log('Profile created for user:', user.id);
        }
      }

      // Verificar si las stats ya existen
      const { data: existingStats } = await supabase
        .from('user_stats')
        .select('user_id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!existingStats) {
        // Crear stats si no existen
        const { error: statsError } = await supabase
          .from('user_stats')
          .insert({
            user_id: user.id,
            total_sessions: 0,
            total_time_minutes: 0,
            best_score: 0,
            average_score: 0,
            total_xp: 0,
            level: 1,
            current_streak: 0
          });

        if (statsError) {
          console.error('Error creating user stats:', statsError);
        } else {
          console.log('User stats created for user:', user.id);
        }
      }
    } catch (error) {
      console.error('Error ensuring user profile:', error);
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName
          }
        }
      });
      
      return { error };
    } catch (error) {
      console.error('SignUp error:', error);
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      return { error };
    } catch (error) {
      console.error('SignIn error:', error);
      return { error };
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
    } catch (error) {
      console.error('SignOut error:', error);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    session,
    signUp,
    signIn,
    signOut,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
