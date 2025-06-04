
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Users, User, Target, Calendar } from 'lucide-react';
import { useTeams } from '@/hooks/useTeams';

interface CreateChallengeDialogProps {
  onCreateChallenge: (challengeData: any) => Promise<void>;
  loading?: boolean;
}

const CreateChallengeDialog = ({ onCreateChallenge, loading = false }: CreateChallengeDialogProps) => {
  const { userTeams } = useTeams();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    challengeType: 'individual' as 'individual' | 'team',
    difficultyLevel: 1,
    targetScore: '',
    objectiveType: 'score',
    objectiveValue: '',
    endDate: '',
    teamId: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await onCreateChallenge({
        title: formData.title,
        description: formData.description,
        challengeType: formData.challengeType,
        difficultyLevel: formData.difficultyLevel,
        targetScore: formData.targetScore ? parseInt(formData.targetScore) : undefined,
        objectiveType: formData.objectiveType,
        objectiveValue: formData.objectiveValue ? parseFloat(formData.objectiveValue) : undefined,
        endDate: formData.endDate || undefined,
        teamId: formData.teamId || undefined
      });

      // Reset form
      setFormData({
        title: '',
        description: '',
        challengeType: 'individual',
        difficultyLevel: 1,
        targetScore: '',
        objectiveType: 'score',
        objectiveValue: '',
        endDate: '',
        teamId: ''
      });
      setOpen(false);
    } catch (error) {
      console.error('Error creating challenge:', error);
    }
  };

  const getDifficultyColor = (level: number) => {
    switch (level) {
      case 1: return 'bg-green-500';
      case 2: return 'bg-yellow-500';
      case 3: return 'bg-orange-500';
      case 4: return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getDifficultyLabel = (level: number) => {
    switch (level) {
      case 1: return 'Fácil';
      case 2: return 'Medio';
      case 3: return 'Difícil';
      case 4: return 'Extremo';
      default: return 'Desconocido';
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Crear Desafío
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crear Desafío Personalizado</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información básica */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Información Básica</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título del Desafío *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Ej: Desafío de Ventas Q1"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe el objetivo y las reglas del desafío..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Configuración del desafío */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Configuración</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tipo de Desafío</Label>
                  <Select
                    value={formData.challengeType}
                    onValueChange={(value: 'individual' | 'team') => 
                      setFormData(prev => ({ ...prev, challengeType: value, teamId: '' }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="individual">
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-2" />
                          Individual
                        </div>
                      </SelectItem>
                      <SelectItem value="team">
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-2" />
                          Equipo
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Dificultad</Label>
                  <Select
                    value={formData.difficultyLevel.toString()}
                    onValueChange={(value) => 
                      setFormData(prev => ({ ...prev, difficultyLevel: parseInt(value) }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4].map((level) => (
                        <SelectItem key={level} value={level.toString()}>
                          <div className="flex items-center">
                            <Badge className={`${getDifficultyColor(level)} text-white mr-2`}>
                              {getDifficultyLabel(level)}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {formData.challengeType === 'team' && userTeams.length > 0 && (
                <div className="space-y-2">
                  <Label>Equipo (opcional)</Label>
                  <Select
                    value={formData.teamId}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, teamId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar equipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Ninguno (abierto a todos)</SelectItem>
                      {userTeams.map((team) => (
                        <SelectItem key={team.id} value={team.id}>
                          {team.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Objetivos y metas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Target className="h-5 w-5 mr-2" />
                Objetivos y Metas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="targetScore">Puntuación Objetivo</Label>
                  <Input
                    id="targetScore"
                    type="number"
                    value={formData.targetScore}
                    onChange={(e) => setFormData(prev => ({ ...prev, targetScore: e.target.value }))}
                    placeholder="Ej: 100"
                    min="1"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="objectiveValue">Valor del Objetivo</Label>
                  <Input
                    id="objectiveValue"
                    type="number"
                    value={formData.objectiveValue}
                    onChange={(e) => setFormData(prev => ({ ...prev, objectiveValue: e.target.value }))}
                    placeholder="Ej: 10"
                    min="1"
                    step="0.1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">Fecha de Finalización</Label>
                <Input
                  id="endDate"
                  type="datetime-local"
                  value={formData.endDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Botones de acción */}
          <div className="flex justify-end space-x-4 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || !formData.title}>
              {loading ? 'Creando...' : 'Crear Desafío'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateChallengeDialog;
