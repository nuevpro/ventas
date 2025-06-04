
import React, { useState } from 'react';
import { FileText, Settings } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import KnowledgeManager from '@/components/KnowledgeManager';
import ElevenLabsConfig from '@/components/ElevenLabsConfig';

const Knowledge = () => {
  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Gestión del Conocimiento
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Administra documentos, configuraciones y bases de conocimiento para el entrenamiento con IA
          </p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="knowledge" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="knowledge" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>Base de Conocimiento</span>
            </TabsTrigger>
            <TabsTrigger value="config" className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span>Configuración ElevenLabs</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="knowledge">
            <KnowledgeManager />
          </TabsContent>

          <TabsContent value="config">
            <ElevenLabsConfig />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Knowledge;
