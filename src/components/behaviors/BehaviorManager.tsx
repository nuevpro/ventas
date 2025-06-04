
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2, User, Brain, MessageSquare, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Behavior {
  id: string;
  name: string;
  scenario: string;
  clientPersonality: string;
  emotionalTone: string;
  technicalLevel: string;
  commonObjections: string[];
  knowledgeBase: string;
  responseStyle: string;
  voice: string;
  isActive: boolean;
}

const BehaviorManager = () => {
  const [behaviors, setBehaviors] = useState<Behavior[]>([
    {
      id: '1',
      name: 'Cliente Escéptico - Ventas Software',
      scenario: 'sales-cold-call',
      clientPersonality: 'Empresario ocupado y desconfiado de nuevas soluciones',
      emotionalTone: 'skeptical',
      technicalLevel: 'intermediate',
      commonObjections: ['Es muy caro', 'Ya tenemos una solución', 'No tenemos tiempo para implementar'],
      knowledgeBase: 'Conocimiento básico de software empresarial, enfocado en ROI',
      responseStyle: 'Directo, pragmático, centrado en números y resultados',
      voice: 'George',
      isActive: true
    }
  ]);

  const [editingBehavior, setEditingBehavior] = useState<Behavior | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  const scenarios = [
    { value: 'sales-cold-call', label: 'Llamada en Frío - Ventas' },
    { value: 'sales-objection-handling', label: 'Manejo de Objeciones' },
    { value: 'recruitment-interview', label: 'Entrevista de Selección' },
    { value: 'education-presentation', label: 'Presentación Académica' }
  ];

  const emotionalTones = [
    { value: 'neutral', label: 'Neutral' },
    { value: 'skeptical', label: 'Escéptico' },
    { value: 'curious', label: 'Curioso' },
    { value: 'angry', label: 'Enojado' },
    { value: 'interested', label: 'Interesado' },
    { value: 'busy', label: 'Ocupado' }
  ];

  const technicalLevels = [
    { value: 'beginner', label: 'Básico' },
    { value: 'intermediate', label: 'Intermedio' },
    { value: 'advanced', label: 'Avanzado' },
    { value: 'expert', label: 'Experto' }
  ];

  const handleSaveBehavior = (behavior: Behavior) => {
    if (isCreating) {
      setBehaviors([...behaviors, { ...behavior, id: Date.now().toString() }]);
      toast({ title: "Comportamiento creado", description: "El nuevo comportamiento ha sido guardado." });
    } else {
      setBehaviors(behaviors.map(b => b.id === behavior.id ? behavior : b));
      toast({ title: "Comportamiento actualizado", description: "Los cambios han sido guardados." });
    }
    setEditingBehavior(null);
    setIsCreating(false);
  };

  const handleDeleteBehavior = (id: string) => {
    setBehaviors(behaviors.filter(b => b.id !== id));
    toast({ title: "Comportamiento eliminado", description: "El comportamiento ha sido eliminado." });
  };

  const BehaviorForm = ({ behavior, onSave, onCancel }: {
    behavior: Behavior;
    onSave: (behavior: Behavior) => void;
    onCancel: () => void;
  }) => {
    const [formData, setFormData] = useState(behavior);

    return (
      <Card>
        <CardHeader>
          <CardTitle>{isCreating ? 'Crear Nuevo Comportamiento' : 'Editar Comportamiento'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Nombre del Comportamiento</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ej: Cliente Escéptico - Ventas Software"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Escenario</label>
              <Select value={formData.scenario} onValueChange={(value) => setFormData({ ...formData, scenario: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {scenarios.map(scenario => (
                    <SelectItem key={scenario.value} value={scenario.value}>
                      {scenario.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Personalidad del Cliente</label>
            <Textarea
              value={formData.clientPersonality}
              onChange={(e) => setFormData({ ...formData, clientPersonality: e.target.value })}
              placeholder="Describe cómo debe comportarse el cliente virtual..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Tono Emocional</label>
              <Select value={formData.emotionalTone} onValueChange={(value) => setFormData({ ...formData, emotionalTone: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {emotionalTones.map(tone => (
                    <SelectItem key={tone.value} value={tone.value}>
                      {tone.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Nivel Técnico</label>
              <Select value={formData.technicalLevel} onValueChange={(value) => setFormData({ ...formData, technicalLevel: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {technicalLevels.map(level => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Voz</label>
              <Input
                value={formData.voice}
                onChange={(e) => setFormData({ ...formData, voice: e.target.value })}
                placeholder="Ej: George, Sarah, Charlotte"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Base de Conocimiento</label>
            <Textarea
              value={formData.knowledgeBase}
              onChange={(e) => setFormData({ ...formData, knowledgeBase: e.target.value })}
              placeholder="Conocimientos que debe tener el cliente virtual..."
              rows={2}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Estilo de Respuesta</label>
            <Textarea
              value={formData.responseStyle}
              onChange={(e) => setFormData({ ...formData, responseStyle: e.target.value })}
              placeholder="Cómo debe comunicarse el cliente virtual..."
              rows={2}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Objeciones Comunes (una por línea)</label>
            <Textarea
              value={formData.commonObjections.join('\n')}
              onChange={(e) => setFormData({ 
                ...formData, 
                commonObjections: e.target.value.split('\n').filter(o => o.trim()) 
              })}
              placeholder="Es muy caro&#10;Ya tenemos una solución&#10;No tenemos tiempo"
              rows={3}
            />
          </div>

          <div className="flex space-x-2">
            <Button onClick={() => onSave(formData)}>
              <Save className="h-4 w-4 mr-2" />
              Guardar
            </Button>
            <Button variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (editingBehavior || isCreating) {
    return (
      <BehaviorForm
        behavior={editingBehavior || {
          id: '',
          name: '',
          scenario: '',
          clientPersonality: '',
          emotionalTone: 'neutral',
          technicalLevel: 'intermediate',
          commonObjections: [],
          knowledgeBase: '',
          responseStyle: '',
          voice: 'Sarah',
          isActive: true
        }}
        onSave={handleSaveBehavior}
        onCancel={() => {
          setEditingBehavior(null);
          setIsCreating(false);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gestión de Comportamientos</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Configura cómo debe comportarse la IA en cada escenario de entrenamiento
          </p>
        </div>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Comportamiento
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {behaviors.map((behavior) => (
          <Card key={behavior.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold">{behavior.name}</h3>
                  <div className="flex space-x-2 mt-2">
                    <Badge variant="outline">{scenarios.find(s => s.value === behavior.scenario)?.label}</Badge>
                    <Badge className={behavior.emotionalTone === 'skeptical' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}>
                      {emotionalTones.find(t => t.value === behavior.emotionalTone)?.label}
                    </Badge>
                    <Badge variant="secondary">{technicalLevels.find(l => l.value === behavior.technicalLevel)?.label}</Badge>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={() => setEditingBehavior(behavior)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDeleteBehavior(behavior.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="flex items-center text-gray-600 dark:text-gray-400 mb-1">
                    <User className="h-4 w-4 mr-1" />
                    Personalidad
                  </div>
                  <p className="text-gray-800 dark:text-gray-200">{behavior.clientPersonality.substring(0, 100)}...</p>
                </div>
                
                <div>
                  <div className="flex items-center text-gray-600 dark:text-gray-400 mb-1">
                    <Brain className="h-4 w-4 mr-1" />
                    Conocimiento
                  </div>
                  <p className="text-gray-800 dark:text-gray-200">{behavior.knowledgeBase.substring(0, 100)}...</p>
                </div>
                
                <div>
                  <div className="flex items-center text-gray-600 dark:text-gray-400 mb-1">
                    <MessageSquare className="h-4 w-4 mr-1" />
                    Objeciones
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {behavior.commonObjections.slice(0, 2).map((objection, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {objection}
                      </Badge>
                    ))}
                    {behavior.commonObjections.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{behavior.commonObjections.length - 2} más
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default BehaviorManager;
