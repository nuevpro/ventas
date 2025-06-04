
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Brain, Target, TrendingUp, BookOpen, Users, Lightbulb } from 'lucide-react';

const AdaptiveLearning = () => {
  const [userProfile, setUserProfile] = useState(null);
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    loadUserProfile();
    generateRecommendations();
  }, []);

  const loadUserProfile = () => {
    // Cargar perfil del usuario desde localStorage o API
    const profile = {
      strengths: ['Comunicación clara', 'Conocimiento técnico', 'Puntualidad'],
      weaknesses: ['Manejo de objeciones', 'Cierre de ventas', 'Empatía'],
      learningStyle: 'visual', // visual, auditivo, kinestésico
      preferredDifficulty: 'intermediate',
      goals: ['Mejorar ratio de conversión', 'Reducir tiempo de llamada', 'Aumentar satisfacción del cliente'],
      recentPerformance: {
        trend: 'improving', // improving, stable, declining
        averageScore: 78,
        sessionsThisWeek: 3,
        focusAreas: ['objection-handling', 'closing-techniques']
      }
    };
    setUserProfile(profile);
  };

  const generateRecommendations = () => {
    const recs = [
      {
        id: 1,
        type: 'scenario',
        title: 'Manejo Avanzado de Objeciones',
        description: 'Basado en tu desempeño reciente, practica estos escenarios desafiantes.',
        difficulty: 'advanced',
        estimatedTime: '20-25 min',
        reason: 'Área de mejora identificada',
        priority: 'high',
        icon: Target
      },
      {
        id: 2,
        type: 'skill',
        title: 'Técnicas de Escucha Activa',
        description: 'Fortalece tu capacidad de conexión emocional con el cliente.',
        difficulty: 'intermediate',
        estimatedTime: '15 min',
        reason: 'Complementa tus fortalezas',
        priority: 'medium',
        icon: Users
      },
      {
        id: 3,
        type: 'knowledge',
        title: 'Actualización de Productos',
        description: 'Nuevos features y beneficios para mejorar tu argumentación.',
        difficulty: 'beginner',
        estimatedTime: '10 min',
        reason: 'Contenido actualizado disponible',
        priority: 'low',
        icon: BookOpen
      }
    ];
    setRecommendations(recs);
  };

  const learningPaths = [
    {
      id: 1,
      name: 'Especialista en Ventas',
      progress: 65,
      nextMilestone: 'Dominar técnicas de cierre',
      totalSteps: 12,
      completedSteps: 8
    },
    {
      id: 2,
      name: 'Maestro del Rapport',
      progress: 40,
      nextMilestone: 'Practicar empatía avanzada',
      totalSteps: 10,
      completedSteps: 4
    },
    {
      id: 3,
      name: 'Comunicador Efectivo',
      progress: 80,
      nextMilestone: 'Presentaciones ejecutivas',
      totalSteps: 8,
      completedSteps: 6
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'low': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (!userProfile) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con IA insights */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Brain className="h-6 w-6 mr-2" />
            IA Personalizada - Ruta de Aprendizaje
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {userProfile.recentPerformance.averageScore}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Puntuación Promedio
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {userProfile.recentPerformance.trend === 'improving' ? '↗️' : '→'}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Tendencia {userProfile.recentPerformance.trend === 'improving' ? 'Mejorando' : 'Estable'}
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {userProfile.recentPerformance.sessionsThisWeek}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Sesiones esta semana
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recomendaciones personalizadas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Lightbulb className="h-5 w-5 mr-2" />
            Recomendaciones Personalizadas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recommendations.map((rec) => (
              <div
                key={rec.id}
                className="p-4 border rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <rec.icon className="h-5 w-5 text-purple-600" />
                      <h3 className="font-semibold">{rec.title}</h3>
                      <Badge className={getPriorityColor(rec.priority)}>
                        {rec.priority === 'high' ? 'Alta' : rec.priority === 'medium' ? 'Media' : 'Baja'}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {rec.description}
                    </p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>⏱️ {rec.estimatedTime}</span>
                      <span>📊 {rec.difficulty}</span>
                      <span>🎯 {rec.reason}</span>
                    </div>
                  </div>
                  <Button size="sm" className="ml-4">
                    Comenzar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Rutas de aprendizaje */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Rutas de Especialización
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {learningPaths.map((path) => (
              <div key={path.id} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">{path.name}</h3>
                  <span className="text-sm text-gray-500">
                    {path.completedSteps}/{path.totalSteps} pasos
                  </span>
                </div>
                <Progress value={path.progress} className="mb-2" />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    Próximo: {path.nextMilestone}
                  </span>
                  <span className="font-medium">{path.progress}%</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Fortalezas y áreas de mejora */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-green-200 dark:border-green-800">
          <CardHeader>
            <CardTitle className="text-green-600">Tus Fortalezas</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {userProfile.strengths.map((strength, index) => (
                <li key={index} className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3" />
                  <span className="text-sm">{strength}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 dark:border-yellow-800">
          <CardHeader>
            <CardTitle className="text-yellow-600">Áreas de Enfoque</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {userProfile.weaknesses.map((weakness, index) => (
                <li key={index} className="flex items-center">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3" />
                  <span className="text-sm">{weakness}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdaptiveLearning;
