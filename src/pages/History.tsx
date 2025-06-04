
import React, { useState } from 'react';
import { Search, Filter, Eye } from 'lucide-react';
import StatCard from '@/components/StatCard';
import { Clock, Target, Trophy, BookOpen } from 'lucide-react';

const History = () => {
  const [selectedFilter, setSelectedFilter] = useState('Todos los niveles');

  const globalStats = [
    { title: 'Total de sesiones', value: '6', icon: BookOpen, color: 'purple' as const },
    { title: 'Puntuación media', value: '36%', icon: Target, color: 'blue' as const },
    { title: 'Mejor puntuación', value: '63%', icon: Trophy, color: 'green' as const },
    { title: 'Tiempo total', value: '0 h 21 min', icon: Clock, color: 'orange' as const },
  ];

  const sessions = [
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
      date: '3/6/2025',
      duration: '7 min',
      score: 63
    },
    {
      title: 'Bienvenida al Cliente - Escenario 1',
      level: 'Nivel 1: Bienvenida al Cliente',
      date: '30/5/2025',
      duration: '0 min',
      score: 0
    },
    {
      title: 'Bienvenida al Cliente - Escenario 1',
      level: 'Nivel 1: Bienvenida al Cliente',
      date: '5/21/2025',
      duration: '4 min',
      score: 55
    },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Historial de entrenamiento</h1>
          <p className="text-gray-600 mt-2">Revisa tus sesiones de entrenamiento anteriores y tu progreso</p>
        </div>

        {/* Global Stats */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Estadísticas Globales</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {globalStats.map((stat, index) => (
              <StatCard
                key={index}
                title={stat.title}
                value={stat.value}
                icon={stat.icon}
                color={stat.color}
              />
            ))}
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex space-x-4">
              <button className="py-2 px-1 border-b-2 border-purple-600 text-purple-600 font-medium">
                Sesiones
              </button>
              <button className="py-2 px-1 text-gray-500 hover:text-gray-700">
                Estadísticas detalladas
              </button>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar en conversaciones..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <select 
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option>Todos los niveles</option>
                <option>Nivel 1</option>
                <option>Nivel 2</option>
              </select>
              <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
                Buscar
              </button>
            </div>
          </div>
        </div>

        {/* Sessions List */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Sesiones recientes</h3>
          
          <div className="space-y-4">
            {sessions.map((session, index) => (
              <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{session.title}</h4>
                  <p className="text-sm text-gray-600">{session.level}</p>
                  <div className="flex items-center space-x-4 mt-2">
                    <span className="text-xs text-gray-500 flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {session.date}
                    </span>
                    <span className="text-xs text-gray-500">{session.duration}</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <span className={`text-lg font-bold ${session.score === 0 ? 'text-gray-400' : 'text-purple-600'}`}>
                      {session.score}%
                    </span>
                  </div>
                  <button className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors flex items-center">
                    <Eye className="h-4 w-4 mr-2" />
                    Ver detalles
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default History;
