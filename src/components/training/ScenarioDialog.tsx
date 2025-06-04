
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Edit } from 'lucide-react';
import { useScenarios } from '@/hooks/useScenarios';
import type { Database } from '@/integrations/supabase/types';

type Scenario = Database['public']['Tables']['scenarios']['Row'];

interface ScenarioDialogProps {
  scenario?: Scenario;
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

const ScenarioDialog = ({ scenario, trigger, onSuccess }: ScenarioDialogProps) => {
  const { createScenario, updateScenario } = useScenarios();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    scenario_type: 'sales',
    difficulty_level: 1,
    prompt_instructions: '',
    objectives: ['']
  });

  const categories = [
    { value: 'sales', label: 'Ventas' },
    { value: 'customer_service', label: 'Atención al Cliente' },
    { value: 'hr', label: 'Recursos Humanos' },
    { value: 'negotiation', label: 'Negociación' },
    { value: 'education', label: 'Educación' },
    { value: 'recruitment', label: 'Reclutamiento' },
    { value: 'onboarding', label: 'Onboarding' },
  ];

  useEffect(() => {
    if (scenario) {
      setFormData({
        title: scenario.title,
        description: scenario.description || '',
        scenario_type: scenario.scenario_type || 'sales',
        difficulty_level: scenario.difficulty_level || 1,
        prompt_instructions: scenario.prompt_instructions || '',
        objectives: scenario.expected_outcomes?.objectives || ['']
      });
    }
  }, [scenario]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const scenarioData = {
        ...formData,
        expected_outcomes: {
          objectives: formData.objectives.filter(obj => obj.trim() !== '')
        }
      };

      if (scenario) {
        await updateScenario(scenario.id, scenarioData);
      } else {
        await createScenario(scenarioData);
      }

      setOpen(false);
      onSuccess?.();
      
      if (!scenario) {
        setFormData({
          title: '',
          description: '',
          scenario_type: 'sales',
          difficulty_level: 1,
          prompt_instructions: '',
          objectives: ['']
        });
      }
    } catch (error) {
      console.error('Error saving scenario:', error);
    } finally {
      setLoading(false);
    }
  };

  const addObjective = () => {
    setFormData(prev => ({
      ...prev,
      objectives: [...prev.objectives, '']
    }));
  };

  const updateObjective = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      objectives: prev.objectives.map((obj, i) => i === index ? value : obj)
    }));
  };

  const removeObjective = (index: number) => {
    setFormData(prev => ({
      ...prev,
      objectives: prev.objectives.filter((_, i) => i !== index)
    }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant={scenario ? "ghost" : "default"} size={scenario ? "sm" : "default"}>
            {scenario ? <Edit className="h-4 w-4" /> : <Plus className="h-4 w-4 mr-2" />}
            {scenario ? '' : 'Crear Escenario'}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {scenario ? 'Editar Escenario' : 'Crear Nuevo Escenario'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Nombre del escenario"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe en qué consiste este escenario"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Categoría</Label>
              <Select
                value={formData.scenario_type}
                onValueChange={(value) => setFormData(prev => ({ ...prev, scenario_type: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="difficulty">Dificultad</Label>
              <Select
                value={formData.difficulty_level.toString()}
                onValueChange={(value) => setFormData(prev => ({ ...prev, difficulty_level: parseInt(value) }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Principiante</SelectItem>
                  <SelectItem value="2">Intermedio</SelectItem>
                  <SelectItem value="3">Avanzado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="instructions">Instrucciones para la IA</Label>
            <Textarea
              id="instructions"
              value={formData.prompt_instructions}
              onChange={(e) => setFormData(prev => ({ ...prev, prompt_instructions: e.target.value }))}
              placeholder="Cómo debe comportarse la IA durante este escenario"
              rows={3}
            />
          </div>

          <div>
            <Label>Objetivos de Aprendizaje</Label>
            <div className="space-y-2">
              {formData.objectives.map((objective, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={objective}
                    onChange={(e) => updateObjective(index, e.target.value)}
                    placeholder={`Objetivo ${index + 1}`}
                  />
                  {formData.objectives.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeObjective(index)}
                    >
                      ×
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addObjective}
              >
                + Agregar Objetivo
              </Button>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Guardando...' : scenario ? 'Actualizar' : 'Crear'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ScenarioDialog;
