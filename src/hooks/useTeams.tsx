
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type Team = Database['public']['Tables']['teams']['Row'];

export const useTeams = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [teams, setTeams] = useState<Team[]>([]);
  const [userTeams, setUserTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    loadTeams();
  }, [user?.id]);

  const loadTeams = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('useTeams: Loading teams for user:', user.id);

      // Cargar todos los equipos públicos
      const { data: allTeams, error: teamsError } = await supabase
        .from('teams')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false });

      if (teamsError) throw teamsError;

      // Cargar equipos del usuario
      const { data: memberTeams, error: memberError } = await supabase
        .from('team_members')
        .select(`
          team:teams(*)
        `)
        .eq('user_id', user.id);

      if (memberError) throw memberError;

      setTeams(allTeams || []);
      setUserTeams(memberTeams?.map(mt => mt.team).filter(Boolean) as Team[] || []);
    } catch (err) {
      console.error('useTeams: Error loading teams:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const createTeam = async (teamData: { name: string; description?: string; isPublic: boolean; maxMembers?: number }) => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "Usuario no autenticado",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: newTeam, error } = await supabase
        .from('teams')
        .insert({
          name: teamData.name,
          description: teamData.description,
          is_public: teamData.isPublic,
          max_members: teamData.maxMembers || 10,
          captain_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      // Agregar al usuario como miembro del equipo
      await supabase
        .from('team_members')
        .insert({
          team_id: newTeam.id,
          user_id: user.id,
          role: 'captain'
        });

      toast({
        title: "¡Éxito!",
        description: "Equipo creado correctamente.",
      });

      loadTeams();
      return newTeam;
    } catch (err) {
      console.error('useTeams: Error creating team:', err);
      toast({
        title: "Error",
        description: "No se pudo crear el equipo.",
        variant: "destructive",
      });
      throw err;
    }
  };

  const joinTeam = async (teamId: string) => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "Usuario no autenticado",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('team_members')
        .insert({
          team_id: teamId,
          user_id: user.id,
          role: 'member'
        });

      if (error) throw error;

      toast({
        title: "¡Éxito!",
        description: "Te has unido al equipo correctamente.",
      });

      loadTeams();
    } catch (err) {
      console.error('useTeams: Error joining team:', err);
      toast({
        title: "Error",
        description: "No se pudo unir al equipo.",
        variant: "destructive",
      });
    }
  };

  return {
    teams,
    userTeams,
    loading,
    error,
    createTeam,
    joinTeam,
    refreshTeams: loadTeams
  };
};
