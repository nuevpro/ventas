
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2, User, Brain, MessageSquare, Save } from 'lucide-react';
import { useBehaviors } from '@/hooks/useBehaviors';
import { useScenarios } from '@/hooks/useScenarios';
import type { Database } from '@/integrations/supabase/types';

type Behavior = Database['public']['Tables']['behaviors']['Row'];

const BehaviorManager = () => {
  const { behaviors, loading, createBehavior, updateBehavior, deleteBehavior } = useBehaviors();
  const { scenarios } = useScenarios();
  const [editingBehavior, setEditingBehavior] = useState<Behavior | null>(null);
  const [isCreating, setIsCreating] = useState(false);

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

  const handleSaveBehavior = async (behavior: Partial<Behavior>) => {
    try {
      const commonObjections = typeof behavior.common_objections === 'string' 
        ? behavior.common_objections.split('\n').filter(o => o.trim())
        : (behavior.common_objections as any) || [];

      const behaviorData = {
        name: behavior.name || '',
        scenario_id: behavior.scenario_id || undefined,
        client_personality: behavior.client_personality || '',
        emotional_tone: behavior.emotional_tone || 'neutral',
        technical_level: behavior.technical_level || 'intermediate',
        common_objections: commonObjections,
        knowledge_base: behavior.knowledge_base || '',
        response_style: behavior.response_style || '',
        voice: behavior.voice || 'Sarah'
      };

      if (isCreating) {
        await createBehavior(behaviorData);
      } else if (editingBehavior) {
        await updateBehavior(editingBehavior.id, behaviorData);
      }
      
      setEditingBehavior(null);
      setIsCreating(false);
    } catch (error) {
      console.error('Error saving behavior:', error);
    }
  };

  const handleDeleteBehavior = async (id: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este comportamiento?')) {
      await deleteBehavior(id);
    }
  };

  const BehaviorForm = ({ behavior, onSave, onCancel }: {
    behavior: Partial<Behavior>;
    onSave: (behavior: Partial<Behavior>) => void;
    onCancel: () => void;
  }) => {
    const [formData, setFormData] = useState(behavior);

    const getCommonObjectionsText = () => {
      if (typeof formData.common_objections === 'string') {
        return formData.common_objections;
      }
      if (Array.isArray(formData.common_objections)) {
        return formData.common_objections.join('\n');
      }
      return '';
    };

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
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ej: Cliente Escéptico - Ventas Software"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Escenario</label>
              <Select 
                value={formData.scenario_id || ''} 
                onValueChange={(value) => setFormData({ ...formData, scenario_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar escenario" />
                </SelectTrigger>
                <SelectContent>
                  {scenarios.map(scenario => (
                    <SelectItem key={scenario.id} value={scenario.id}>
                      {scenario.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Personalidad del Cliente</label>
            <Textarea
              value={formData.client_personality || ''}
              onChange={(e) => setFormData({ ...formData, client_personality: e.target.value })}
              placeholder="Describe cómo debe comportarse el cliente virtual..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Tono Emocional</label>
              <Select 
                value={formData.emotional_tone || 'neutral'} 
                onValueChange={(value) => setFormData({ ...formData, emotional_tone: value })}
              >
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
              <Select 
                value={formData.technical_level || 'intermediate'} 
                onValueChange={(value) => setFormData({ ...formData, technical_level: value })}
              >
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
                value={formData.voice || 'Sarah'}
                onChange={(e) => setFormData({ ...formData, voice: e.target.value })}
                placeholder="Ej: George, Sarah, Charlotte"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Base de Conocimiento</label>
            <Textarea
              value={formData.knowledge_base || ''}
              onChange={(e) => setFormData({ ...formData, knowledge_base: e.target.value })}
              placeholder="Conocimientos que debe tener el cliente virtual..."
              rows={2}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Estilo de Respuesta</label>
            <Textarea
              value={formData.response_style || ''}
              onChange={(e) => setFormData({ ...formData, response_style: e.target.value })}
              placeholder="Cómo debe comunicarse el cliente virtual..."
              rows={2}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Objeciones Comunes (una por línea)</label>
            <Textarea
              value={getCommonObjectionsText()}
              onChange={(e) => setFormData({ 
                ...formData, 
                common_objections: e.target.value
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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Gestión de Comportamientos</h2>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
          <p className="text-gray-500">Cargando comportamientos...</p>
        </div>
      </div>
    );
  }

  if (editingBehavior || isCreating) {
    return (
      <BehaviorForm
        behavior={editingBehavior || {
          name: '',
          scenario_id: '',
          client_personality: '',
          emotional_tone: 'neutral',
          technical_level: 'intermediate',
          common_objections: [],
          knowledge_base: '',
          response_style: '',
          voice: 'Sarah'
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
        {behaviors.map((behavior) => {
          const scenario = scenarios.find(s => s.id === behavior.scenario_id);
          const emotionalTone = emotionalTones.find(t => t.value === behavior.emotional_tone);
          const technicalLevel = technicalLevels.find(l => l.value === behavior.technical_level);
          
          // Manejar common_objections como array o string
          const objections = Array.isArray(behavior.common_objections) 
            ? behavior.common_objections 
            : [];

          return (
            <Card key={behavior.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">{behavior.name}</h3>
                    <div className="flex space-x-2 mt-2">
                      <Badge variant="outline">{scenario?.title || 'Sin escenario'}</Badge>
                      <Badge className={behavior.emotional_tone === 'skeptical' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}>
                        {emotionalTone?.label || behavior.emotional_tone}
                      </Badge>
                      <Badge variant="secondary">{technicalLevel?.label || behavior.technical_level}</Badge>
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
                    <p className="text-gray-800 dark:text-gray-200">
                      {behavior.client_personality?.substring(0, 100)}...
                    </p>
                  </div>
                  
                  <div>
                    <div className="flex items-center text-gray-600 dark:text-gray-400 mb-1">
                      <Brain className="h-4 w-4 mr-1" />
                      Conocimiento
                    </div>
                    <p className="text-gray-800 dark:text-gray-200">
                      {behavior.knowledge_base?.substring(0, 100)}...
                    </p>
                  </div>
                  
                  <div>
                    <div className="flex items-center text-gray-600 dark:text-gray-400 mb-1">
                      <MessageSquare className="h-4 w-4 mr-1" />
                      Objeciones
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {objections.slice(0, 2).map((objection, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {objection}
                        </Badge>
                      ))}
                      {objections.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{objections.length - 2} más
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {behaviors.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                No hay comportamientos configurados
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Crea tu primer comportamiento para personalizar las sesiones de entrenamiento
              </p>
              <Button onClick={() => setIsCreating(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Crear Primer Comportamiento
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default BehaviorManager;
