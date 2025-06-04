
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, GraduationCap, Briefcase, MessageSquare } from 'lucide-react';

interface Scenario {
  id: string;
  title: string;
  description: string;
  category: 'sales' | 'education' | 'recruitment' | 'onboarding';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: string;
  objectives: string[];
  icon: React.ReactNode;
}

interface ScenarioSelectorProps {
  onSelectScenario: (scenario: Scenario) => void;
}

const ScenarioSelector = ({ onSelectScenario }: ScenarioSelectorProps) => {
  const scenarios: Scenario[] = [
    {
      id: 'sales-cold-call',
      title: 'Llamada en Frío - Ventas',
      description: 'Practica técnicas de prospección y apertura de conversaciones comerciales.',
      category: 'sales',
      difficulty: 'beginner',
      duration: '15-20 min',
      objectives: ['Captar atención inicial', 'Identificar necesidades', 'Agendar cita'],
      icon: <Users className="h-6 w-6" />
    },
    {
      id: 'sales-objection-handling',
      title: 'Manejo de Objeciones',
      description: 'Aprende a manejar y convertir las objeciones más comunes.',
      category: 'sales',
      difficulty: 'intermediate',
      duration: '20-25 min',
      objectives: ['Escuchar activamente', 'Reformular objeciones', 'Ofrecer soluciones'],
      icon: <MessageSquare className="h-6 w-6" />
    },
    {
      id: 'recruitment-interview',
      title: 'Entrevista de Selección',
      description: 'Simula entrevistas laborales desde la perspectiva del candidato.',
      category: 'recruitment',
      difficulty: 'intermediate',
      duration: '30-40 min',
      objectives: ['Presentar experiencia', 'Demostrar competencias', 'Hacer preguntas relevantes'],
      icon: <Briefcase className="h-6 w-6" />
    },
    {
      id: 'education-presentation',
      title: 'Presentación Académica',
      description: 'Practica presentaciones y exposición de temas educativos.',
      category: 'education',
      difficulty: 'beginner',
      duration: '15-30 min',
      objectives: ['Estructura clara', 'Engagement del público', 'Manejo de preguntas'],
      icon: <GraduationCap className="h-6 w-6" />
    },
  ];

  const getCategoryColor = (category: string) => {
    const colors = {
      sales: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
      education: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
      recruitment: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
      onboarding: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
    };
    return colors[category as keyof typeof colors] || colors.sales;
  };

  const getDifficultyColor = (difficulty: string) => {
    const colors = {
      beginner: 'bg-green-100 text-green-700',
      intermediate: 'bg-yellow-100 text-yellow-700',
      advanced: 'bg-red-100 text-red-700',
    };
    return colors[difficulty as keyof typeof colors] || colors.beginner;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {scenarios.map((scenario) => (
        <Card key={scenario.id} className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  {scenario.icon}
                </div>
                <div>
                  <CardTitle className="text-lg">{scenario.title}</CardTitle>
                  <div className="flex space-x-2 mt-2">
                    <Badge className={getCategoryColor(scenario.category)}>
                      {scenario.category}
                    </Badge>
                    <Badge className={getDifficultyColor(scenario.difficulty)}>
                      {scenario.difficulty}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              {scenario.description}
            </p>
            
            <div className="mb-4">
              <h4 className="font-medium text-sm mb-2">Objetivos:</h4>
              <ul className="space-y-1">
                {scenario.objectives.map((objective, index) => (
                  <li key={index} className="text-sm text-gray-600 dark:text-gray-300 flex items-center">
                    <div className="w-1.5 h-1.5 bg-purple-600 rounded-full mr-2" />
                    {objective}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">⏱️ {scenario.duration}</span>
              <Button onClick={() => onSelectScenario(scenario)}>
                Iniciar Entrenamiento
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ScenarioSelector;
