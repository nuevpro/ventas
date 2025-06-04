
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertTriangle, Lightbulb, Target, Heart, Brain, Mic, Star } from 'lucide-react';

interface DetailedEvaluationProps {
  evaluation: any;
  onRetry: () => void;
  onNextLevel: () => void;
  onViewHistory: () => void;
}

const DetailedEvaluation = ({ evaluation, onRetry, onNextLevel, onViewHistory }: DetailedEvaluationProps) => {
  const metrics = [
    { 
      key: 'rapport', 
      label: 'Rapport', 
      icon: Heart, 
      value: evaluation.rapport || 75,
      description: 'Conexión y confianza establecida'
    },
    { 
      key: 'clarity', 
      label: 'Claridad', 
      icon: Mic, 
      value: evaluation.clarity || 80,
      description: 'Comunicación clara y comprensible'
    },
    { 
      key: 'empathy', 
      label: 'Empatía', 
      icon: Heart, 
      value: evaluation.empathy || 70,
      description: 'Comprensión de las necesidades del cliente'
    },
    { 
      key: 'accuracy', 
      label: 'Precisión Factual', 
      icon: Brain, 
      value: evaluation.accuracy || 85,
      description: 'Información correcta y relevante'
    }
  ];

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 85) return 'Excelente';
    if (score >= 70) return 'Bueno';
    return 'Necesita Mejora';
  };

  const overallScore = evaluation.score || 75;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Puntuación general */}
      <Card>
        <CardHeader>
          <CardTitle className="text-center flex items-center justify-center space-x-2">
            <Star className="h-6 w-6 text-yellow-500" />
            <span>Evaluación Detallada</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center mb-8">
            <div className={`text-6xl font-bold ${getScoreColor(overallScore)}`}>
              {overallScore}
            </div>
            <div className="text-lg text-gray-600 dark:text-gray-300">
              {getScoreLabel(overallScore)}
            </div>
            <Progress value={overallScore} className="mt-4 max-w-md mx-auto" />
          </div>

          {/* Métricas detalladas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {metrics.map((metric) => (
              <Card key={metric.key} className="text-center">
                <CardContent className="p-4">
                  <div className="flex items-center justify-center mb-2">
                    <metric.icon className="h-8 w-8 text-purple-600" />
                  </div>
                  <div className={`text-2xl font-bold ${getScoreColor(metric.value)}`}>
                    {metric.value}%
                  </div>
                  <div className="text-sm font-medium mb-1">{metric.label}</div>
                  <div className="text-xs text-gray-500">{metric.description}</div>
                  <Progress value={metric.value} className="mt-2" />
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Aspectos positivos */}
        <Card className="border-green-200 dark:border-green-800">
          <CardHeader>
            <CardTitle className="flex items-center text-green-600">
              <CheckCircle className="h-5 w-5 mr-2" />
              Lo que hiciste bien
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {(evaluation.positive_aspects || [
                'Mantuvo un tono profesional durante toda la conversación',
                'Demostró conocimiento sólido del producto',
                'Escuchó activamente las necesidades del cliente',
                'Hizo preguntas relevantes para entender mejor'
              ]).map((aspect, index) => (
                <li key={index} className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-1 mr-2 flex-shrink-0" />
                  <span className="text-sm">{aspect}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Áreas de mejora */}
        <Card className="border-yellow-200 dark:border-yellow-800">
          <CardHeader>
            <CardTitle className="flex items-center text-yellow-600">
              <Lightbulb className="h-5 w-5 mr-2" />
              Oportunidades de mejora
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {(evaluation.areas_improvement || [
                'Trabajar en técnicas de cierre más efectivas',
                'Mejorar el manejo de objeciones complejas',
                'Aumentar la confianza al presentar beneficios',
                'Practicar preguntas abiertas para descubrir necesidades'
              ]).map((area, index) => (
                <li key={index} className="flex items-start">
                  <Lightbulb className="h-4 w-4 text-yellow-500 mt-1 mr-2 flex-shrink-0" />
                  <span className="text-sm">{area}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Errores críticos */}
      {evaluation.critical_errors && evaluation.critical_errors.length > 0 && (
        <Card className="border-red-200 dark:border-red-800">
          <CardHeader>
            <CardTitle className="flex items-center text-red-600">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Errores que debes evitar
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

      {/* Recomendaciones específicas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="h-5 w-5 mr-2" />
            Recomendaciones para tu próximo entrenamiento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(evaluation.suggestions || [
              'Practica técnicas de escucha activa con ejercicios específicos',
              'Estudia casos de éxito en situaciones similares',
              'Rehearsa respuestas a objeciones comunes',
              'Mejora tu lenguaje corporal y tono de voz'
            ]).map((suggestion, index) => (
              <div key={index} className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="font-medium text-blue-700 dark:text-blue-300 mb-1">
                  Consejo #{index + 1}
                </div>
                <div className="text-sm text-blue-600 dark:text-blue-400">
                  {suggestion}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Acciones */}
      <div className="flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-4">
        <Button variant="outline" onClick={onViewHistory}>
          Ver Historial Completo
        </Button>
        
        <Button variant="outline" onClick={onRetry}>
          Repetir Entrenamiento
        </Button>
        
        {overallScore >= 75 && (
          <Button onClick={onNextLevel} className="bg-green-600 hover:bg-green-700">
            Siguiente Nivel
          </Button>
        )}
        
        {overallScore < 75 && (
          <Button onClick={onRetry} className="bg-blue-600 hover:bg-blue-700">
            Mejorar Puntuación
          </Button>
        )}
      </div>
    </div>
  );
};

export default DetailedEvaluation;
