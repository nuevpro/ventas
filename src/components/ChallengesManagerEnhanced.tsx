
import React, { useState } from 'react';
import { Trophy, Users, User, Calendar, Target, Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useChallengesData } from '@/hooks/useChallengesData';

const CHALLENGE_TYPES = [
  { value: 'individual', label: 'Individual', icon: User },
  { value: 'team', label: 'Equipo', icon: Users },
];

const DIFFICULTY_LEVELS = [
  { value: 1, label: 'Principiante', color: 'bg-green-500' },
  { value: 2, label: 'Intermedio', color: 'bg-yellow-500' },
  { value: 3, label: 'Avanzado', color: 'bg-red-500' },
];

const ChallengesManagerEnhanced = () => {
  const { challenges, loading, createChallenge } = useChallengesData();
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [newChallenge, setNewChallenge] = useState({
    title: '',
    description: '',
    challenge_type: 'individual',
    difficulty_level: 1,
    target_score: 80,
    end_date: '',
  });

  const handleCreateChallenge = async () => {
    if (!newChallenge.title.trim() || !newChallenge.description.trim()) {
      return;
    }

    try {
      await createChallenge({
        title: newChallenge.title,
        description: newChallenge.description,
        challenge_type: newChallenge.challenge_type,
        difficulty_level: newChallenge.difficulty_level,
        target_score: newChallenge.target_score,
        end_date: newChallenge.end_date || undefined,
      });

      setNewChallenge({
        title: '',
        description: '',
        challenge_type: 'individual',
        difficulty_level: 1,
        target_score: 80,
        end_date: '',
      });
      setIsCreating(false);
    } catch (error) {
      // Error handled in hook
    }
  };

  const filteredChallenges = challenges.filter(challenge => {
    const matchesSearch = challenge.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         challenge.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || challenge.challenge_type === selectedType;
    return matchesSearch && matchesType;
  });

  const getDifficultyInfo = (level: number) => {
    return DIFFICULTY_LEVELS.find(d => d.value === level) || DIFFICULTY_LEVELS[0];
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p>Cargando desafíos...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Trophy className="h-5 w-5" />
              <span>Gestión de Desafíos</span>
            </div>
            <Button onClick={() => setIsCreating(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Desafío
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and Filter */}
          <div className="flex space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar desafíos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Todos los tipos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                {CHALLENGE_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{challenges.length}</div>
              <div className="text-sm text-gray-600">Total Desafíos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {challenges.filter(c => c.challenge_type === 'individual').length}
              </div>
              <div className="text-sm text-gray-600">Individuales</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {challenges.filter(c => c.challenge_type === 'team').length}
              </div>
              <div className="text-sm text-gray-600">De Equipo</div>
            </div>
          </div>

          {/* Challenges List */}
          <div className="space-y-3">
            {filteredChallenges.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No se encontraron desafíos</p>
              </div>
            ) : (
              filteredChallenges.map((challenge) => {
                const difficultyInfo = getDifficultyInfo(challenge.difficulty_level || 1);
                const TypeIcon = CHALLENGE_TYPES.find(t => t.value === challenge.challenge_type)?.icon || User;
                
                return (
                  <Card key={challenge.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <TypeIcon className="h-5 w-5 text-purple-600" />
                            <div>
                              <h3 className="font-medium">{challenge.title}</h3>
                              <p className="text-sm text-gray-600 line-clamp-2">
                                {challenge.description}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4 mt-3">
                            <Badge variant="outline">
                              {CHALLENGE_TYPES.find(t => t.value === challenge.challenge_type)?.label}
                            </Badge>
                            <div className="flex items-center space-x-1">
                              <div className={`w-2 h-2 rounded-full ${difficultyInfo.color}`} />
                              <span className="text-xs text-gray-500">{difficultyInfo.label}</span>
                            </div>
                            {challenge.target_score && (
                              <div className="flex items-center space-x-1">
                                <Target className="h-3 w-3 text-gray-400" />
                                <span className="text-xs text-gray-500">Meta: {challenge.target_score}%</span>
                              </div>
                            )}
                            {challenge.end_date && (
                              <div className="flex items-center space-x-1">
                                <Calendar className="h-3 w-3 text-gray-400" />
                                <span className="text-xs text-gray-500">
                                  Hasta: {new Date(challenge.end_date).toLocaleDateString()}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Create Challenge Dialog */}
      <Dialog open={isCreating} onOpenChange={setIsCreating}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Crear Nuevo Desafío</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Título</Label>
              <Input
                value={newChallenge.title}
                onChange={(e) => setNewChallenge(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Título del desafío..."
              />
            </div>

            <div className="space-y-2">
              <Label>Descripción</Label>
              <Textarea
                value={newChallenge.description}
                onChange={(e) => setNewChallenge(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descripción del desafío..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select 
                  value={newChallenge.challenge_type} 
                  onValueChange={(value) => setNewChallenge(prev => ({ ...prev, challenge_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CHALLENGE_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Dificultad</Label>
                <Select 
                  value={newChallenge.difficulty_level.toString()} 
                  onValueChange={(value) => setNewChallenge(prev => ({ ...prev, difficulty_level: parseInt(value) }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DIFFICULTY_LEVELS.map((level) => (
                      <SelectItem key={level.value} value={level.value.toString()}>
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Puntuación Objetivo (%)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={newChallenge.target_score}
                  onChange={(e) => setNewChallenge(prev => ({ ...prev, target_score: parseInt(e.target.value) || 80 }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Fecha Límite (opcional)</Label>
                <Input
                  type="date"
                  value={newChallenge.end_date}
                  onChange={(e) => setNewChallenge(prev => ({ ...prev, end_date: e.target.value }))}
                />
              </div>
            </div>

            <div className="flex space-x-2 justify-end">
              <Button variant="outline" onClick={() => setIsCreating(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateChallenge}>
                Crear Desafío
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ChallengesManagerEnhanced;
