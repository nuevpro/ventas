
import React, { useState } from 'react';
import { Trophy, Star, Target, BookOpen, Award, Lock } from 'lucide-react';
import ProgressBar from '@/components/ProgressBar';

const Achievements = () => {
  const [selectedTab, setSelectedTab] = useState('Todos');

  const achievements = [
    {
      id: 1,
      title: 'Superventas',
      description: 'Completa todos los niveles con al menos 85% de puntuación',
      category: 'Experto',
      progress: 0,
      target: 100,
      status: 'Bloqueado',
      xp: 500,
      icon: Trophy,
      unlocked: false
    },
    {
      id: 2,
      title: 'Maestro de Preguntas',
      description: 'Alcanza una puntuación del 90% en identificación de necesidades',
      category: 'Habilidades',
      progress: 0,
      target: 200,
      status: 'Bloqueado',
      xp: 200,
      icon: Target,
      unlocked: false
    },
    {
      id: 3,
      title: 'Primer Contacto',
      description: 'Completa tu primera sesión de entrenamiento',
      category: 'Principiante',
      progress: 0,
      target: 1,
      status: 'Bloqueado',
      xp: 50,
      icon: Star,
      unlocked: false
    },
    {
      id: 4,
      title: 'Aprendiz',
      description: 'Completa 5 sesiones de entrenamiento',
      category: 'Principiante',
      progress: 0,
      target: 5,
      status: 'Bloqueado',
      xp: 100,
      icon: BookOpen,
      unlocked: false
    }
  ];

  const categories = ['Todos', 'Desbloqueados', 'Bloqueados'];
  const skillCategories = ['Experto', 'Habilidades', 'Principiante'];

  const filteredAchievements = achievements.filter(achievement => {
    if (selectedTab === 'Todos') return true;
    if (selectedTab === 'Desbloqueados') return achievement.unlocked;
    if (selectedTab === 'Bloqueados') return !achievement.unlocked;
    return true;
  });

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Logros</h1>
          <p className="text-gray-600 mt-2">Rastrea tu progreso y desbloquea logros para demostrar tus habilidades</p>
        </div>

        {/* Progress Overview */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Progreso general</h2>
          <p className="text-gray-600 mb-4">Has desbloqueado 0 de 4 logros</p>
          <ProgressBar progress={0} showPercentage />
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
          <div className="flex space-x-8 border-b border-gray-200">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedTab(category)}
                className={`py-2 px-1 border-b-2 font-medium transition-colors ${
                  selectedTab === category
                    ? 'border-purple-600 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Achievements by Category */}
        {skillCategories.map((category) => {
          const categoryAchievements = filteredAchievements.filter(
            achievement => achievement.category === category
          );

          if (categoryAchievements.length === 0) return null;

          return (
            <div key={category} className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">{category}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {categoryAchievements.map((achievement) => {
                  const IconComponent = achievement.icon;
                  return (
                    <div
                      key={achievement.id}
                      className={`bg-white rounded-xl p-6 shadow-sm border border-gray-200 ${
                        !achievement.unlocked ? 'opacity-60' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className={`p-3 rounded-lg ${
                            achievement.unlocked 
                              ? 'bg-purple-100 text-purple-600' 
                              : 'bg-gray-100 text-gray-400'
                          }`}>
                            {achievement.unlocked ? (
                              <IconComponent className="h-6 w-6" />
                            ) : (
                              <Lock className="h-6 w-6" />
                            )}
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{achievement.title}</h4>
                            <p className="text-sm text-gray-600">{achievement.description}</p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          achievement.unlocked
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-500'
                        }`}>
                          {achievement.status}
                        </span>
                      </div>

                      {!achievement.unlocked && (
                        <div className="mb-4">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-gray-600">Progreso</span>
                            <span className="text-sm text-gray-500">
                              {achievement.progress}/{achievement.target}
                            </span>
                          </div>
                          <ProgressBar 
                            progress={(achievement.progress / achievement.target) * 100} 
                          />
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Award className="h-4 w-4 text-purple-600" />
                          <span className="text-sm font-medium text-purple-600">
                            {achievement.xp} XP
                          </span>
                        </div>
                        {achievement.unlocked && (
                          <span className="text-sm text-green-600 font-medium">Completado</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {filteredAchievements.length === 0 && (
          <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-200 text-center">
            <Trophy className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No hay logros en esta categoría
            </h3>
            <p className="text-gray-600">
              Completa entrenamientos para desbloquear nuevos logros
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Achievements;
