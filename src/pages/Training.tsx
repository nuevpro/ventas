
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Play, History, Settings, Mic, MessageSquare } from 'lucide-react';
import ScenarioSelector from '@/components/ScenarioSelector';
import LiveTrainingInterface from '@/components/training/LiveTrainingInterface';
import EvaluationResults from '@/components/EvaluationResults';
import VoiceLibrary from '@/components/audio/VoiceLibrary';
import SessionHistory from '@/components/training/SessionHistory';
import BehaviorManager from '@/components/behaviors/BehaviorManager';

const Training = () => {
  const [currentView, setCurrentView] = useState('setup');
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [selectedVoice, setSelectedVoice] = useState('EXAVITQu4vr4xnSDxMaL'); // Sarah por defecto
  const [selectedVoiceName, setSelectedVoiceName] = useState('Sarah');
  const [interactionMode, setInteractionMode] = useState('call');
  const [trainingConfig, setTrainingConfig] = useState(null);
  const [evaluationResults, setEvaluationResults] = useState(null);

  const handleScenarioSelect = (scenario: any) => {
    setSelectedScenario(scenario);
  };

  const handleVoiceSelect = (voiceId: string, voiceName: string) => {
    setSelectedVoice(voiceId);
    setSelectedVoiceName(voiceName);
  };

  const startTraining = () => {
    if (!selectedScenario) return;

    const config = {
      scenario: selectedScenario.id,
      scenarioTitle: selectedScenario.title,
      clientEmotion: selectedScenario.clientEmotion || 'neutral',
      interactionMode,
      selectedVoice,
      selectedVoiceName,
      behaviors: selectedScenario.behaviors || {}
    };

    setTrainingConfig(config);
    setCurrentView('training');
  };

  const handleTrainingComplete = (evaluation: any) => {
    setEvaluationResults(evaluation);
    setCurrentView('results');
  };

  const resetTraining = () => {
    setCurrentView('setup');
    setTrainingConfig(null);
    setEvaluationResults(null);
  };

  if (currentView === 'training' && trainingConfig) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
        <LiveTrainingInterface
          config={trainingConfig}
          onComplete={handleTrainingComplete}
          onBack={resetTraining}
        />
      </div>
    );
  }

  if (currentView === 'results' && evaluationResults) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
        <EvaluationResults
          results={evaluationResults}
          onStartNew={resetTraining}
          onBack={resetTraining}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Centro de Entrenamiento
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Configura y realiza sesiones de entrenamiento con IA
          </p>
        </div>

        <Tabs defaultValue="setup" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="setup">Configuración</TabsTrigger>
            <TabsTrigger value="voices">Voces</TabsTrigger>
            <TabsTrigger value="behaviors">Comportamientos</TabsTrigger>
            <TabsTrigger value="history">Historial</TabsTrigger>
          </TabsList>

          <TabsContent value="setup" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Selector de Escenario */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Seleccionar Escenario</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScenarioSelector
                      selectedScenario={selectedScenario}
                      onScenarioSelect={handleScenarioSelect}
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Configuración de Entrenamiento */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Modo de Interacción</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant={interactionMode === 'call' ? 'default' : 'outline'}
                        onClick={() => setInteractionMode('call')}
                        className="flex flex-col items-center p-4 h-auto"
                      >
                        <Mic className="h-6 w-6 mb-2" />
                        <span>Llamada</span>
                      </Button>
                      <Button
                        variant={interactionMode === 'chat' ? 'default' : 'outline'}
                        onClick={() => setInteractionMode('chat')}
                        className="flex flex-col items-center p-4 h-auto"
                      >
                        <MessageSquare className="h-6 w-6 mb-2" />
                        <span>Chat</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Voz Seleccionada</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <div className="text-lg font-medium mb-2">{selectedVoiceName}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Voz para el cliente virtual
                      </div>
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4 mr-2" />
                        Cambiar en la pestaña Voces
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Button
                  onClick={startTraining}
                  disabled={!selectedScenario}
                  className="w-full"
                  size="lg"
                >
                  <Play className="h-5 w-5 mr-2" />
                  Iniciar Entrenamiento
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="voices">
            <Card>
              <CardContent className="p-6">
                <VoiceLibrary
                  selectedVoice={selectedVoice}
                  onVoiceSelect={handleVoiceSelect}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="behaviors">
            <Card>
              <CardContent className="p-6">
                <BehaviorManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardContent className="p-6">
                <SessionHistory />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Training;
