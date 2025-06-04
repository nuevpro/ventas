
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, Equal, Target, Heart, Brain, Mic, AlertCircle } from 'lucide-react';

interface RealTimeMetrics {
  rapport: number;
  clarity: number;
  empathy: number;
  accuracy: number;
  responseTime: number;
  overallScore: number;
  trend: 'up' | 'down' | 'stable';
  criticalIssues: string[];
  positivePoints: string[];
  suggestions: string[];
}

interface RealTimeEvaluationProps {
  metrics: RealTimeMetrics;
  isActive: boolean;
  sessionDuration: number;
  onRequestFeedback: () => void;
}

const RealTimeEvaluation = ({ 
  metrics, 
  isActive, 
  sessionDuration, 
  onRequestFeedback 
}: RealTimeEvaluationProps) => {
  const [showDetails, setShowDetails] = useState(false);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBackground = (score: number) => {
    if (score >= 80) return 'bg-green-50 border-green-200';
    if (score >= 60) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Equal className="h-4 w-4 text-gray-500" />;
    }
  };

  const metricsData = [
    { 
      key: 'rapport', 
      label: 'Rapport', 
      icon: Heart, 
      value: metrics.rapport,
      description: 'Conexión con el cliente'
    },
    { 
      key: 'clarity', 
      label: 'Claridad', 
      icon: Mic, 
      value: metrics.clarity,
      description: 'Comunicación clara'
    },
    { 
      key: 'empathy', 
      label: 'Empatía', 
      icon: Heart, 
      value: metrics.empathy,
      description: 'Comprensión del cliente'
    },
    { 
      key: 'accuracy', 
      label: 'Precisión', 
      icon: Brain, 
      value: metrics.accuracy,
      description: 'Información correcta'
    }
  ];

  return (
    <div className="space-y-4">
      {/* Puntuación general y tiempo */}
      <Card className={`${getScoreBackground(metrics.overallScore)}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <div className={`text-3xl font-bold ${getScoreColor(metrics.overallScore)}`}>
                  {metrics.overallScore}
                </div>
                <div className="text-xs text-gray-600">Puntuación</div>
              </div>
              
              <div className="flex items-center space-x-2">
                {getTrendIcon(metrics.trend)}
                <div className="text-sm">
                  <div className="font-medium">Tendencia</div>
                  <div className="text-xs text-gray-600 capitalize">{metrics.trend}</div>
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-lg font-semibold">{formatTime(sessionDuration)}</div>
              <div className="text-xs text-gray-600">Duración</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Métricas detalladas */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Métricas en Tiempo Real</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
            >
              {showDetails ? 'Ocultar' : 'Ver'} Detalles
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            {metricsData.map((metric) => (
              <div key={metric.key} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <metric.icon className="h-4 w-4 text-purple-600" />
                    <span className="text-sm font-medium">{metric.label}</span>
                  </div>
                  <span className={`text-sm font-bold ${getScoreColor(metric.value)}`}>
                    {metric.value}%
                  </span>
                </div>
                <Progress value={metric.value} className="h-2" />
                {showDetails && (
                  <p className="text-xs text-gray-500">{metric.description}</p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Alertas y sugerencias */}
      {(metrics.criticalIssues.length > 0 || metrics.positivePoints.length > 0) && (
        <Card>
          <CardContent className="p-4 space-y-3">
            {metrics.criticalIssues.length > 0 && (
              <div>
                <div className="flex items-center text-red-600 mb-2">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  <span className="text-sm font-medium">Atención Requerida</span>
                </div>
                {metrics.criticalIssues.map((issue, index) => (
                  <Badge key={index} variant="destructive" className="mr-2 mb-1 text-xs">
                    {issue}
                  </Badge>
                ))}
              </div>
            )}
            
            {metrics.positivePoints.length > 0 && (
              <div>
                <div className="flex items-center text-green-600 mb-2">
                  <Target className="h-4 w-4 mr-2" />
                  <span className="text-sm font-medium">Puntos Fuertes</span>
                </div>
                {metrics.positivePoints.map((point, index) => (
                  <Badge key={index} variant="secondary" className="mr-2 mb-1 text-xs bg-green-100 text-green-700">
                    {point}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Botón de feedback */}
      <Button
        onClick={onRequestFeedback}
        variant="outline"
        className="w-full"
        disabled={!isActive}
      >
        <Target className="h-4 w-4 mr-2" />
        Solicitar Feedback Intermedio
      </Button>
    </div>
  );
};

export default RealTimeEvaluation;
