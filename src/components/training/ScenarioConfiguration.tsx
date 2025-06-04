
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Phone, MessageCircle, User, Settings, Target, Clock } from 'lucide-react';

interface ScenarioConfigurationProps {
  onStartTraining: (config: TrainingConfig) => void;
}

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

const ScenarioConfiguration = ({ onStartTraining }: ScenarioConfigurationProps) => {
  const [config, setConfig] = useState<TrainingConfig>({
    scenarioTitle: '',
    scenarioDescription: '',
    clientEmotion: 'neutral',
    interactionMode: 'call',
    selectedVoice: '',
    difficulty: 'medium',
    duration: 15,
    objectives: []
  });

  const scenarios = [
    {
      id: 'sales-consultation',
      title: 'Consulta de Ventas',
      description: 'Cliente interesado en productos/servicios, requiere asesoramiento personalizado',
      difficulty: 'easy',
      objectives: ['Identificar necesidades', 'Presentar solución', 'Cerrar venta']
    },
    {
      id: 'customer-complaint',
      title: 'Atención de Quejas',
      description: 'Cliente molesto por un problema con el servicio o producto',
      difficulty: 'hard',
      objectives: ['Escuchar activamente', 'Mostrar empatía', 'Resolver el problema']
    },
    {
      id: 'technical-support',
      title: 'Soporte Técnico',
      description: 'Cliente necesita ayuda técnica con un producto o servicio',
      difficulty: 'medium',
      objectives: ['Diagnosticar problema', 'Guiar solución', 'Verificar resolución']
    },
    {
      id: 'renewal-retention',
      title: 'Renovación/Retención',
      description: 'Cliente considerando cancelar el servicio, necesita ser retenido',
      difficulty: 'hard',
      objectives: ['Entender motivos', 'Ofrecer alternativas', 'Negociar renovación']
    }
  ];

  const emotions = [
    { id: 'neutral', label: 'Neutral', description: 'Cliente calmado y receptivo' },
    { id: 'molesto', label: 'Molesto', description: 'Cliente frustrado o enojado' },
    { id: 'escéptico', label: 'Escéptico', description: 'Cliente dubitativo y cauteloso' },
    { id: 'interesado', label: 'Interesado', description: 'Cliente entusiasta y participativo' },
    { id: 'urgente', label: 'Urgente', description: 'Cliente con prisa por resolver' }
  ];

  const voices = [
    { id: 'maria', name: 'María', description: 'Voz femenina, profesional' },
    { id: 'carlos', name: 'Carlos', description: 'Voz masculina, amigable' },
    { id: 'sofia', name: 'Sofía', description: 'Voz femenina, juvenil' },
    { id: 'ricardo', name: 'Ricardo', description: 'Voz masculina, formal' }
  ];

  const handleScenarioSelect = (scenarioId: string) => {
    const scenario = scenarios.find(s => s.id === scenarioId);
    if (scenario) {
      setConfig(prev => ({
        ...prev,
        scenarioTitle: scenario.title,
        scenarioDescription: scenario.description,
        difficulty: scenario.difficulty,
        objectives: scenario.objectives
      }));
    }
  };

  const handleStartTraining = () => {
    if (config.scenarioTitle) {
      onStartTraining(config);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'hard': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'Fácil';
      case 'medium': return 'Medio';
      case 'hard': return 'Difícil';
      default: return 'Desconocido';
    }
  };

  return (
    <div className="space-y-6">
      {/* Selección de escenario */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="h-5 w-5 mr-2" />
            Seleccionar Escenario
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {scenarios.map((scenario) => (
              <div
                key={scenario.id}
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  config.scenarioTitle === scenario.title
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleScenarioSelect(scenario.id)}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium">{scenario.title}</h3>
                  <Badge className={`${getDifficultyColor(scenario.difficulty)} text-white`}>
                    {getDifficultyLabel(scenario.difficulty)}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mb-3">{scenario.description}</p>
                <div className="flex flex-wrap gap-1">
                  {scenario.objectives.map((objective, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {objective}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {config.scenarioTitle && (
        <>
          {/* Configuración del cliente */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Perfil del Cliente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-base font-medium mb-3 block">
                  Estado emocional del cliente
                </Label>
                <RadioGroup
                  value={config.clientEmotion}
                  onValueChange={(value) => setConfig(prev => ({ ...prev, clientEmotion: value }))}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                  {emotions.map((emotion) => (
                    <div key={emotion.id} className="flex items-center space-x-2">
                      <RadioGroupItem value={emotion.id} id={emotion.id} />
                      <Label htmlFor={emotion.id} className="flex-1 cursor-pointer">
                        <div>
                          <div className="font-medium">{emotion.label}</div>
                          <div className="text-sm text-gray-600">{emotion.description}</div>
                        </div>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </CardContent>
          </Card>

          {/* Configuración de interacción */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Configuración de Interacción
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Modo de interacción */}
              <div>
                <Label className="text-base font-medium mb-3 block">
                  Tipo de comunicación
                </Label>
                <RadioGroup
                  value={config.interactionMode}
                  onValueChange={(value: 'call' | 'chat') => setConfig(prev => ({ ...prev, interactionMode: value }))}
                  className="grid grid-cols-2 gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="call" id="call" />
                    <Label htmlFor="call" className="flex items-center cursor-pointer">
                      <Phone className="h-4 w-4 mr-2" />
                      Llamada (Voz)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="chat" id="chat" />
                    <Label htmlFor="chat" className="flex items-center cursor-pointer">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Chat (Texto)
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Selección de voz (solo para llamadas) */}
              {config.interactionMode === 'call' && (
                <div>
                  <Label className="text-base font-medium mb-3 block">
                    Voz del cliente
                  </Label>
                  <Select
                    value={config.selectedVoice}
                    onValueChange={(value) => setConfig(prev => ({ ...prev, selectedVoice: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar voz" />
                    </SelectTrigger>
                    <SelectContent>
                      {voices.map((voice) => (
                        <SelectItem key={voice.id} value={voice.id}>
                          <div>
                            <div className="font-medium">{voice.name}</div>
                            <div className="text-sm text-gray-600">{voice.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Duración */}
              <div>
                <Label className="text-base font-medium mb-3 block">
                  Duración estimada
                </Label>
                <Select
                  value={config.duration.toString()}
                  onValueChange={(value) => setConfig(prev => ({ ...prev, duration: parseInt(value) }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 minutos (Práctica rápida)</SelectItem>
                    <SelectItem value="15">15 minutos (Sesión corta)</SelectItem>
                    <SelectItem value="30">30 minutos (Sesión completa)</SelectItem>
                    <SelectItem value="45">45 minutos (Sesión extendida)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Resumen y botón de inicio */}
          <Card>
            <CardHeader>
              <CardTitle>Resumen de Configuración</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium">Escenario:</span>
                  <p className="text-gray-600">{config.scenarioTitle}</p>
                </div>
                <div>
                  <span className="font-medium">Cliente:</span>
                  <p className="text-gray-600 capitalize">{config.clientEmotion}</p>
                </div>
                <div>
                  <span className="font-medium">Modalidad:</span>
                  <p className="text-gray-600">
                    {config.interactionMode === 'call' ? 'Llamada' : 'Chat'}
                  </p>
                </div>
              </div>

              {config.objectives.length > 0 && (
                <div>
                  <span className="font-medium block mb-2">Objetivos de la sesión:</span>
                  <div className="flex flex-wrap gap-2">
                    {config.objectives.map((objective, index) => (
                      <Badge key={index} variant="outline">
                        {objective}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-4">
                <Button onClick={handleStartTraining} size="lg" className="w-full">
                  <Clock className="h-4 w-4 mr-2" />
                  Iniciar Entrenamiento ({config.duration} min)
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default ScenarioConfiguration;
