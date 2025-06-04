
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Mic, MicOff, Phone, PhoneOff, Volume2, VolumeX, Pause, Play, Square, MessageCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ChatInterface from './ChatInterface';

interface VoiceTrainingInterfaceProps {
  config: {
    scenarioTitle: string;
    clientEmotion: string;
    interactionMode: 'call' | 'chat';
    selectedVoice?: string;
  };
  onEndSession: (sessionData: any) => void;
}

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

const VoiceTrainingInterface = ({ config, onEndSession }: VoiceTrainingInterfaceProps) => {
  const { toast } = useToast();
  const [sessionActive, setSessionActive] = useState(false);
  const [micActive, setMicActive] = useState(false);
  const [audioMuted, setAudioMuted] = useState(false);
  const [sessionPaused, setSessionPaused] = useState(false);
  const [sessionDuration, setSessionDuration] = useState(0);
  const [messages, setMessages] = useState<Message[]>([]);
  const [aiProcessing, setAiProcessing] = useState(false);
  
  const sessionStartTime = useRef<Date | null>(null);
  const durationInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (sessionActive && !sessionPaused) {
      durationInterval.current = setInterval(() => {
        if (sessionStartTime.current) {
          const elapsed = Math.floor((Date.now() - sessionStartTime.current.getTime()) / 1000);
          setSessionDuration(elapsed);
        }
      }, 1000);
    } else {
      if (durationInterval.current) {
        clearInterval(durationInterval.current);
        durationInterval.current = null;
      }
    }

    return () => {
      if (durationInterval.current) {
        clearInterval(durationInterval.current);
      }
    };
  }, [sessionActive, sessionPaused]);

  const startSession = () => {
    sessionStartTime.current = new Date();
    setSessionActive(true);
    setSessionDuration(0);
    
    // Mensaje inicial del AI
    const initialMessage: Message = {
      id: `ai-${Date.now()}`,
      content: getInitialMessage(),
      sender: 'ai',
      timestamp: new Date()
    };
    setMessages([initialMessage]);

    toast({
      title: "Sesión iniciada",
      description: `Entrenamiento de ${config.scenarioTitle} comenzado`,
    });
  };

  const endSession = () => {
    setSessionActive(false);
    setMicActive(false);
    
    const endTime = new Date();
    const duration = sessionStartTime.current ? 
      Math.floor((endTime.getTime() - sessionStartTime.current.getTime()) / 1000) : 0;

    const sessionData = {
      duration,
      messages,
      scenario: config.scenarioTitle,
      emotion: config.clientEmotion,
      mode: config.interactionMode,
      endedAt: endTime
    };

    onEndSession(sessionData);
    
    toast({
      title: "Sesión finalizada",
      description: `Duración: ${formatDuration(duration)}`,
    });
  };

  const toggleMic = () => {
    if (config.interactionMode === 'call') {
      setMicActive(!micActive);
    }
  };

  const toggleAudio = () => {
    setAudioMuted(!audioMuted);
  };

  const togglePause = () => {
    setSessionPaused(!sessionPaused);
  };

  const sendMessage = async (messageContent: string) => {
    if (!sessionActive || sessionPaused) return;

    // Agregar mensaje del usuario
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content: messageContent,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setAiProcessing(true);

    // Simular respuesta del AI (aquí conectarías con la API real)
    setTimeout(() => {
      const aiResponse: Message = {
        id: `ai-${Date.now()}`,
        content: generateAIResponse(messageContent),
        sender: 'ai',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiResponse]);
      setAiProcessing(false);
    }, 1500);
  };

  const getInitialMessage = () => {
    const emotions = {
      neutral: "Hola, necesito información sobre sus servicios.",
      molesto: "¡Estoy muy molesto! He tenido problemas con mi pedido anterior.",
      escéptico: "No estoy seguro de que esto sea lo que necesito. Convénceme.",
      interesado: "He escuchado cosas buenas sobre ustedes. ¿Pueden ayudarme?",
      urgente: "Necesito una solución urgentemente. ¿Qué pueden ofrecerme?"
    };
    
    return emotions[config.clientEmotion as keyof typeof emotions] || emotions.neutral;
  };

  const generateAIResponse = (userMessage: string): string => {
    // Simulación simple de respuestas del AI
    const responses = [
      "Entiendo su punto. ¿Podría explicarme más detalles?",
      "Eso es interesante. ¿Qué otras opciones han considerado?",
      "Hmm, no estoy completamente convencido. ¿Tienen garantía?",
      "¿Y cuál sería el precio de eso?",
      "Necesito pensarlo un poco más. ¿Pueden enviarme información por escrito?"
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-full space-y-6">
      {/* Header de la sesión */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {config.interactionMode === 'call' ? (
                  <Phone className="h-5 w-5" />
                ) : (
                  <MessageCircle className="h-5 w-5" />
                )}
                {config.scenarioTitle}
              </CardTitle>
              <div className="flex gap-2 mt-2">
                <Badge variant="outline">
                  Emoción: {config.clientEmotion}
                </Badge>
                <Badge variant="outline">
                  Modo: {config.interactionMode === 'call' ? 'Llamada' : 'Chat'}
                </Badge>
                {sessionActive && (
                  <Badge variant="default">
                    Duración: {formatDuration(sessionDuration)}
                  </Badge>
                )}
              </div>
            </div>
            
            {sessionActive && (
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-green-600 font-medium">En vivo</span>
              </div>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Área principal */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Área de conversación */}
        <div className="lg:col-span-3">
          {sessionActive ? (
            config.interactionMode === 'chat' ? (
              <ChatInterface
                messages={messages}
                onSendMessage={sendMessage}
                isLoading={aiProcessing}
                disabled={sessionPaused}
              />
            ) : (
              <Card className="h-full">
                <CardContent className="p-6 h-full flex flex-col justify-center items-center space-y-4">
                  <div className="text-center">
                    <div className="h-32 w-32 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      {micActive ? (
                        <Mic className="h-16 w-16 text-white animate-pulse" />
                      ) : (
                        <MicOff className="h-16 w-16 text-white" />
                      )}
                    </div>
                    <h3 className="text-xl font-semibold mb-2">
                      {sessionPaused ? 'Sesión pausada' : 'Llamada en curso'}
                    </h3>
                    <p className="text-gray-600">
                      {micActive ? 'Hablando...' : 'Toca el micrófono para hablar'}
                    </p>
                  </div>
                  
                  {/* Transcripción en tiempo real */}
                  <div className="w-full max-w-md bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <h4 className="font-medium mb-2">Transcripción:</h4>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {messages.slice(-3).map((msg) => (
                        <div key={msg.id} className={`text-sm ${
                          msg.sender === 'user' ? 'text-blue-600' : 'text-gray-700 dark:text-gray-300'
                        }`}>
                          <span className="font-medium">
                            {msg.sender === 'user' ? 'Tú:' : 'Cliente:'}
                          </span>
                          {' '}{msg.content}
                        </div>
                      ))}
                      {aiProcessing && (
                        <div className="text-sm text-gray-500 italic">
                          Cliente está respondiendo...
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          ) : (
            <Card className="h-full">
              <CardContent className="p-6 h-full flex flex-col justify-center items-center">
                <div className="text-center space-y-4">
                  <div className="h-24 w-24 mx-auto rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    <Play className="h-12 w-12 text-gray-500" />
                  </div>
                  <h3 className="text-xl font-semibold">Listo para comenzar</h3>
                  <p className="text-gray-600">
                    Presiona el botón de inicio para comenzar tu sesión de entrenamiento
                  </p>
                  <Button onClick={startSession} size="lg" className="px-8">
                    <Play className="h-4 w-4 mr-2" />
                    Iniciar Sesión
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Panel de controles */}
        <div className="space-y-4">
          {/* Controles de sesión */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Controles</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {sessionActive ? (
                <>
                  {config.interactionMode === 'call' && (
                    <Button
                      variant={micActive ? "default" : "outline"}
                      onClick={toggleMic}
                      className="w-full"
                      disabled={sessionPaused}
                    >
                      {micActive ? (
                        <>
                          <Mic className="h-4 w-4 mr-2" />
                          Silenciar
                        </>
                      ) : (
                        <>
                          <MicOff className="h-4 w-4 mr-2" />
                          Activar Mic
                        </>
                      )}
                    </Button>
                  )}
                  
                  <Button
                    variant={audioMuted ? "outline" : "default"}
                    onClick={toggleAudio}
                    className="w-full"
                  >
                    {audioMuted ? (
                      <>
                        <VolumeX className="h-4 w-4 mr-2" />
                        Activar Audio
                      </>
                    ) : (
                      <>
                        <Volume2 className="h-4 w-4 mr-2" />
                        Silenciar Audio
                      </>
                    )}
                  </Button>
                  
                  <Button
                    variant={sessionPaused ? "default" : "outline"}
                    onClick={togglePause}
                    className="w-full"
                  >
                    {sessionPaused ? (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Reanudar
                      </>
                    ) : (
                      <>
                        <Pause className="h-4 w-4 mr-2" />
                        Pausar
                      </>
                    )}
                  </Button>
                  
                  <Button
                    variant="destructive"
                    onClick={endSession}
                    className="w-full"
                  >
                    <Square className="h-4 w-4 mr-2" />
                    Finalizar
                  </Button>
                </>
              ) : (
                <Button onClick={startSession} className="w-full">
                  <Play className="h-4 w-4 mr-2" />
                  Iniciar
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Progreso de la sesión */}
          {sessionActive && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Progreso</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Tiempo transcurrido</span>
                    <span>{formatDuration(sessionDuration)}</span>
                  </div>
                  <Progress value={Math.min((sessionDuration / 1800) * 100, 100)} />
                  <p className="text-xs text-gray-500 mt-1">
                    Duración recomendada: 30 min
                  </p>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Intercambios</span>
                    <span>{Math.floor(messages.length / 2)}</span>
                  </div>
                  <Progress value={Math.min((messages.length / 20) * 100, 100)} />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Información del escenario */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Información</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div>
                <span className="font-medium">Escenario:</span>
                <p className="text-gray-600">{config.scenarioTitle}</p>
              </div>
              <div>
                <span className="font-medium">Cliente:</span>
                <p className="text-gray-600 capitalize">{config.clientEmotion}</p>
              </div>
              {config.selectedVoice && (
                <div>
                  <span className="font-medium">Voz:</span>
                  <p className="text-gray-600">{config.selectedVoice}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default VoiceTrainingInterface;
