
import React from 'react';
import { Clock, Target, Trophy, BookOpen, TrendingUp, Star } from 'lucide-react';
import StatCard from '@/components/StatCard';
import ProgressBar from '@/components/ProgressBar';

const Dashboard = () => {
  const recentSessions = [
    { 
      title: 'Bienvenida al Cliente - Escenario 1', 
      level: 'Nivel 1: Bienvenida al Cliente',
      date: '6/4/2025',
      duration: '0 min',
      score: 0 
    },
    { 
      title: 'Bienvenida al Cliente - Escenario 1', 
      level: 'Nivel 1: Bienvenida al Cliente',
      date: '6/3/2025',
      duration: '7 min',
      score: 63 
    },
    { 
      title: 'Bienvenida al Cliente - Escenario 1', 
      level: 'Nivel 1: Bienvenida al Cliente',
      date: '5/30/2025',
      duration: '0 min',
      score: 0 
    },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Bienvenido de vuelta, HS álvarez</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total de sesiones"
            value="6"
            icon={BookOpen}
            color="purple"
          />
          <StatCard
            title="Puntuación media"
            value="36%"
            icon={Target}
            color="blue"
          />
          <StatCard
            title="Mejor puntuación"
            value="63%"
            icon={TrendingUp}
            color="green"
          />
          <StatCard
            title="Tiempo total"
            value="0 h 21 min"
            icon={Clock}
            color="orange"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Progress Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Tu progreso</h3>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Progreso del nivel</span>
                    <span className="text-sm text-gray-500">10%</span>
                  </div>
                  <ProgressBar progress={10} />
                  <p className="text-xs text-gray-500 mt-1">0/3 escenarios completados</p>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-3">Estadísticas</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Intentos</p>
                      <p className="text-xl font-bold text-gray-900">6</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Mejor puntuación</p>
                      <p className="text-xl font-bold text-gray-900">63%</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">XP ganado</p>
                      <p className="text-xl font-bold text-gray-900">0</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Sessions */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Sesiones recientes</h3>
              <div className="space-y-3">
                {recentSessions.map((session, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{session.title}</h4>
                      <p className="text-sm text-gray-600">{session.level}</p>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-xs text-gray-500">{session.date}</span>
                        <span className="text-xs text-gray-500">{session.duration}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-lg font-bold ${session.score === 0 ? 'text-gray-400' : 'text-purple-600'}`}>
                        {session.score}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar Content */}
          <div className="space-y-6">
            {/* Level Progress */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Nivel Actual</h3>
              <div className="text-center">
                <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Star className="h-8 w-8 text-purple-600" />
                </div>
                <h4 className="font-semibold text-gray-900">Nivel 1: Novato</h4>
                <p className="text-sm text-gray-600 mt-1">0 XP</p>
                <ProgressBar progress={0} className="mt-3" />
                <p className="text-xs text-gray-500 mt-1">100 XP para siguiente nivel</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones rápidas</h3>
              <div className="space-y-3">
                <button className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-purple-700 transition-colors">
                  Continuar entrenamiento
                </button>
                <button className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                  Ver logros
                </button>
              </div>
            </div>

            {/* Achievements Preview */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Logros recientes</h3>
              <div className="text-center text-gray-500">
                <Trophy className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">Aún no tienes logros</p>
                <p className="text-xs">¡Completa tu primer escenario para empezar!</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
