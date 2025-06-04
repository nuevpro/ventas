
import React, { useState } from 'react';
import { Edit, User, Mail, Calendar, Star, BookOpen, Trophy, Target } from 'lucide-react';
import StatCard from '@/components/StatCard';

const Profile = () => {
  const [activeTab, setActiveTab] = useState('Actividad reciente');

  const tabs = ['Actividad reciente', 'Estadísticas', 'Insignias'];

  const recentSessions = [
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
    {
      title: 'Bienvenida al Cliente - Escenario 1',
      level: 'Nivel 1: Bienvenida al Cliente',
      date: '5/23/2025',
      duration: '4 min',
      score: 55
    },
    {
      title: 'Bienvenida al Cliente - Escenario 1',
      level: 'Nivel 1: Bienvenida al Cliente',
      date: '5/21/2025',
      duration: '4 min',
      score: 58
    },
    {
      title: 'Bienvenida al Cliente - Escenario 1',
      level: 'Nivel 1: Bienvenida al Cliente',
      date: '5/21/2025',
      duration: '4 min',
      score: 49
    }
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mi Perfil</h1>
            <p className="text-gray-600 mt-2">Gestiona tu información personal y revisa tu progreso</p>
          </div>
          <button className="bg-gray-900 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors flex items-center">
            <Edit className="h-4 w-4 mr-2" />
            Editar perfil
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Info */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              {/* Avatar and Basic Info */}
              <div className="text-center mb-6">
                <div className="w-24 h-24 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-white">H</span>
                </div>
                <h2 className="text-xl font-bold text-gray-900">HS álvarez</h2>
                <p className="text-gray-600">proyecto@gmail.com</p>
                <span className="inline-block bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium mt-2">
                  Usuario
                </span>
              </div>

              {/* Level Progress */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Nivel 1: Novato</span>
                  <span className="text-sm text-gray-500">0 XP</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-600 h-2 rounded-full" style={{ width: '0%' }} />
                </div>
                <p className="text-xs text-gray-500 mt-1">100 XP para siguiente nivel</p>
              </div>

              {/* Quick Stats */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <BookOpen className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Sesiones</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">5</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Trophy className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Logros</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">0</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Target className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Rango #</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">-</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Star className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Puntos</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">0</span>
                </div>
              </div>

              {/* User Information */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="font-medium text-gray-900 mb-4">Información</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <User className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Nombre completo</p>
                      <p className="text-sm font-medium text-gray-900">HS álvarez</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Correo electrónico</p>
                      <p className="text-sm font-medium text-gray-900">proyecto@gmail.com</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <User className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Rol</p>
                      <p className="text-sm font-medium text-gray-900">Usuario</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Miembro desde</p>
                      <p className="text-sm font-medium text-gray-900">5/21/2025</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-2">
            {/* Tabs */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
              <div className="flex space-x-8 border-b border-gray-200">
                {tabs.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`py-2 px-1 border-b-2 font-medium transition-colors ${
                      activeTab === tab
                        ? 'border-purple-600 text-purple-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            {activeTab === 'Actividad reciente' && (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Sesiones de entrenamiento recientes</h3>
                <div className="space-y-4">
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
                        <button className="block mt-2 text-xs text-purple-600 hover:text-purple-700 font-medium">
                          Ver detalles
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'Estadísticas' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    icon={Trophy}
                    color="green"
                  />
                  <StatCard
                    title="XP total"
                    value="0"
                    icon={Star}
                    color="orange"
                  />
                </div>
              </div>
            )}

            {activeTab === 'Insignias' && (
              <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-200 text-center">
                <Trophy className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Aún no tienes insignias</h3>
                <p className="text-gray-600">Completa entrenamientos y logra objetivos para ganar insignias</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
