
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertTriangle, Lightbulb, RotateCcw } from 'lucide-react';

interface EvaluationData {
  score: number;
  accuracy: number;
  communication: number;
  areas_improvement: string[];
  positive_aspects: string[];
  suggestions: string[];
  critical_errors: string[];
}

interface EvaluationResultsProps {
  evaluation: EvaluationData;
  onRetry: () => void;
  onNextLevel: () => void;
}

const EvaluationResults = ({ evaluation, onRetry, onNextLevel }: EvaluationResultsProps) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excelente';
    if (score >= 60) return 'Bueno';
    return 'Necesita Mejora';
  };

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <Card>
        <CardHeader>
          <CardTitle className="text-center">Resultado de la Evaluación</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center mb-6">
            <div className={`text-6xl font-bold ${getScoreColor(evaluation.score)}`}>
              {evaluation.score}
            </div>
            <div className="text-lg text-gray-600 dark:text-gray-300">
              {getScoreLabel(evaluation.score)}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-semibold text-purple-600">{evaluation.score}%</div>
              <div className="text-sm text-gray-500">Puntuación General</div>
              <Progress value={evaluation.score} className="mt-2" />
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-semibold text-blue-600">{evaluation.accuracy}%</div>
              <div className="text-sm text-gray-500">Precisión</div>
              <Progress value={evaluation.accuracy} className="mt-2" />
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-semibold text-green-600">{evaluation.communication}%</div>
              <div className="text-sm text-gray-500">Comunicación</div>
              <Progress value={evaluation.communication} className="mt-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Critical Errors */}
      {evaluation.critical_errors.length > 0 && (
        <Card className="border-red-200 dark:border-red-800">
          <CardHeader>
            <CardTitle className="flex items-center text-red-600">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Errores Críticos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {evaluation.critical_errors.map((error, index) => (
                <li key={index} className="flex items-start">
                  <AlertTriangle className="h-4 w-4 text-red-500 mt-1 mr-2 flex-shrink-0" />
                  <span className="text-red-700 dark:text-red-300">{error}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Positive Aspects */}
        <Card className="border-green-200 dark:border-green-800">
          <CardHeader>
            <CardTitle className="flex items-center text-green-600">
              <CheckCircle className="h-5 w-5 mr-2" />
              Aspectos Positivos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {evaluation.positive_aspects.map((aspect, index) => (
                <li key={index} className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-1 mr-2 flex-shrink-0" />
                  <span>{aspect}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Areas for Improvement */}
        <Card className="border-yellow-200 dark:border-yellow-800">
          <CardHeader>
            <CardTitle className="flex items-center text-yellow-600">
              <Lightbulb className="h-5 w-5 mr-2" />
              Áreas de Mejora
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {evaluation.areas_improvement.map((area, index) => (
                <li key={index} className="flex items-start">
                  <Lightbulb className="h-4 w-4 text-yellow-500 mt-1 mr-2 flex-shrink-0" />
                  <span>{area}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Suggestions */}
      <Card>
        <CardHeader>
          <CardTitle>Sugerencias para Mejorar</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {evaluation.suggestions.map((suggestion, index) => (
              <li key={index} className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <span className="font-medium text-blue-700 dark:text-blue-300">
                  Sugerencia {index + 1}:
                </span>
                <span className="ml-2">{suggestion}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-center space-x-4">
        <Button variant="outline" onClick={onRetry}>
          <RotateCcw className="h-4 w-4 mr-2" />
          Intentar Nuevamente
        </Button>
        
        {evaluation.score >= 70 && (
          <Button onClick={onNextLevel}>
            Siguiente Nivel
          </Button>
        )}
      </div>
    </div>
  );
};

export default EvaluationResults;
