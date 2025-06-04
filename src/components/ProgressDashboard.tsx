
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Trophy, Target, TrendingUp, Clock } from 'lucide-react';
import StatCard from './StatCard';

interface ProgressData {
  overallProgress: number;
  completedScenarios: number;
  totalScenarios: number;
  averageScore: number;
  totalTime: number;
  achievements: Array<{
    id: string;
    title: string;
    description: string;
    earned: boolean;
    date?: Date;
  }>;
  recentSessions: Array<{
    id: string;
    scenario: string;
    score: number;
    date: Date;
    duration: number;
  }>;
}

interface ProgressDashboardProps {
  data: ProgressData;
}

const ProgressDashboard = ({ data }: ProgressDashboardProps) => {
  return (
    <div className="space-y-6">
      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Progreso General"
          value={`${data.overallProgress}%`}
          icon={TrendingUp}
          color="purple"
        />
        
        <StatCard
          title="Escenarios Completados"
          value={`${data.completedScenarios}/${data.totalScenarios}`}
          icon={Target}
          color="blue"
        />
        
        <StatCard
          title="Puntuación Promedio"
          value={`${data.averageScore}%`}
          icon={Trophy}
          color="green"
        />
        
        <StatCard
          title="Tiempo Total"
          value={`${Math.floor(data.totalTime / 60)}h ${data.totalTime % 60}m`}
          icon={Clock}
          color="orange"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Progress by Category */}
        <Card>
          <CardHeader>
            <CardTitle>Progreso por Categoría</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Ventas</span>
                <span className="text-sm text-gray-500">75%</span>
              </div>
              <Progress value={75} className="h-2" />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Reclutamiento</span>
                <span className="text-sm text-gray-500">45%</span>
              </div>
              <Progress value={45} className="h-2" />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Educación</span>
                <span className="text-sm text-gray-500">60%</span>
              </div>
              <Progress value={60} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Recent Sessions */}
        <Card>
          <CardHeader>
            <CardTitle>Sesiones Recientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.recentSessions.map((session) => (
                <div key={session.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <div className="font-medium">{session.scenario}</div>
                    <div className="text-sm text-gray-500">
                      {session.date.toLocaleDateString()} • {session.duration}min
                    </div>
                  </div>
                  <Badge
                    className={
                      session.score >= 80
                        ? 'bg-green-100 text-green-700'
                        : session.score >= 60
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700'
                    }
                  >
                    {session.score}%
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Trophy className="h-5 w-5 mr-2" />
            Logros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data.achievements.map((achievement) => (
              <div
                key={achievement.id}
                className={`p-4 rounded-lg border-2 ${
                  achievement.earned
                    ? 'border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20'
                    : 'border-gray-200 bg-gray-50 dark:bg-gray-800 opacity-60'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Trophy
                    className={`h-6 w-6 ${
                      achievement.earned ? 'text-yellow-600' : 'text-gray-400'
                    }`}
                  />
                  <div>
                    <div className="font-medium">{achievement.title}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      {achievement.description}
                    </div>
                    {achievement.earned && achievement.date && (
                      <div className="text-xs text-yellow-600 mt-1">
                        Obtenido: {achievement.date.toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProgressDashboard;
