
import React from 'react';
import { Trophy, Users, Plus } from 'lucide-react';

const Challenges = () => {
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Desafíos</h1>
          <p className="text-gray-600 mt-2">Participa en desafíos para competir con otros equipos y ganar recompensas</p>
        </div>

        {/* Challenge Tabs */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
          <div className="flex space-x-8 border-b border-gray-200">
            <button className="py-2 px-1 border-b-2 border-purple-600 text-purple-600 font-medium">
              Desafíos de equipo
            </button>
            <button className="py-2 px-1 text-gray-500 hover:text-gray-700">
              Desafíos individuales
            </button>
            <button className="py-2 px-1 text-gray-500 hover:text-gray-700">
              Completados
            </button>
          </div>
        </div>

        {/* Empty State */}
        <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-200 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trophy className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No perteneces a ningún equipo</h3>
          <p className="text-gray-600 mb-6">Únete a un equipo o crea uno nuevo para participar en desafíos de equipo</p>
          
          <div className="flex justify-center space-x-4">
            <button className="bg-gray-900 text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors">
              Unirse a un equipo
            </button>
            <button className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors">
              Crear equipo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Challenges;
