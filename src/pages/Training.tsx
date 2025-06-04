
import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ScenarioSelector from '@/components/ScenarioSelector';
import ScenarioPreview from '@/components/training/ScenarioPreview';
import LiveTrainingInterface from '@/components/training/LiveTrainingInterface';
import DetailedEvaluation from '@/components/training/DetailedEvaluation';
import ProgressDashboard from '@/components/training/ProgressDashboard';
import AdaptiveLearning from '@/components/training/AdaptiveLearning';

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
  const [currentView, setCurrentView] = useState<'dashboard' | 'adaptive' | 'selector' | 'preview' | 'training' | 'results'>('dashboard');
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [trainingConfig, setTrainingConfig] = useState(null);
  const [evaluationData, setEvaluationData] = useState(null);

  const handleSelectScenario = (scenario: Scenario) => {
    setSelectedScenario(scenario);
    setCurrentView('preview');
  };

  const handleStartTraining = (config: any) => {
    setTrainingConfig(config);
    setCurrentView('training');
  };

  const handleTrainingComplete = (evaluation: any) => {
    setEvaluationData(evaluation);
    setCurrentView('results');
  };

  const handleRetry = () => {
    setCurrentView('preview');
    setEvaluationData(null);
  };

  const handleNextLevel = () => {
    setCurrentView('selector');
    setSelectedScenario(null);
    setEvaluationData(null);
  };

  const handleViewHistory = () => {
    // Navegar al historial
    window.location.href = '/history';
  };

  const handleBackToSelector = () => {
    if (currentView === 'preview') {
      setCurrentView('selector');
      setSelectedScenario(null);
    } else {
      setCurrentView('dashboard');
      setSelectedScenario(null);
      setTrainingConfig(null);
      setEvaluationData(null);
    }
  };

  const renderNavigation = () => {
    if (currentView === 'dashboard') return null;

    return (
      <div className="mb-6">
        <Button variant="outline" onClick={handleBackToSelector}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          {currentView === 'preview' ? 'Volver a escenarios' : 'Volver al dashboard'}
        </Button>
      </div>
    );
  };

  const renderHeader = () => {
    const titles = {
      dashboard: 'Dashboard de Entrenamiento',
      adaptive: 'Aprendizaje Adaptativo',
      selector: 'Seleccionar Escenario',
      preview: selectedScenario?.title || 'Vista Previa',
      training: 'Entrenamiento en Vivo',
      results: 'Resultados de Evaluación'
    };

    const descriptions = {
      dashboard: 'Revisa tu progreso y estadísticas de entrenamiento',
      adaptive: 'Rutas personalizadas basadas en tu desempeño',
      selector: 'Elige un escenario para comenzar tu entrenamiento',
      preview: 'Configura tu sesión de entrenamiento antes de comenzar',
      training: 'Practica tus habilidades en tiempo real',
      results: 'Analiza tu desempeño y áreas de mejora'
    };

    return (
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {titles[currentView]}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {descriptions[currentView]}
        </p>
      </div>
    );
  };

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {renderNavigation()}
        {renderHeader()}

        {/* Dashboard principal */}
        {currentView === 'dashboard' && (
          <div className="space-y-6">
            <ProgressDashboard />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                size="lg"
                className="h-32 flex flex-col items-center justify-center space-y-2"
                onClick={() => setCurrentView('selector')}
              >
                <div className="text-2xl">🎯</div>
                <div className="text-center">
                  <div className="font-semibold">Nuevo Entrenamiento</div>
                  <div className="text-xs opacity-75">Practica un escenario</div>
                </div>
              </Button>
              
              <Button
                variant="outline"
                size="lg"
                className="h-32 flex flex-col items-center justify-center space-y-2"
                onClick={() => setCurrentView('adaptive')}
              >
                <div className="text-2xl">🧠</div>
                <div className="text-center">
                  <div className="font-semibold">IA Personalizada</div>
                  <div className="text-xs opacity-75">Rutas adaptativas</div>
                </div>
              </Button>
              
              <Button
                variant="outline"
                size="lg"
                className="h-32 flex flex-col items-center justify-center space-y-2"
                onClick={handleViewHistory}
              >
                <div className="text-2xl">📊</div>
                <div className="text-center">
                  <div className="font-semibold">Ver Historial</div>
                  <div className="text-xs opacity-75">Sesiones pasadas</div>
                </div>
              </Button>
            </div>
          </div>
        )}

        {/* Aprendizaje adaptativo */}
        {currentView === 'adaptive' && <AdaptiveLearning />}

        {/* Selector de escenarios */}
        {currentView === 'selector' && (
          <ScenarioSelector onSelectScenario={handleSelectScenario} />
        )}

        {/* Vista previa del escenario */}
        {currentView === 'preview' && selectedScenario && (
          <ScenarioPreview
            scenario={selectedScenario}
            onStart={handleStartTraining}
            onBack={handleBackToSelector}
          />
        )}

        {/* Interfaz de entrenamiento en vivo */}
        {currentView === 'training' && trainingConfig && (
          <LiveTrainingInterface
            config={trainingConfig}
            onComplete={handleTrainingComplete}
            onBack={handleBackToSelector}
          />
        )}

        {/* Resultados detallados */}
        {currentView === 'results' && evaluationData && (
          <DetailedEvaluation
            evaluation={evaluationData}
            onRetry={handleRetry}
            onNextLevel={handleNextLevel}
            onViewHistory={handleViewHistory}
          />
        )}
      </div>
    </div>
  );
};

export default Training;
