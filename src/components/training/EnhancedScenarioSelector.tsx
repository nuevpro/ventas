
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, GraduationCap, Briefcase, MessageSquare, Handshake, HeadphonesIcon, Search, Play, Edit, Plus } from 'lucide-react';
import { useScenarios } from '@/hooks/useScenarios';
import ScenarioDialog from './ScenarioDialog';
import type { Database } from '@/integrations/supabase/types';

type Scenario = Database['public']['Tables']['scenarios']['Row'];

interface EnhancedScenarioSelectorProps {
  onSelectScenario: (scenario: Scenario) => void;
}

const categoryConfig = {
  sales: {
    label: 'Ventas',
    icon: Users,
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
  },
  customer_service: {
    label: 'Atención al Cliente',
    icon: HeadphonesIcon,
    color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
  },
  hr: {
    label: 'Recursos Humanos',
    icon: Briefcase,
    color: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
  },
  negotiation: {
    label: 'Negociación',
    icon: Handshake,
    color: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300'
  },
  education: {
    label: 'Educación',
    icon: GraduationCap,
    color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300'
  },
  recruitment: {
    label: 'Reclutamiento',
    icon: MessageSquare,
    color: 'bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300'
  },
  onboarding: {
    label: 'Onboarding',
    icon: Users,
    color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
  }
};

const EnhancedScenarioSelector = ({ onSelectScenario }: EnhancedScenarioSelectorProps) => {
  const { scenarios, loading, error, getScenariosByCategory, getCategories } = useScenarios();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  console.log('EnhancedScenarioSelector - scenarios:', scenarios);
  console.log('EnhancedScenarioSelector - loading:', loading);
  console.log('EnhancedScenarioSelector - error:', error);

  const getDifficultyColor = (difficulty: number) => {
    const colors = {
      1: 'bg-green-100 text-green-700',
      2: 'bg-yellow-100 text-yellow-700',
      3: 'bg-red-100 text-red-700',
    };
    return colors[difficulty as keyof typeof colors] || colors[1];
  };

  const getDifficultyLabel = (difficulty: number) => {
    const labels = {
      1: 'Principiante',
      2: 'Intermedio',
      3: 'Avanzado'
    };
    return labels[difficulty as keyof typeof labels] || 'Principiante';
  };

  const filteredScenarios = scenarios.filter(scenario => {
    const matchesSearch = scenario.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         scenario.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || scenario.scenario_type === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = getCategories();

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
        <p className="text-gray-500">Cargando escenarios...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 mb-4">Error al cargar escenarios: {error}</p>
        <Button onClick={() => window.location.reload()}>
          Recargar
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Encabezado con búsqueda y crear escenario */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar escenarios..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <ScenarioDialog />
      </div>

      {/* Navegación por categorías */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 xl:grid-cols-8">
          <TabsTrigger value="all">Todos</TabsTrigger>
          {categories.map((category) => {
            const config = categoryConfig[category as keyof typeof categoryConfig];
            return (
              <TabsTrigger key={category} value={category}>
                {config?.label || category}
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value={selectedCategory} className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredScenarios.map((scenario) => {
              const categoryInfo = categoryConfig[scenario.scenario_type as keyof typeof categoryConfig];
              const Icon = categoryInfo?.icon || Users;

              // Type guard para expected_outcomes
              const expectedOutcomes = scenario.expected_outcomes as { objectives?: string[] } | null;
              const objectives = expectedOutcomes?.objectives || [];

              return (
                <Card key={scenario.id} className="hover:shadow-lg transition-shadow relative">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3 flex-1">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-base leading-tight">{scenario.title}</CardTitle>
                          <div className="flex flex-wrap gap-1 mt-2">
                            <Badge className={categoryInfo?.color || 'bg-gray-100 text-gray-700'}>
                              {categoryInfo?.label || scenario.scenario_type}
                            </Badge>
                            <Badge className={getDifficultyColor(scenario.difficulty_level || 1)}>
                              {getDifficultyLabel(scenario.difficulty_level || 1)}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <ScenarioDialog
                        scenario={scenario}
                        trigger={
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        }
                      />
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
                      {scenario.description}
                    </p>
                    
                    {objectives.length > 0 && (
                      <div className="mb-4">
                        <h4 className="font-medium text-xs mb-2 text-gray-500 uppercase tracking-wide">
                          Objetivos:
                        </h4>
                        <ul className="space-y-1">
                          {objectives.slice(0, 3).map((objective: string, index: number) => (
                            <li key={index} className="text-xs text-gray-600 dark:text-gray-300 flex items-center">
                              <div className="w-1 h-1 bg-purple-600 rounded-full mr-2 flex-shrink-0" />
                              <span className="truncate">{objective}</span>
                            </li>
                          ))}
                          {objectives.length > 3 && (
                            <li className="text-xs text-gray-500">
                              +{objectives.length - 3} más...
                            </li>
                          )}
                        </ul>
                      </div>
                    )}
                    
                    <Button 
                      onClick={() => onSelectScenario(scenario)}
                      className="w-full"
                      size="sm"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Iniciar Entrenamiento
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {filteredScenarios.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">
                No se encontraron escenarios que coincidan con tu búsqueda.
              </p>
              <ScenarioDialog 
                trigger={
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Crear Primer Escenario
                  </Button>
                }
              />
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedScenarioSelector;
