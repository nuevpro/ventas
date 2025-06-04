
import React, { useState } from 'react';
import { Play, Clock, Star, Users, ChevronRight } from 'lucide-react';

const Training = () => {
  const [selectedScenario, setSelectedScenario] = useState(null);

  const trainingLevels = [
    {
      id: 1,
      title: 'Nivel 1: Bienvenida al Cliente',
      description: 'Aprende a saludar y dar la bienvenida a clientes de manera efectiva y profesional.',
      xp: 100,
      duration: '10-15 minutos',
      category: 'General',
      completed: 24,
      scenarios: [
        {
          id: 1,
          title: 'Bienvenida al Cliente - Escenario 1',
          description: 'Primer escenario del nivel Bienvenida al Cliente. Dificultad introductoria.',
          difficulty: 'neutral',
          status: 'available'
        },
        {
          id: 2,
          title: 'Bienvenida al Cliente - Escenario 2',
          description: 'Segundo escenario del nivel Bienvenida al Cliente. Dificultad estándar.',
          difficulty: 'amigable',
          status: 'locked'
        },
        {
          id: 3,
          title: 'Bienvenida al Cliente - Escenario 3',
          description: 'Tercer escenario del nivel Bienvenida al Cliente. Dificultad avanzada.',
          difficulty: 'pedestre',
          status: 'locked'
        }
      ]
    }
  ];

  const objectives = [
    'Comprender las necesidades del cliente',
    'Presentar soluciones de manera efectiva',
    'Manejar objeciones comunes',
    'Cerrar la venta de manera natural'
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Entrenamiento</h1>
          <p className="text-gray-600 mt-2">Practica tus habilidades de ventas usando tu voz con un cliente virtual basado en IA. Una experiencia más inmersiva y realista.</p>
        </div>

        {/* Training Overview */}
        <div className="bg-purple-50 rounded-xl p-6 mb-8 border border-purple-200">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">¡Nuevo! Conversación por Voz</h2>
              <p className="text-gray-700 mb-4">Practica tus habilidades de ventas usando tu voz con un cliente virtual basado en IA. Una experiencia más inmersiva y realista.</p>
            </div>
            <button className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">
              Ver escenarios disponibles
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Level Details */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Detalles del nivel</h3>
              <p className="text-gray-600 mb-4">Información sobre este nivel de entrenamiento</p>
              
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Descripción</h4>
                <p className="text-gray-700">{trainingLevels[0].description}</p>
              </div>

              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Objetivos de aprendizaje</h4>
                <ul className="space-y-2">
                  {objectives.map((objective, index) => (
                    <li key={index} className="flex items-start">
                      <div className="w-2 h-2 bg-purple-600 rounded-full mt-2 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">{objective}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <div className="flex items-center text-sm text-gray-600 mb-1">
                    <Star className="h-4 w-4 mr-1" />
                    XP al completar
                  </div>
                  <p className="text-lg font-semibold text-gray-900">{trainingLevels[0].xp} XP</p>
                </div>
                <div>
                  <div className="flex items-center text-sm text-gray-600 mb-1">
                    <Clock className="h-4 w-4 mr-1" />
                    Duración aproximada
                  </div>
                  <p className="text-lg font-semibold text-gray-900">{trainingLevels[0].duration}</p>
                </div>
                <div>
                  <div className="flex items-center text-sm text-gray-600 mb-1">
                    <Users className="h-4 w-4 mr-1" />
                    Completado por
                  </div>
                  <p className="text-lg font-semibold text-gray-900">{trainingLevels[0].completed} usuarios</p>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Categoría</div>
                  <p className="text-lg font-semibold text-gray-900">{trainingLevels[0].category}</p>
                </div>
              </div>
            </div>

            {/* Available Scenarios */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Escenarios disponibles</h3>
              <p className="text-gray-600 mb-6">Selecciona un escenario para iniciar tu entrenamiento</p>
              
              <div className="space-y-4">
                {trainingLevels[0].scenarios.map((scenario) => (
                  <div 
                    key={scenario.id} 
                    className={`p-4 rounded-lg border-2 transition-colors ${
                      scenario.status === 'available' 
                        ? 'border-gray-200 hover:border-purple-300 cursor-pointer' 
                        : 'border-gray-100 bg-gray-50 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="font-medium text-gray-900">{scenario.title}</h4>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            scenario.difficulty === 'neutral' ? 'bg-gray-100 text-gray-700' :
                            scenario.difficulty === 'amigable' ? 'bg-green-100 text-green-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {scenario.difficulty}
                          </span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            scenario.status === 'available' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'
                          }`}>
                            Variable
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{scenario.description}</p>
                      </div>
                      {scenario.status === 'available' ? (
                        <button className="flex items-center bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors ml-4">
                          <Play className="h-4 w-4 mr-2" />
                          Iniciar escenario
                        </button>
                      ) : (
                        <div className="ml-4 text-gray-400">
                          <span className="text-sm">Bloqueado</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Progress */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Tu progreso</h3>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Progreso del nivel</span>
                    <span className="text-sm text-gray-500">10%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full" style={{ width: '10%' }} />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">0/3 escenarios completados</p>
                </div>

                <div className="space-y-3 pt-4 border-t border-gray-200">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Intentos</span>
                    <span className="text-sm font-medium text-gray-900">6</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Mejor puntuación</span>
                    <span className="text-sm font-medium text-gray-900">63%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">XP ganado</span>
                    <span className="text-sm font-medium text-gray-900">0</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Session History Preview */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Historial de sesiones</h3>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Escenario 1</p>
                    <p className="text-xs text-gray-500">6/3/2025</p>
                  </div>
                  <span className="text-sm font-bold text-purple-600">63%</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Escenario 1</p>
                    <p className="text-xs text-gray-500">5/30/2025</p>
                  </div>
                  <span className="text-sm font-bold text-gray-400">0%</span>
                </div>
              </div>
              
              <button className="w-full mt-4 text-sm text-purple-600 font-medium hover:text-purple-700 transition-colors">
                Ver historial completo
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Training;
