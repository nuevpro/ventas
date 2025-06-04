
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Trophy, Target, Clock, TrendingUp, Star, Award } from 'lucide-react';

const ProgressDashboard = () => {
  const userStats = {
    level: 12,
    totalSessions: 45,
    averageScore: 78,
    weeklyGoal: 5,
    completedThisWeek: 3,
    streak: 7,
    totalTime: 1240, // minutes
    improvementRate: 15
  };

  const achievements = [
    { id: 1, title: 'Primera Llamada', icon: '🎯', earned: true },
    { id: 2, title: 'Semana Perfecta', icon: '⭐', earned: true },
    { id: 3, title: 'Especialista en Ventas', icon: '💼', earned: false },
    { id: 4, title: 'Maestro del Rapport', icon: '🤝', earned: true },
  ];

  const recentSessions = [
    { scenario: 'Llamada en Frío', score: 85, date: '2024-01-15', improvement: '+5' },
    { scenario: 'Manejo de Objeciones', score: 72, date: '2024-01-14', improvement: '+8' },
    { scenario: 'Entrevista Laboral', score: 90, date: '2024-01-13', improvement: '+12' },
  ];

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="space-y-6">
      {/* Stats generales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Nivel Actual</p>
                <p className="text-2xl font-bold">{userStats.level}</p>
              </div>
              <Trophy className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Puntuación Promedio</p>
                <p className="text-2xl font-bold">{userStats.averageScore}%</p>
              </div>
              <Target className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Tiempo Total</p>
                <p className="text-2xl font-bold">{formatTime(userStats.totalTime)}</p>
              </div>
              <Clock className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Racha Actual</p>
                <p className="text-2xl font-bold">{userStats.streak} días</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progreso semanal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="h-5 w-5 mr-2" />
            Progreso Semanal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {userStats.completedThisWeek} de {userStats.weeklyGoal} sesiones completadas
              </span>
              <span className="text-sm text-gray-500">
                {Math.round((userStats.completedThisWeek / userStats.weeklyGoal) * 100)}%
              </span>
            </div>
            <Progress value={(userStats.completedThisWeek / userStats.weeklyGoal) * 100} />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Logros */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Award className="h-5 w-5 mr-2" />
              Logros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className={`p-3 rounded-lg border text-center ${
                    achievement.earned
                      ? 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800'
                      : 'bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700 opacity-60'
                  }`}
                >
                  <div className="text-2xl mb-1">{achievement.icon}</div>
                  <div className="text-xs font-medium">{achievement.title}</div>
                  {achievement.earned && (
                    <Badge className="text-xs mt-1" variant="default">
                      Desbloqueado
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Sesiones recientes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Star className="h-5 w-5 mr-2" />
              Sesiones Recientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentSessions.map((session, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <div>
                    <div className="font-medium text-sm">{session.scenario}</div>
                    <div className="text-xs text-gray-500">{session.date}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg">{session.score}%</div>
                    <div className="text-xs text-green-600">
                      {session.improvement}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProgressDashboard;
