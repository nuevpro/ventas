
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import StatCard from '@/components/StatCard';
import { 
  Target, 
  TrendingUp, 
  Clock, 
  Award,
  Play,
  Calendar,
  Users,
  BarChart3
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const Dashboard = () => {
  const { user } = useAuth();

  const { data: userStats } = useQuery({
    queryKey: ['userStats', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', user?.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id
  });

  const { data: recentSessions } = useQuery({
    queryKey: ['recentSessions', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('training_sessions')
        .select(`
          *,
          scenarios (
            title,
            difficulty_level
          )
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id
  });

  const { data: achievements } = useQuery({
    queryKey: ['userAchievements', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_achievements')
        .select(`
          *,
          achievements (
            title,
            description,
            icon
          )
        `)
        .eq('user_id', user?.id)
        .order('earned_at', { ascending: false })
        .limit(3);
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id
  });

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Bienvenido de vuelta, {user?.user_metadata?.full_name || user?.email}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Nivel Actual"
            value={userStats?.level || 1}
            subtitle={`${userStats?.total_xp || 0} XP`}
            icon={Target}
            color="purple"
          />
          <StatCard
            title="Puntuación Media"
            value={`${userStats?.average_score || 0}%`}
            subtitle="Última semana"
            icon={TrendingUp}
            color="green"
          />
          <StatCard
            title="Tiempo Total"
            value={`${userStats?.total_time_minutes || 0}m`}
            subtitle="En entrenamientos"
            icon={Clock}
            color="blue"
          />
          <StatCard
            title="Sesiones"
            value={userStats?.total_sessions || 0}
            subtitle="Completadas"
            icon={Award}
            color="orange"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Acciones Rápidas</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Button className="bg-purple-600 hover:bg-purple-700 text-white h-12">
                  <Play className="mr-2 h-5 w-5" />
                  Iniciar Entrenamiento
                </Button>
                <Button variant="outline" className="h-12 dark:border-gray-600">
                  <Calendar className="mr-2 h-5 w-5" />
                  Ver Calendario
                </Button>
                <Button variant="outline" className="h-12 dark:border-gray-600">
                  <Users className="mr-2 h-5 w-5" />
                  Unirse a Desafío
                </Button>
                <Button variant="outline" className="h-12 dark:border-gray-600">
                  <BarChart3 className="mr-2 h-5 w-5" />
                  Ver Progreso
                </Button>
              </div>
            </div>

            {/* Recent Sessions */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Sesiones Recientes</h2>
              {recentSessions && recentSessions.length > 0 ? (
                <div className="space-y-3">
                  {recentSessions.map((session) => (
                    <div key={session.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {session.scenarios?.title || 'Sesión de entrenamiento'}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(session.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900 dark:text-white">{session.score}%</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{session.duration_minutes}m</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Play className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">No hay sesiones recientes</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500">¡Inicia tu primer entrenamiento!</p>
                </div>
              )}
            </div>
          </div>

          {/* Achievements & Progress */}
          <div className="space-y-6">
            {/* Recent Achievements */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Logros Recientes</h2>
              {achievements && achievements.length > 0 ? (
                <div className="space-y-3">
                  {achievements.map((achievement) => (
                    <div key={achievement.id} className="flex items-center space-x-3">
                      <div className="text-2xl">{achievement.achievements?.icon}</div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white text-sm">
                          {achievement.achievements?.title}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(achievement.earned_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <Award className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">No hay logros aún</p>
                </div>
              )}
            </div>

            {/* Progress Bar */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Progreso del Nivel</h2>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Nivel {userStats?.level || 1}</span>
                  <span className="text-gray-600 dark:text-gray-400">{userStats?.total_xp || 0} XP</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${Math.min(((userStats?.total_xp || 0) % 1000) / 10, 100)}%` 
                    }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {1000 - ((userStats?.total_xp || 0) % 1000)} XP para el siguiente nivel
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
