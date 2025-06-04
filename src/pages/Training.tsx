
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ScenarioConfiguration from '@/components/training/ScenarioConfiguration';
import VoiceTrainingInterface from '@/components/training/VoiceTrainingInterface';
import { useSessionManager } from '@/components/training/SessionManager';
import { useToast } from '@/hooks/use-toast';

interface TrainingConfig {
  scenarioTitle: string;
  scenarioDescription: string;
  clientEmotion: string;
  interactionMode: 'call' | 'chat';
  selectedVoice?: string;
  difficulty: string;
  duration: number;
  objectives: string[];
}

const Training = () => {
  const [currentStep, setCurrentStep] = useState<'config' | 'training' | 'results'>('config');
  const [trainingConfig, setTrainingConfig] = useState<TrainingConfig | null>(null);
  const sessionManager = useSessionManager();
  const { toast } = useToast();

  const handleStartTraining = async (config: TrainingConfig) => {
    try {
      setTrainingConfig(config);
      
      // Iniciar sesión en el SessionManager
      const sessionId = await sessionManager.startSession({
        scenario: config.scenarioTitle,
        scenarioTitle: config.scenarioTitle,
        clientEmotion: config.clientEmotion,
        interactionMode: config.interactionMode,
        selectedVoice: config.selectedVoice
      });

      if (sessionId) {
        setCurrentStep('training');
        toast({
          title: "Sesión iniciada",
          description: "¡Comienza tu entrenamiento!",
        });
      }
    } catch (error) {
      console.error('Error starting training session:', error);
      toast({
        title: "Error",
        description: "No se pudo iniciar la sesión de entrenamiento",
        variant: "destructive",
      });
    }
  };

  const handleEndSession = async (sessionData: any) => {
    try {
      // Finalizar sesión en el SessionManager
      await sessionManager.endSession({
        duration: sessionData.duration,
        messages: sessionData.messages,
        scenario: sessionData.scenario
      });

      setCurrentStep('results');
      toast({
        title: "Sesión completada",
        description: "Tu entrenamiento ha sido guardado",
      });
    } catch (error) {
      console.error('Error ending session:', error);
      toast({
        title: "Error",
        description: "Hubo un problema al guardar la sesión",
        variant: "destructive",
      });
    }
  };

  const handleNewSession = () => {
    setCurrentStep('config');
    setTrainingConfig(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Entrenamiento IA
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Practica conversaciones realistas con clientes simulados por IA
          </p>
        </div>

        {/* Contenido principal */}
        {currentStep === 'config' && (
          <ScenarioConfiguration onStartTraining={handleStartTraining} />
        )}

        {currentStep === 'training' && trainingConfig && (
          <VoiceTrainingInterface
            config={trainingConfig}
            onEndSession={handleEndSession}
          />
        )}

        {currentStep === 'results' && (
          <Card>
            <CardHeader>
              <CardTitle>Sesión Completada</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p>Tu sesión de entrenamiento ha sido completada y guardada.</p>
              <button
                onClick={handleNewSession}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Nueva Sesión
              </button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Training;
