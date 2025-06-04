
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mic, MicOff, Volume2, VolumeX, Phone, PhoneOff, MessageSquare } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import ConversationTranscript from './ConversationTranscript';
import RealTimeEvaluation from './RealTimeEvaluation';

interface LiveTrainingInterfaceProps {
  config: any;
  onComplete: (evaluation: any) => void;
  onBack: () => void;
}

const LiveTrainingInterface = ({ config, onComplete, onBack }: LiveTrainingInterfaceProps) => {
  const [isActive, setIsActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [messages, setMessages] = useState([]);
  const [currentUserText, setCurrentUserText] = useState('');
  const [sessionTime, setSessionTime] = useState(0);
  const [callStatus, setCallStatus] = useState('connecting'); // connecting, ringing, connected, ended
  const [realTimeMetrics, setRealTimeMetrics] = useState({
    rapport: 75,
    clarity: 80,
    empathy: 70,
    accuracy: 85,
    responseTime: 2.1,
    overallScore: 77,
    trend: 'stable' as const,
    criticalIssues: [],
    positivePoints: ['Tono profesional', 'Información precisa'],
    suggestions: []
  });

  const { toast } = useToast();
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const sessionStartRef = useRef<Date | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (isActive) {
      sessionStartRef.current = new Date();
      const timer = setInterval(() => {
        if (sessionStartRef.current) {
          setSessionTime(Math.floor((Date.now() - sessionStartRef.current.getTime()) / 1000));
        }
      }, 1000);
      
      initializeSession();
      return () => clearInterval(timer);
    }
  }, [isActive]);

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
    if (config.interactionMode === 'call') {
      // Simular proceso de llamada
      setCallStatus('ringing');
      
      // Sonido de llamada (simulado)
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

      // Actualizar métricas en tiempo real (simulado)
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

  const updateRealTimeMetrics = (userMessage: string, aiResponse: string) => {
    // Simular actualización de métricas basada en la conversación
    const messageCount = messages.length / 2;
    const baseScore = 75;
    const variation = Math.random() * 10 - 5; // -5 a +5
    
    setRealTimeMetrics(prev => ({
      ...prev,
      overallScore: Math.max(0, Math.min(100, baseScore + variation + messageCount)),
      rapport: Math.max(0, Math.min(100, prev.rapport + (Math.random() * 6 - 3))),
      clarity: Math.max(0, Math.min(100, prev.clarity + (Math.random() * 4 - 2))),
      empathy: Math.max(0, Math.min(100, prev.empathy + (Math.random() * 8 - 4))),
      accuracy: Math.max(0, Math.min(100, prev.accuracy + (Math.random() * 6 - 3))),
      trend: Math.random() > 0.6 ? 'up' : Math.random() > 0.3 ? 'stable' : 'down'
    }));
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
      onComplete({
        ...data,
        realTimeMetrics,
        transcript: messages,
        sessionDuration: sessionTime
      });
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
                Vas a entrenar con un cliente virtual
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
        {/* Header de sesión */}
        <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="flex items-center space-x-4">
            <Badge className={`${
              callStatus === 'connected' ? 'bg-green-100 text-green-700 animate-pulse' :
              callStatus === 'ringing' ? 'bg-yellow-100 text-yellow-700 animate-pulse' :
              'bg-gray-100 text-gray-700'
            }`}>
              {callStatus === 'connected' && '🔴 EN VIVO'}
              {callStatus === 'ringing' && '📞 CONECTANDO'}
              {callStatus === 'connecting' && '⏳ INICIANDO'}
            </Badge>
            <div className="text-sm">
              <div><strong>Duración:</strong> {Math.floor(sessionTime / 60)}:{(sessionTime % 60).toString().padStart(2, '0')}</div>
            </div>
          </div>
          
          <div className="flex space-x-2">
            {config.interactionMode === 'call' && (
              <Button
                variant="outline"
                size="sm"
                onClick={toggleMicrophone}
                className={isListening ? 'bg-red-50 text-red-600' : ''}
              >
                {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAudioEnabled(!audioEnabled)}
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
                    <div className="text-xl font-medium mb-2">Cliente Virtual Activo</div>
                    <div className="text-gray-600 dark:text-gray-400">
                      {isSpeaking ? "El cliente está hablando..." : 
                       isListening ? "Puedes responder ahora..." : 
                       "Conversación en pausa"}
                    </div>
                  </div>

                  {/* Animación de ondas de audio */}
                  <div className="flex items-center justify-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-2 bg-purple-600 rounded-full transition-all duration-300 ${
                          isSpeaking 
                            ? `h-12 animate-pulse` 
                            : isListening 
                              ? `h-8 animate-bounce` 
                              : 'h-4'
                        }`}
                        style={{ animationDelay: `${i * 0.1}s` }}
                      />
                    ))}
                  </div>

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
          isActive={isActive}
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
