
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Mic, MicOff, Phone, PhoneOff, MessageCircle, Volume2, VolumeX, Pause, Play, Square } from 'lucide-react';
import { useSessionManager } from './SessionManager';
import { useToast } from '@/hooks/use-toast';

interface TrainingConfig {
  scenarioTitle: string;
  scenarioDescription: string;
  clientEmotion: string;
  interactionMode: 'call' | 'chat';
  selectedVoice?: string;
  difficulty: string;
  duration: number;
  objectives: string[];
}

interface VoiceTrainingInterfaceProps {
  config: TrainingConfig;
  onEndSession: (sessionData: any) => void;
}

const VoiceTrainingInterface = ({ config, onEndSession }: VoiceTrainingInterfaceProps) => {
  const [isActive, setIsActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [messages, setMessages] = useState<any[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [sessionStarted, setSessionStarted] = useState(false);

  const sessionManager = useSessionManager();
  const { toast } = useToast();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && !isPaused) {
      interval = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, isPaused]);

  const handleStartSession = async () => {
    try {
      const sessionId = await sessionManager.startSession({
        scenario: config.scenarioTitle,
        scenarioTitle: config.scenarioTitle,
        clientEmotion: config.clientEmotion,
        interactionMode: config.interactionMode,
        selectedVoice: config.selectedVoice
      });

      if (sessionId) {
        setIsActive(true);
        setSessionStarted(true);
        
        const initialMessage = {
          id: Date.now(),
          sender: 'client',
          content: getInitialClientMessage(),
          timestamp: Date.now()
        };
        
        setMessages([initialMessage]);
        await sessionManager.saveMessage(
          initialMessage.content,
          'ai',
          Math.floor(initialMessage.timestamp / 1000)
        );

        toast({
          title: "Sesión iniciada",
          description: "¡La conversación ha comenzado!",
        });
      }
    } catch (error) {
      console.error('Error starting session:', error);
      toast({
        title: "Error",
        description: "No se pudo iniciar la sesión",
        variant: "destructive",
      });
    }
  };

  const getInitialClientMessage = () => {
    const emotionMessages = {
      neutral: "Hola, me gustaría obtener información sobre sus servicios.",
      molesto: "Tengo un problema muy grave que necesita resolverse inmediatamente.",
      escéptico: "He escuchado sobre ustedes, pero no estoy seguro si realmente pueden ayudarme.",
      interesado: "¡Hola! Estoy muy emocionado de conocer más sobre lo que ofrecen.",
      urgente: "Necesito una solución rápida, tengo muy poco tiempo disponible."
    };
    return emotionMessages[config.clientEmotion as keyof typeof emotionMessages] || emotionMessages.neutral;
  };

  const handleEndSession = async () => {
    try {
      const sessionData = {
        duration: Math.floor(elapsedTime / 60),
        messages: messages,
        scenario: config.scenarioTitle
      };

      await sessionManager.endSession(sessionData);
      onEndSession(sessionData);
      
      toast({
        title: "Sesión finalizada",
        description: "Tu entrenamiento ha sido guardado exitosamente",
      });
    } catch (error) {
      console.error('Error ending session:', error);
      toast({
        title: "Error",
        description: "Hubo un problema al finalizar la sesión",
        variant: "destructive",
      });
    }
  };

  const handleToggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleTogglePause = () => {
    setIsPaused(!isPaused);
  };

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || !sessionStarted) return;

    const userMessage = {
      id: Date.now(),
      sender: 'user',
      content: content.trim(),
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    await sessionManager.saveMessage(
      userMessage.content,
      'user',
      Math.floor(userMessage.timestamp / 1000)
    );

    // Simular respuesta del cliente AI
    setTimeout(async () => {
      const aiResponse = generateAIResponse(content);
      const aiMessage = {
        id: Date.now() + 1,
        sender: 'client',
        content: aiResponse,
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, aiMessage]);
      await sessionManager.saveMessage(
        aiMessage.content,
        'ai',
        Math.floor(aiMessage.timestamp / 1000)
      );
    }, 1500);

    setCurrentMessage('');
  };

  const generateAIResponse = (userMessage: string): string => {
    const responses = [
      "Entiendo su situación. ¿Podría proporcionarme más detalles?",
      "Esa es una excelente pregunta. Permítame explicarle...",
      "Comprendo su preocupación. Esto es lo que podemos hacer por usted...",
      "Me parece perfecto. ¿Hay algo más específico que le gustaría saber?",
      "Excelente punto. Basándome en lo que me dice..."
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = (elapsedTime / (config.duration * 60)) * 100;

  return (
    <div className="space-y-6">
      {/* Header de la sesión */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                {config.interactionMode === 'call' ? (
                  <Phone className="h-5 w-5 mr-2" />
                ) : (
                  <MessageCircle className="h-5 w-5 mr-2" />
                )}
                {config.scenarioTitle}
              </CardTitle>
              <p className="text-gray-600 mt-1">{config.scenarioDescription}</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{formatTime(elapsedTime)}</div>
              <div className="text-sm text-gray-600">
                {config.duration} min programados
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Progreso de la sesión</span>
                <span>{Math.min(100, Math.round(progress))}%</span>
              </div>
              <Progress value={Math.min(100, progress)} className="h-2" />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="font-medium">Cliente:</span>
                <Badge variant="outline" className="ml-2 capitalize">
                  {config.clientEmotion}
                </Badge>
              </div>
              <div>
                <span className="font-medium">Modo:</span>
                <span className="ml-2">
                  {config.interactionMode === 'call' ? 'Llamada' : 'Chat'}
                </span>
              </div>
              {config.selectedVoice && (
                <div>
                  <span className="font-medium">Voz:</span>
                  <span className="ml-2 capitalize">{config.selectedVoice}</span>
                </div>
              )}
              <div>
                <span className="font-medium">Dificultad:</span>
                <span className="ml-2 capitalize">{config.difficulty}</span>
              </div>
            </div>

            <div>
              <span className="font-medium text-sm">Objetivos:</span>
              <div className="flex flex-wrap gap-2 mt-2">
                {config.objectives.map((objective, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {objective}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Área de conversación */}
      <Card className="min-h-[400px]">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Conversación en Tiempo Real</span>
            <div className="flex items-center space-x-2">
              {isActive && (
                <Badge variant={isPaused ? "secondary" : "default"}>
                  {isPaused ? "Pausado" : "En vivo"}
                </Badge>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!isActive ? (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">¿Listo para comenzar?</h3>
                <p className="text-gray-600 mb-4">
                  La sesión iniciará cuando presiones el botón de comenzar
                </p>
              </div>
              <Button onClick={handleStartSession} size="lg">
                {config.interactionMode === 'call' ? (
                  <Phone className="h-4 w-4 mr-2" />
                ) : (
                  <MessageCircle className="h-4 w-4 mr-2" />
                )}
                Comenzar Sesión
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="h-64 overflow-y-auto border rounded p-4 space-y-3">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs p-3 rounded-lg ${
                        message.sender === 'user'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 text-gray-900'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <span className="text-xs opacity-70">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {config.interactionMode === 'chat' && (
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(currentMessage)}
                    placeholder="Escribe tu mensaje..."
                    className="flex-1 px-3 py-2 border rounded-lg"
                    disabled={isPaused}
                  />
                  <Button
                    onClick={() => handleSendMessage(currentMessage)}
                    disabled={!currentMessage.trim() || isPaused}
                  >
                    Enviar
                  </Button>
                </div>
              )}

              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="flex items-center text-sm text-blue-700">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse mr-2"></div>
                  {config.interactionMode === 'call' 
                    ? "Conversación activa (funcionalidad de voz se implementará con ElevenLabs)"
                    : "Chat activo"
                  }
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Controles de la sesión */}
      {isActive && (
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-center space-x-4">
              <Button
                variant="outline"
                onClick={handleToggleMute}
                className={isMuted ? "text-red-600" : ""}
              >
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                {isMuted ? "Activar audio" : "Silenciar"}
              </Button>

              <Button
                variant="outline"
                onClick={handleTogglePause}
              >
                {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                {isPaused ? "Reanudar" : "Pausar"}
              </Button>

              <Button
                variant="destructive"
                onClick={handleEndSession}
              >
                <Square className="h-4 w-4 mr-2" />
                Finalizar Sesión
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default VoiceTrainingInterface;
