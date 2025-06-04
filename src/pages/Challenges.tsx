
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Users, Target, Calendar, Filter } from 'lucide-react';
import { useChallenges } from '@/hooks/useChallenges';
import ChallengeCard from '@/components/challenges/ChallengeCard';

const Challenges = () => {
  const { challenges, loading, joinChallenge, leaveChallenge } = useChallenges();
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'individual' | 'team'>('all');

  const handleJoinChallenge = async (challengeId: string) => {
    setActionLoading(challengeId);
    await joinChallenge(challengeId);
    setActionLoading(null);
  };

  const handleLeaveChallenge = async (challengeId: string) => {
    setActionLoading(challengeId);
    await leaveChallenge(challengeId);
    setActionLoading(null);
  };

  const filteredChallenges = challenges.filter(challenge => {
    if (filter === 'all') return true;
    return challenge.challenge_type === filter;
  });

  const activeChallenges = filteredChallenges.filter(c => c.is_participating);
  const availableChallenges = filteredChallenges.filter(c => !c.is_participating);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Desafíos
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Compite con otros usuarios y mejora tus habilidades
            </p>
          </div>
        </div>

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="flex items-center p-6">
              <Target className="h-8 w-8 text-blue-600 mr-4" />
              <div>
                <div className="text-2xl font-bold">{activeChallenges.length}</div>
                <div className="text-sm text-gray-600">Desafíos Activos</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="flex items-center p-6">
              <Trophy className="h-8 w-8 text-yellow-600 mr-4" />
              <div>
                <div className="text-2xl font-bold">{availableChallenges.length}</div>
                <div className="text-sm text-gray-600">Disponibles</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="flex items-center p-6">
              <Users className="h-8 w-8 text-green-600 mr-4" />
              <div>
                <div className="text-2xl font-bold">
                  {challenges.reduce((sum, c) => sum + c.participant_count, 0)}
                </div>
                <div className="text-sm text-gray-600">Total Participantes</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <Filter className="h-5 w-5 mr-2" />
                Filtros
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-2">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('all')}
              >
                Todos
              </Button>
              <Button
                variant={filter === 'individual' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('individual')}
              >
                Individual
              </Button>
              <Button
                variant={filter === 'team' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('team')}
              >
                Equipos
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tabs de desafíos */}
        <Tabs defaultValue="available" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="available">Disponibles ({availableChallenges.length})</TabsTrigger>
            <TabsTrigger value="active">Mis Desafíos ({activeChallenges.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="available" className="space-y-6">
            {availableChallenges.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Trophy className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    No hay desafíos disponibles
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Vuelve pronto para ver nuevos desafíos
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {availableChallenges.map((challenge) => (
                  <ChallengeCard
                    key={challenge.id}
                    challenge={challenge}
                    onJoin={handleJoinChallenge}
                    onLeave={handleLeaveChallenge}
                    loading={actionLoading === challenge.id}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="active" className="space-y-6">
            {activeChallenges.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Target className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    No estás en ningún desafío
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Únete a un desafío para competir y ganar experiencia
                  </p>
                  <Button onClick={() => window.location.reload()}>
                    Ver Desafíos Disponibles
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeChallenges.map((challenge) => (
                  <ChallengeCard
                    key={challenge.id}
                    challenge={challenge}
                    onJoin={handleJoinChallenge}
                    onLeave={handleLeaveChallenge}
                    loading={actionLoading === challenge.id}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Challenges;
