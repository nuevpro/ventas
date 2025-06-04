
import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ScenarioSelector from '@/components/ScenarioSelector';
import ConversationTraining from '@/components/ConversationTraining';
import EvaluationResults from '@/components/EvaluationResults';

interface Scenario {
  id: string;
  title: string;
  description: string;
  category: 'sales' | 'education' | 'recruitment' | 'onboarding';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: string;
  objectives: string[];
}

const Training = () => {
  const [currentView, setCurrentView] = useState<'selector' | 'training' | 'results'>('selector');
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [evaluationData, setEvaluationData] = useState(null);

  const handleSelectScenario = (scenario: Scenario) => {
    setSelectedScenario(scenario);
    setCurrentView('training');
  };

  const handleTrainingComplete = (evaluation: any) => {
    setEvaluationData(evaluation);
    setCurrentView('results');
  };

  const handleRetry = () => {
    setCurrentView('training');
    setEvaluationData(null);
  };

  const handleNextLevel = () => {
    setCurrentView('selector');
    setSelectedScenario(null);
    setEvaluationData(null);
  };

  const handleBackToSelector = () => {
    setCurrentView('selector');
    setSelectedScenario(null);
    setEvaluationData(null);
  };

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            {currentView !== 'selector' && (
              <Button variant="outline" onClick={handleBackToSelector}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>
            )}
            
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {currentView === 'selector' && 'Entrenamiento con IA'}
                {currentView === 'training' && selectedScenario?.title}
                {currentView === 'results' && 'Resultados de Evaluación'}
              </h1>
              
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                {currentView === 'selector' && 'Selecciona un escenario para comenzar tu entrenamiento personalizado'}
                {currentView === 'training' && 'Practica tus habilidades en tiempo real con feedback de IA'}
                {currentView === 'results' && 'Revisa tu desempeño y áreas de mejora'}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        {currentView === 'selector' && (
          <ScenarioSelector onSelectScenario={handleSelectScenario} />
        )}

        {currentView === 'training' && selectedScenario && (
          <ConversationTraining
            scenario={selectedScenario.id}
            difficulty={selectedScenario.difficulty}
            onComplete={handleTrainingComplete}
          />
        )}

        {currentView === 'results' && evaluationData && (
          <EvaluationResults
            evaluation={evaluationData}
            onRetry={handleRetry}
            onNextLevel={handleNextLevel}
          />
        )}
      </div>
    </div>
  );
};

export default Training;
