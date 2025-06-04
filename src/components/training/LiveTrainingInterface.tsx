import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mic, MicOff, Volume2, VolumeX, Phone, PhoneOff, Pause, Play } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import ConversationTranscript from './ConversationTranscript';
import RealTimeEvaluation from './RealTimeEvaluation';
import { useSessionManager } from './SessionManager';

interface LiveTrainingInterfaceProps {
  config: any;
  onComplete: (evaluation: any) => void;
  onBack: () => void;
}

interface RealTimeMetrics {
  rapport: number;
  clarity: number;
  empathy: number;
  accuracy: number;
  responseTime: number;
  overallScore: number;
  trend: 'up' | 'down' | 'stable';
  criticalIssues: string[];
  positivePoints: string[];
  suggestions: string[];
}

const LiveTrainingInterface = ({ config, onComplete, onBack }: LiveTrainingInterfaceProps) => {
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [messages, setMessages] = useState([]);
  const [currentUserText, setCurrentUserText] = useState('');
  const [sessionTime, setSessionTime] = useState(0);
  const [callStatus, setCallStatus] = useState('connecting');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [realTimeMetrics, setRealTimeMetrics] = useState<RealTimeMetrics>({
    rapport: 75,
    clarity: 80,
    empathy: 70,
    accuracy: 85,
    responseTime: 2.1,
    overallScore: 77,
    trend: 'stable',
    criticalIssues: [],
    positivePoints: ['Tono profesional', 'Información precisa'],
    suggestions: []
  });

  const { toast } = useToast();
  const sessionManager = useSessionManager();
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const sessionStartRef = useRef<Date | null>(null);
  const recognitionRef = useRef<any>(null);
  const pauseStartRef = useRef<Date | null>(null);
  const totalPauseTimeRef = useRef<number>(0);

  useEffect(() => {
    if (isActive && !isPaused) {
      if (!sessionStartRef.current) {
        sessionStartRef.current = new Date();
      }
      
      const timer = setInterval(() => {
        if (sessionStartRef.current && !isPaused) {
          const elapsed = Math.floor((Date.now() - sessionStartRef.current.getTime()) / 1000);
          setSessionTime(elapsed - totalPauseTimeRef.current);
        }
      }, 1000);
      
      if (!sessionId) {
        initializeSession();
      }
      
      return () => clearInterval(timer);
    }
  }, [isActive, isPaused]);

  // Configurar reconocimiento de voz continuo
  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      recognitionRef.current = new (window as any).webkitSpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'es-ES';

      recognitionRef.current.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        setCurrentUserText(interimTranscript);
        
        if (finalTranscript) {
          handleUserMessage(finalTranscript.trim());
          setCurrentUserText('');
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
      };
    }
  }, []);

  const initializeSession = async () => {
    // Crear sesión en la base de datos
    const newSessionId = await sessionManager.startSession(config);
    if (newSessionId) {
      setSessionId(newSessionId);
    }

    if (config.interactionMode === 'call') {
      setCallStatus('ringing');
      
      setTimeout(() => {
        setCallStatus('connected');
        toast({
          title: "Llamada conectada",
          description: "El cliente virtual está en línea",
        });
        
        setTimeout(() => {
          sendInitialGreeting();
        }, 1000);
      }, 3000);
    } else {
      setCallStatus('connected');
      sendInitialGreeting();
    }
  };

  const sendInitialGreeting = async () => {
    setIsSpeaking(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('ai-conversation', {
        body: {
          message: "INICIO_SESION",
          scenario: config.scenario,
          clientEmotion: config.clientEmotion,
          interactionMode: config.interactionMode,
          isInitial: true
        },
      });

      if (error) throw error;

      const aiMessage = {
        id: Date.now().toString(),
        content: data.response,
        sender: 'ai',
        timestamp: new Date(),
      };

      setMessages([aiMessage]);

      // Guardar mensaje en la base de datos
      await sessionManager.saveMessage(
        data.response, 
        'ai', 
        sessionTime,
        undefined
      );

      if (audioEnabled && config.interactionMode === 'call') {
        await generateAndPlayAudio(data.response, data.voice);
      } else {
        setIsSpeaking(false);
      }

      // Iniciar reconocimiento de voz continuo
      if (config.interactionMode === 'call' && recognitionRef.current) {
        recognitionRef.current.start();
        setIsListening(true);
      }

    } catch (error) {
      console.error('Error initializing session:', error);
      setIsSpeaking(false);
    }
  };

  const generateAndPlayAudio = async (text: string, voice: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: { 
          text, 
          voice: voice || 'Sarah',
          model: 'eleven_multilingual_v2'
        },
      });

      if (!error && data.audioContent) {
        const audioUrl = `data:audio/mpeg;base64,${data.audioContent}`;
        const audio = new Audio(audioUrl);
        
        audio.onplay = () => setIsSpeaking(true);
        audio.onended = () => setIsSpeaking(false);
        
        await audio.play();
      }
    } catch (error) {
      console.error('Error generating audio:', error);
      setIsSpeaking(false);
    }
  };

  const handleUserMessage = async (content: string) => {
    const userMessage = {
      id: Date.now().toString(),
      content,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);

    // Guardar mensaje del usuario
    await sessionManager.saveMessage(content, 'user', sessionTime);

    setIsSpeaking(true);

    try {
      const { data, error } = await supabase.functions.invoke('ai-conversation', {
        body: {
          message: content,
          scenario: config.scenario,
          clientEmotion: config.clientEmotion,
          conversationHistory: messages.slice(-5),
        },
      });

      if (error) throw error;

      const aiMessage = {
        id: (Date.now() + 1).toString(),
        content: data.response,
        sender: 'ai',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);

      // Guardar mensaje de la IA
      await sessionManager.saveMessage(data.response, 'ai', sessionTime);

      // Actualizar métricas en tiempo real
      updateRealTimeMetrics(content, data.response);

      if (audioEnabled && config.interactionMode === 'call') {
        await generateAndPlayAudio(data.response, data.voice);
      } else {
        setIsSpeaking(false);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setIsSpeaking(false);
    }
  };

  const updateRealTimeMetrics = async (userMessage: string, aiResponse: string) => {
    const messageCount = messages.length / 2;
    const baseScore = 75;
    const variation = Math.random() * 10 - 5;
    
    const newMetrics = {
      ...realTimeMetrics,
      overallScore: Math.max(0, Math.min(100, baseScore + variation + messageCount)),
      rapport: Math.max(0, Math.min(100, realTimeMetrics.rapport + (Math.random() * 6 - 3))),
      clarity: Math.max(0, Math.min(100, realTimeMetrics.clarity + (Math.random() * 4 - 2))),
      empathy: Math.max(0, Math.min(100, realTimeMetrics.empathy + (Math.random() * 8 - 4))),
      accuracy: Math.max(0, Math.min(100, realTimeMetrics.accuracy + (Math.random() * 6 - 3))),
      trend: (Math.random() > 0.6 ? 'up' : Math.random() > 0.3 ? 'stable' : 'down') as 'up' | 'down' | 'stable'
    };

    setRealTimeMetrics(newMetrics);

    // Guardar métricas en la base de datos
    await sessionManager.saveRealTimeMetric('overall_score', newMetrics.overallScore);
    await sessionManager.saveRealTimeMetric('rapport', newMetrics.rapport);
    await sessionManager.saveRealTimeMetric('clarity', newMetrics.clarity);
    await sessionManager.saveRealTimeMetric('empathy', newMetrics.empathy);
    await sessionManager.saveRealTimeMetric('accuracy', newMetrics.accuracy);
  };

  const togglePause = () => {
    if (isPaused) {
      // Reanudar
      if (pauseStartRef.current) {
        totalPauseTimeRef.current += Math.floor((Date.now() - pauseStartRef.current.getTime()) / 1000);
        pauseStartRef.current = null;
      }
      
      if (recognitionRef.current && config.interactionMode === 'call') {
        recognitionRef.current.start();
        setIsListening(true);
      }
      
      setIsPaused(false);
      toast({
        title: "Sesión reanudada",
        description: "La conversación continúa",
      });
    } else {
      // Pausar
      pauseStartRef.current = new Date();
      
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        setIsListening(false);
      }
      
      setIsPaused(true);
      toast({
        title: "Sesión pausada",
        description: "La conversación está en pausa",
      });
    }
  };

  const toggleMicrophone = () => {
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else if (recognitionRef.current) {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const endSession = async () => {
    setIsActive(false);
    setCallStatus('ended');
    
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    
    if (messages.length >= 4) {
      await evaluateSession();
    } else {
      toast({
        title: "Sesión muy corta",
        description: "Continúa la conversación para obtener una evaluación completa",
      });
    }
  };

  const evaluateSession = async () => {
    const conversationText = messages
      .map(m => `${m.sender === 'user' ? 'Usuario' : 'Cliente'}: ${m.content}`)
      .join('\n');

    try {
      const { data, error } = await supabase.functions.invoke('evaluate-response', {
        body: {
          userResponse: conversationText,
          scenario: config.scenario,
          clientEmotion: config.clientEmotion,
          sessionDuration: sessionTime,
        },
      });

      if (error) throw error;

      const evaluation = {
        ...data,
        realTimeMetrics,
        transcript: messages,
        sessionDuration: sessionTime
      };

      // Guardar evaluación y finalizar sesión
      await sessionManager.endSession(evaluation);
      
      onComplete(evaluation);
    } catch (error) {
      console.error('Error evaluating session:', error);
    }
  };

  const requestFeedback = async () => {
    try {
      const recentMessages = messages.slice(-4);
      const { data, error } = await supabase.functions.invoke('ai-conversation', {
        body: {
          message: "Dame feedback sobre mi desempeño hasta ahora",
          scenario: config.scenario,
          conversationHistory: recentMessages,
          requestType: 'feedback'
        },
      });

      if (error) throw error;

      const feedbackMessage = {
        id: Date.now().toString(),
        content: `[FEEDBACK] ${data.response}`,
        sender: 'ai',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, feedbackMessage]);

      if (audioEnabled && config.interactionMode === 'call') {
        await generateAndPlayAudio(data.response, data.voice);
      }
    } catch (error) {
      console.error('Error requesting feedback:', error);
    }
  };

  if (!isActive) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        <div className="lg:col-span-2 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardContent className="p-6 text-center">
              <div className="mb-4">
                <Phone className="h-12 w-12 mx-auto text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">¿Listo para comenzar?</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Vas a entrenar con un cliente virtual usando la voz {config.selectedVoiceName || 'predeterminada'}
              </p>
              <Button onClick={() => setIsActive(true)} className="w-full" size="lg">
                Iniciar {config.interactionMode === 'call' ? 'Llamada' : 'Chat'}
              </Button>
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <h4 className="font-medium mb-2">Configuración</h4>
              <div className="space-y-2 text-sm">
                <div>Escenario: {config.scenario}</div>
                <div>Cliente: {config.clientEmotion}</div>
                <div>Modo: {config.interactionMode}</div>
                <div>Voz: {config.selectedVoiceName || 'Predeterminada'}</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[700px]">
      {/* Área principal de conversación */}
      <div className="lg:col-span-2 space-y-4">
        {/* Header de sesión mejorado */}
        <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="flex items-center space-x-4">
            <Badge className={`${
              isPaused ? 'bg-orange-100 text-orange-700' :
              callStatus === 'connected' ? 'bg-green-100 text-green-700 animate-pulse' :
              callStatus === 'ringing' ? 'bg-yellow-100 text-yellow-700 animate-pulse' :
              'bg-gray-100 text-gray-700'
            }`}>
              {isPaused && '⏸️ PAUSADO'}
              {!isPaused && callStatus === 'connected' && '🔴 EN VIVO'}
              {callStatus === 'ringing' && '📞 CONECTANDO'}
              {callStatus === 'connecting' && '⏳ INICIANDO'}
            </Badge>
            <div className="text-sm">
              <div><strong>Duración:</strong> {Math.floor(sessionTime / 60)}:{(sessionTime % 60).toString().padStart(2, '0')}</div>
              <div><strong>Mensajes:</strong> {messages.length}</div>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={togglePause}
              className={isPaused ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}
            >
              {isPaused ? (
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

            {config.interactionMode === 'call' && (
              <Button
                variant="outline"
                size="sm"
                onClick={toggleMicrophone}
                disabled={isPaused}
                className={isListening ? 'bg-red-50 text-red-600' : ''}
              >
                {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAudioEnabled(!audioEnabled)}
              disabled={isPaused}
            >
              {audioEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </Button>
            
            <Button variant="destructive" size="sm" onClick={endSession}>
              <PhoneOff className="h-4 w-4 mr-2" />
              Finalizar
            </Button>
          </div>
        </div>

        {/* Área de conversación */}
        <div className="flex-1">
          {config.interactionMode === 'call' ? (
            <Card className="h-[500px] flex flex-col">
              <CardContent className="flex-1 p-6">
                <div className="h-full flex flex-col items-center justify-center space-y-6">
                  <div className="text-center">
                    <div className="text-xl font-medium mb-2">
                      {isPaused ? 'Sesión Pausada' : 'Cliente Virtual Activo'}
                    </div>
                    <div className="text-gray-600 dark:text-gray-400">
                      {isPaused ? "Presiona Reanudar para continuar" :
                       isSpeaking ? "El cliente está hablando..." : 
                       isListening ? "Puedes responder ahora..." : 
                       "Conversación en pausa"}
                    </div>
                  </div>

                  {/* Animación de ondas de audio mejorada */}
                  <div className="flex items-center justify-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-2 rounded-full transition-all duration-300 ${
                          isPaused ? 'bg-orange-400 h-4' :
                          isSpeaking ? 'bg-purple-600 h-12 animate-pulse' : 
                          isListening ? 'bg-green-600 h-8 animate-bounce' : 
                          'bg-gray-400 h-4'
                        }`}
                        style={{ animationDelay: `${i * 0.1}s` }}
                      />
                    ))}
                  </div>

                  {!isPaused && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-center max-w-md">
                      <div className="text-blue-600 dark:text-blue-400 text-sm mb-2">
                        💡 Comandos útiles:
                      </div>
                      <div className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                        <div>• "Dame feedback" - Para recibir evaluación intermedia</div>
                        <div>• "¿Cómo lo estoy haciendo?" - Para conocer tu progreso</div>
                        <div>• "Terminemos aquí" - Para finalizar la sesión</div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <ConversationTranscript
              messages={messages}
              isListening={isListening}
              currentUserText={currentUserText}
            />
          )}
        </div>
      </div>

      {/* Panel lateral */}
      <div className="space-y-4">
        {/* Evaluación en tiempo real */}
        <RealTimeEvaluation
          metrics={realTimeMetrics}
          isActive={isActive && !isPaused}
          sessionDuration={sessionTime}
          onRequestFeedback={requestFeedback}
        />

        {/* Transcripción (solo en modo llamada) */}
        {config.interactionMode === 'call' && (
          <div className="h-[300px]">
            <ConversationTranscript
              messages={messages}
              isListening={isListening}
              currentUserText={currentUserText}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveTrainingInterface;
