
import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, Play, Download, Phone, MessageSquare, Clock, Star, Users, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import StatCard from '@/components/StatCard';
import { Target, Trophy, BookOpen } from 'lucide-react';

interface TrainingSession {
  id: string;
  title: string;
  scenario: string;
  type: 'conversation' | 'call_simulation' | 'presentation';
  date: string;
  duration: string;
  score: number;
  voice: {
    name: string;
    language: string;
    gender: string;
    age?: string;
  };
  client: {
    name: string;
    personality: string;
    objections: string[];
  };
  metrics: {
    wordsPerMinute: number;
    interruptionCount: number;
    emotionalTone: string;
    keywordsUsed: string[];
    clientSatisfaction: number;
  };
  transcript: {
    messages: Array<{
      speaker: 'user' | 'ai';
      content: string;
      timestamp: string;
      audioUrl?: string;
    }>;
  };
  evaluation: {
    strengths: string[];
    improvements: string[];
    overallRating: number;
    specificFeedback: string;
  };
  tags: string[];
  isStarred: boolean;
}

const History = () => {
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [filteredSessions, setFilteredSessions] = useState<TrainingSession[]>([]);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSession, setSelectedSession] = useState<TrainingSession | null>(null);

  // Sample data - En producción esto vendría del localStorage/Supabase
  const sampleSessions: TrainingSession[] = [
    {
      id: '1',
      title: 'Llamada de Ventas - Cliente Escéptico',
      scenario: 'sales-cold-call',
      type: 'call_simulation',
      date: '2025-01-15',
      duration: '12:34',
      score: 85,
      voice: { name: 'George', language: 'english', gender: 'male', age: 'middle' },
      client: { 
        name: 'George Thompson', 
        personality: 'Cliente ocupado y escéptico',
        objections: ['No tengo tiempo', 'Ya tengo proveedor', 'Es muy caro']
      },
      metrics: {
        wordsPerMinute: 140,
        interruptionCount: 3,
        emotionalTone: 'Profesional',
        keywordsUsed: ['beneficio', 'solución', 'ahorro', 'eficiencia'],
        clientSatisfaction: 7.8
      },
      transcript: {
        messages: [
          { speaker: 'ai', content: '¡Hola! Habla George Thompson. ¿Tengo unos minutos de su tiempo?', timestamp: '00:00' },
          { speaker: 'user', content: 'Buenos días, claro, dígame en qué puedo ayudarle.', timestamp: '00:05' },
          { speaker: 'ai', content: 'No tengo mucho tiempo, pero escucho...', timestamp: '00:10' }
        ]
      },
      evaluation: {
        strengths: ['Excelente apertura', 'Manejo de objeciones efectivo', 'Tono profesional consistente'],
        improvements: ['Podría hacer más preguntas abiertas', 'Mejorar el cierre de la venta'],
        overallRating: 8.5,
        specificFeedback: 'Muy buena gestión de la conversación. El cliente mostró interés gradual.'
      },
      tags: ['ventas', 'llamada-fría', 'objeciones'],
      isStarred: true
    },
    {
      id: '2',
      title: 'Entrevista de Trabajo - Desarrollador Senior',
      scenario: 'recruitment-interview',
      type: 'conversation',
      date: '2025-01-14',
      duration: '18:45',
      score: 92,
      voice: { name: 'Charlotte', language: 'english', gender: 'female', age: 'middle' },
      client: { 
        name: 'Charlotte Williams', 
        personality: 'Entrevistadora profesional y detallista',
        objections: ['Experiencia en tecnologías específicas', 'Trabajo en equipo', 'Liderazgo']
      },
      metrics: {
        wordsPerMinute: 120,
        interruptionCount: 1,
        emotionalTone: 'Confiado',
        keywordsUsed: ['experiencia', 'proyecto', 'equipo', 'liderazgo', 'tecnología'],
        clientSatisfaction: 9.2
      },
      transcript: {
        messages: [
          { speaker: 'ai', content: 'Buenos días, soy Charlotte Williams, gerente de RRHH. Gracias por venir.', timestamp: '00:00' },
          { speaker: 'user', content: 'Buenos días, Charlotte. Es un placer estar aquí.', timestamp: '00:05' }
        ]
      },
      evaluation: {
        strengths: ['Respuestas claras y estructuradas', 'Excelentes ejemplos técnicos', 'Demostró liderazgo'],
        improvements: ['Podría ser más específico en algunos ejemplos'],
        overallRating: 9.2,
        specificFeedback: 'Entrevista excepcional. Candidato muy sólido con gran potencial.'
      },
      tags: ['entrevista', 'rrhh', 'técnico'],
      isStarred: false
    }
  ];

  const globalStats = [
    { title: 'Total de sesiones', value: sessions.length.toString(), icon: BookOpen, color: 'purple' as const },
    { title: 'Puntuación media', value: `${Math.round(sessions.reduce((acc, s) => acc + s.score, 0) / sessions.length || 0)}%`, icon: Target, color: 'blue' as const },
    { title: 'Mejor puntuación', value: `${Math.max(...sessions.map(s => s.score), 0)}%`, icon: Trophy, color: 'green' as const },
    { title: 'Tiempo total', value: calculateTotalTime(sessions), icon: Clock, color: 'orange' as const },
  ];

  function calculateTotalTime(sessions: TrainingSession[]): string {
    const totalMinutes = sessions.reduce((acc, session) => {
      const [minutes, seconds] = session.duration.split(':').map(Number);
      return acc + minutes + (seconds / 60);
    }, 0);
    
    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.round(totalMinutes % 60);
    return `${hours}h ${minutes}min`;
  }

  useEffect(() => {
    // Load sessions from localStorage
    const savedSessions = localStorage.getItem('trainingSessions');
    if (savedSessions) {
      setSessions(JSON.parse(savedSessions));
    } else {
      setSessions(sampleSessions);
      localStorage.setItem('trainingSessions', JSON.stringify(sampleSessions));
    }
  }, []);

  useEffect(() => {
    let filtered = sessions;

    // Apply filters
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(session => {
        switch (selectedFilter) {
          case 'call_simulation': return session.type === 'call_simulation';
          case 'conversation': return session.type === 'conversation';
          case 'presentation': return session.type === 'presentation';
          case 'starred': return session.isStarred;
          case 'high_score': return session.score >= 80;
          default: return true;
        }
      });
    }

    // Apply search
    if (searchTerm) {
      filtered = filtered.filter(session =>
        session.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.scenario.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredSessions(filtered);
  }, [sessions, selectedFilter, searchTerm]);

  const toggleStar = (sessionId: string) => {
    const updatedSessions = sessions.map(session =>
      session.id === sessionId ? { ...session, isStarred: !session.isStarred } : session
    );
    setSessions(updatedSessions);
    localStorage.setItem('trainingSessions', JSON.stringify(updatedSessions));
  };

  const exportSession = (session: TrainingSession) => {
    const dataStr = JSON.stringify(session, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `training_session_${session.id}_${session.date}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Historial de Entrenamiento</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Revisa tus sesiones de entrenamiento, llamadas simuladas y análisis detallados
          </p>
        </div>

        {/* Global Stats */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Estadísticas Globales</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {globalStats.map((stat, index) => (
              <StatCard
                key={index}
                title={stat.title}
                value={stat.value}
                icon={stat.icon}
                color={stat.color}
              />
            ))}
          </div>
        </div>

        <Tabs defaultValue="sessions" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="sessions">Sesiones</TabsTrigger>
            <TabsTrigger value="analytics">Análisis</TabsTrigger>
            <TabsTrigger value="reports">Reportes</TabsTrigger>
          </TabsList>

          <TabsContent value="sessions">
            {/* Filters and Search */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 gap-4">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Buscar sesiones..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-64"
                      />
                    </div>
                    
                    <Select value={selectedFilter} onValueChange={setSelectedFilter}>
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas las sesiones</SelectItem>
                        <SelectItem value="call_simulation">Llamadas simuladas</SelectItem>
                        <SelectItem value="conversation">Conversaciones</SelectItem>
                        <SelectItem value="presentation">Presentaciones</SelectItem>
                        <SelectItem value="starred">Destacadas</SelectItem>
                        <SelectItem value="high_score">Puntuación alta (80+)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Sessions List */}
            <div className="space-y-4">
              {filteredSessions.map((session) => (
                <Card key={session.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {session.title}
                          </h3>
                          <Badge variant={session.type === 'call_simulation' ? 'default' : 'secondary'}>
                            {session.type === 'call_simulation' && <Phone className="h-3 w-3 mr-1" />}
                            {session.type === 'conversation' && <MessageSquare className="h-3 w-3 mr-1" />}
                            {session.type === 'presentation' && <Users className="h-3 w-3 mr-1" />}
                            {session.type === 'call_simulation' ? 'Llamada' : 
                             session.type === 'conversation' ? 'Conversación' : 'Presentación'}
                          </Badge>
                          {session.isStarred && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(session.date).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4" />
                            <span>{session.duration}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Users className="h-4 w-4" />
                            <span>{session.voice.name} ({session.voice.language})</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Target className="h-4 w-4" />
                            <span>Satisfacción: {session.metrics.clientSatisfaction}/10</span>
                          </div>
                        </div>

                        <div className="mt-3 flex flex-wrap gap-2">
                          {session.tags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className={`text-2xl font-bold ${session.score >= 80 ? 'text-green-600' : session.score >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                            {session.score}%
                          </div>
                          <div className="text-sm text-gray-500">Puntuación</div>
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleStar(session.id)}
                          >
                            <Star className={`h-4 w-4 ${session.isStarred ? 'text-yellow-500 fill-current' : ''}`} />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => exportSession(session)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => setSelectedSession(session)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Ver detalles
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {filteredSessions.length === 0 && (
                <Card>
                  <CardContent className="p-12 text-center">
                    <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      No se encontraron sesiones
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      Intenta cambiar los filtros o realiza tu primera sesión de entrenamiento.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Análisis Detallado</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400">
                  Próximamente: Gráficos de progreso, análisis de tendencias y métricas avanzadas.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports">
            <Card>
              <CardHeader>
                <CardTitle>Reportes Personalizados</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400">
                  Próximamente: Generación de reportes personalizados y exportación de datos.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Session Detail Modal */}
        {selectedSession && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{selectedSession.title}</CardTitle>
                  <Button variant="outline" onClick={() => setSelectedSession(null)}>
                    Cerrar
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Session Overview */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{selectedSession.score}%</div>
                    <div className="text-sm text-gray-500">Puntuación</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{selectedSession.duration}</div>
                    <div className="text-sm text-gray-500">Duración</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{selectedSession.metrics.clientSatisfaction}</div>
                    <div className="text-sm text-gray-500">Satisfacción</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">{selectedSession.metrics.wordsPerMinute}</div>
                    <div className="text-sm text-gray-500">Palabras/min</div>
                  </div>
                </div>

                {/* Evaluation */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Evaluación</h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-green-600 mb-2">Fortalezas</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {selectedSession.evaluation.strengths.map((strength, index) => (
                          <li key={index} className="text-sm text-gray-600 dark:text-gray-400">{strength}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-orange-600 mb-2">Áreas de mejora</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {selectedSession.evaluation.improvements.map((improvement, index) => (
                          <li key={index} className="text-sm text-gray-600 dark:text-gray-400">{improvement}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Feedback específico</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{selectedSession.evaluation.specificFeedback}</p>
                    </div>
                  </div>
                </div>

                {/* Transcript Preview */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Transcripción (Primeros mensajes)</h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto border rounded-lg p-4">
                    {selectedSession.transcript.messages.slice(0, 10).map((message, index) => (
                      <div key={index} className={`flex ${message.speaker === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] p-2 rounded-lg text-sm ${
                          message.speaker === 'user' 
                            ? 'bg-purple-100 dark:bg-purple-900 text-purple-900 dark:text-purple-100' 
                            : 'bg-gray-100 dark:bg-gray-800'
                        }`}>
                          <div className="font-medium text-xs mb-1">
                            {message.speaker === 'user' ? 'Usted' : selectedSession.client.name} • {message.timestamp}
                          </div>
                          {message.content}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
