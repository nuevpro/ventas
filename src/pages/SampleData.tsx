
import React from 'react';
import SampleDataGenerator from '@/components/SampleDataGenerator';

const SampleData = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Generador de Datos de Ejemplo
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Crea contenido de ejemplo para poblar la aplicación con datos realistas de entrenamiento
          </p>
        </div>

        <SampleDataGenerator />
      </div>
    </div>
  );
};

export default SampleData;
