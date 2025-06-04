
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, Download, Calendar, Clock, MessageSquare, TrendingUp } from 'lucide-react';
import { useSessionManager } from './SessionManager';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface SessionHistoryProps {
  onViewSession?: (sessionId: string) => void;
}

const SessionHistory = ({ onViewSession }: SessionHistoryProps) => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState(null);
  const [sessionDetails, setSessionDetails] = useState(null);
  const sessionManager = useSessionManager();

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    setLoading(true);
    try {
      const userSessions = await sessionManager.getUserSessions(50);
      setSessions(userSessions);
    } catch (error) {
      console.error('Error loading sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSessionDetails = async (sessionId: string) => {
    try {
      const [messages, evaluation] = await Promise.all([
        sessionManager.getSessionMessages(sessionId),
        sessionManager.getSessionEvaluation(sessionId)
      ]);

      setSessionDetails({
        messages,
        evaluation
      });
    } catch (error) {
      console.error('Error loading session details:', error);
    }
  };

  const handleViewSession = async (session: any) => {
    setSelectedSession(session);
    await loadSessionDetails(session.id);
    if (onViewSession) {
      onViewSession(session.id);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-700">Completada</Badge>;
      case 'in_progress':
        return <Badge className="bg-blue-100 text-blue-700">En Progreso</Badge>;
      case 'paused':
        return <Badge className="bg-orange-100 text-orange-700">Pausada</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return <Badge className="bg-green-100 text-green-700">{score}%</Badge>;
    if (score >= 60) return <Badge className="bg-yellow-100 text-yellow-700">{score}%</Badge>;
    return <Badge className="bg-red-100 text-red-700">{score}%</Badge>;
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const exportSessionData = (session: any) => {
    const data = {
      session,
      details: sessionDetails
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `session-${session.id}-${format(new Date(session.created_at), 'yyyy-MM-dd')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Historial de Sesiones</h2>
        <Button onClick={loadSessions} variant="outline">
          Actualizar
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="details">Detalles</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {sessions.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-gray-500 dark:text-gray-400">
                  No hay sesiones de entrenamiento registradas aún.
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {sessions.map((session: any) => (
                <Card key={session.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-3">
                          <h3 className="font-semibold">{session.scenario_title}</h3>
                          {getStatusBadge(session.session_status)}
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>{format(new Date(session.created_at), 'dd/MM/yyyy HH:mm', { locale: es })}</span>
                          </div>
                          
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>{formatDuration(session.duration_seconds)}</span>
                          </div>
                          
                          <div className="flex items-center space-x-1">
                            <MessageSquare className="h-4 w-4" />
                            <span>{session.total_messages} mensajes</span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-4 text-sm">
                          <span>Cliente: <strong>{session.client_emotion}</strong></span>
                          <span>Modo: <strong>{session.interaction_mode === 'call' ? 'Llamada' : 'Chat'}</strong></span>
                          {session.voice_used && (
                            <span>Voz: <strong>{session.voice_used}</strong></span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewSession(session)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Ver
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => exportSessionData(session)}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Exportar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="details" className="space-y-4">
          {selectedSession ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Información de la sesión */}
              <Card>
                <CardHeader>
                  <CardTitle>Información de la Sesión</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <strong>Escenario:</strong> {selectedSession.scenario_title}
                  </div>
                  <div>
                    <strong>Fecha:</strong> {format(new Date(selectedSession.created_at), 'dd/MM/yyyy HH:mm', { locale: es })}
                  </div>
                  <div>
                    <strong>Duración:</strong> {formatDuration(selectedSession.duration_seconds)}
                  </div>
                  <div>
                    <strong>Total mensajes:</strong> {selectedSession.total_messages}
                  </div>
                  <div>
                    <strong>Palabras del usuario:</strong> {selectedSession.user_words_count}
                  </div>
                  <div>
                    <strong>Palabras de la IA:</strong> {selectedSession.ai_words_count}
                  </div>
                </CardContent>
              </Card>

              {/* Evaluación */}
              {sessionDetails?.evaluation && (
                <Card>
                  <CardHeader>
                    <CardTitle>Evaluación</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">Rapport:</span>
                        {getScoreBadge(sessionDetails.evaluation.rapport_score)}
                      </div>
                      <div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">Claridad:</span>
                        {getScoreBadge(sessionDetails.evaluation.clarity_score)}
                      </div>
                      <div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">Empatía:</span>
                        {getScoreBadge(sessionDetails.evaluation.empathy_score)}
                      </div>
                      <div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">Precisión:</span>
                        {getScoreBadge(sessionDetails.evaluation.accuracy_score)}
                      </div>
                    </div>
                    
                    <div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">Puntuación General:</span>
                      <div className="mt-1">
                        {getScoreBadge(sessionDetails.evaluation.overall_score)}
                      </div>
                    </div>

                    {sessionDetails.evaluation.specific_feedback && (
                      <div>
                        <strong>Feedback:</strong>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {sessionDetails.evaluation.specific_feedback}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Transcripción */}
              {sessionDetails?.messages && (
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Transcripción Completa</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {sessionDetails.messages.map((message: any, index: number) => (
                        <div key={message.id} className={`p-3 rounded-lg ${
                          message.sender === 'user' 
                            ? 'bg-blue-50 dark:bg-blue-900/20 ml-12' 
                            : 'bg-gray-50 dark:bg-gray-800 mr-12'
                        }`}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium">
                              {message.sender === 'user' ? 'Usuario' : 'Cliente IA'}
                            </span>
                            <span className="text-xs text-gray-500">
                              {Math.floor(message.timestamp_in_session / 60)}:{(message.timestamp_in_session % 60).toString().padStart(2, '0')}
                            </span>
                          </div>
                          <p className="text-sm">{message.content}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-gray-500 dark:text-gray-400">
                  Selecciona una sesión para ver los detalles completos.
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SessionHistory;
