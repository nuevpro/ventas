
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, Target, User, MessageSquare, Phone, Brain } from 'lucide-react';

interface ScenarioPreviewProps {
  scenario: any;
  onStart: (config: any) => void;
  onBack: () => void;
}

const ScenarioPreview = ({ scenario, onStart, onBack }: ScenarioPreviewProps) => {
  const [clientEmotion, setClientEmotion] = useState('neutral');
  const [interactionMode, setInteractionMode] = useState('call');

  const emotions = [
    { value: 'neutral', label: 'Neutral', color: 'bg-gray-100 text-gray-700' },
    { value: 'curious', label: 'Curioso', color: 'bg-blue-100 text-blue-700' },
    { value: 'skeptical', label: 'Escéptico', color: 'bg-yellow-100 text-yellow-700' },
    { value: 'angry', label: 'Enojado', color: 'bg-red-100 text-red-700' },
    { value: 'interested', label: 'Interesado', color: 'bg-green-100 text-green-700' },
    { value: 'busy', label: 'Ocupado', color: 'bg-orange-100 text-orange-700' },
    { value: 'confused', label: 'Confundido', color: 'bg-purple-100 text-purple-700' }
  ];

  const modes = [
    { value: 'call', label: 'Llamada', icon: Phone },
    { value: 'chat', label: 'Chat', icon: MessageSquare }
  ];

  const handleStart = () => {
    onStart({
      scenario: scenario.id,
      clientEmotion,
      interactionMode,
      difficulty: scenario.difficulty
    });
  };

  const selectedEmotion = emotions.find(e => e.value === clientEmotion);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onBack}>
          ← Volver al nivel
        </Button>
        <div className="flex items-center space-x-4">
          <Badge className={selectedEmotion?.color}>
            {selectedEmotion?.label}
          </Badge>
          <Badge variant="outline" className="flex items-center">
            {interactionMode === 'call' ? <Phone className="h-3 w-3 mr-1" /> : <MessageSquare className="h-3 w-3 mr-1" />}
            Modo {interactionMode === 'call' ? 'Voz' : 'Chat'}
          </Badge>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <Brain className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl">{scenario.title}</h1>
                <p className="text-gray-600 dark:text-gray-400">Nivel 1: {scenario.title}</p>
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg">
            <h3 className="font-semibold mb-4">Conversación con Cliente Virtual</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{scenario.description}</p>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Instrucciones:</h4>
                <ul className="space-y-1 text-sm">
                  <li className="flex items-center">
                    <div className="w-1.5 h-1.5 bg-purple-600 rounded-full mr-2" />
                    Perfil del cliente: neutral
                  </li>
                  <li className="flex items-center">
                    <div className="w-1.5 h-1.5 bg-purple-600 rounded-full mr-2" />
                    Habla claramente y a un ritmo normal
                  </li>
                  <li className="flex items-center">
                    <div className="w-1.5 h-1.5 bg-purple-600 rounded-full mr-2" />
                    Permite que el cliente virtual responda
                  </li>
                  <li className="flex items-center">
                    <div className="w-1.5 h-1.5 bg-purple-600 rounded-full mr-2" />
                    La sesión se grabará para análisis y feedback
                  </li>
                </ul>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <div className="flex items-center text-blue-600 dark:text-blue-400 mb-2">
                  <Target className="h-4 w-4 mr-2" />
                  Frases útiles durante la conversación:
                </div>
                <ul className="space-y-1 text-sm text-blue-700 dark:text-blue-300">
                  <li>• "Califícame, por favor" - Para recibir tu evaluación</li>
                  <li>• "Dame feedback sobre..." - Para obtener consejos específicos</li>
                  <li>• "¿Qué podría mejorar?" - Para recibir recomendaciones</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Estado emocional del cliente</label>
              <Select value={clientEmotion} onValueChange={setClientEmotion}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {emotions.map((emotion) => (
                    <SelectItem key={emotion.value} value={emotion.value}>
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full mr-2 ${emotion.color.split(' ')[0]}`} />
                        {emotion.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Modo de interacción</label>
              <Select value={interactionMode} onValueChange={setInteractionMode}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {modes.map((mode) => (
                    <SelectItem key={mode.value} value={mode.value}>
                      <div className="flex items-center">
                        <mode.icon className="h-4 w-4 mr-2" />
                        {mode.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3">
              <Clock className="h-5 w-5 text-gray-500" />
              <div>
                <div className="text-sm font-medium">Duración</div>
                <div className="text-sm text-gray-500">{scenario.duration}</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Target className="h-5 w-5 text-gray-500" />
              <div>
                <div className="text-sm font-medium">Dificultad</div>
                <div className="text-sm text-gray-500 capitalize">{scenario.difficulty}</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <User className="h-5 w-5 text-gray-500" />
              <div>
                <div className="text-sm font-medium">Categoría</div>
                <div className="text-sm text-gray-500 capitalize">{scenario.category}</div>
              </div>
            </div>
          </div>

          <Button 
            onClick={handleStart}
            size="lg"
            className="w-full bg-black hover:bg-gray-800 text-white"
          >
            Comenzar conversación
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ScenarioPreview;
