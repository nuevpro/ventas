
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, Users, BookOpen, Trophy, Play, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import StatCard from '@/components/StatCard';
import ProgressDashboard from '@/components/ProgressDashboard';

const Dashboard = () => {
  // Mock data - en una aplicación real esto vendría de la base de datos
  const progressData = {
    overallProgress: 68,
    completedScenarios: 12,
    totalScenarios: 18,
    averageScore: 78,
    totalTime: 240, // minutes
    achievements: [
      {
        id: '1',
        title: 'Primer Contacto',
        description: 'Completa tu primera conversación',
        earned: true,
        date: new Date('2024-01-15')
      },
      {
        id: '2',
        title: 'Vendedor Experto',
        description: 'Alcanza 90% en 5 escenarios de ventas',
        earned: false
      },
      {
        id: '3',
        title: 'Comunicador Efectivo',
        description: 'Mantén una puntuación promedio de 85%',
        earned: true,
        date: new Date('2024-02-20')
      },
    ],
    recentSessions: [
      {
        id: '1',
        scenario: 'Llamada en Frío - Ventas',
        score: 85,
        date: new Date('2024-03-01'),
        duration: 18
      },
      {
        id: '2',
        scenario: 'Manejo de Objeciones',
        score: 72,
        date: new Date('2024-02-28'),
        duration: 22
      },
      {
        id: '3',
        scenario: 'Entrevista de Selección',
        score: 91,
        date: new Date('2024-02-26'),
        duration: 35
      },
    ]
  };

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Bienvenido a tu plataforma de entrenamiento con IA
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link to="/training">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                    <Play className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Iniciar Entrenamiento</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      Comienza una nueva sesión de práctica
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link to="/challenges">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <Trophy className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Ver Desafíos</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      Participa en retos y competiciones
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link to="/achievements">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                    <BarChart3 className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Ver Progreso</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      Revisa tu evolución y logros
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Progress Dashboard */}
        <ProgressDashboard data={progressData} />
      </div>
    </div>
  );
};

export default Dashboard;
