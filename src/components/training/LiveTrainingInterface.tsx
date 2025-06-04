
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mic, MicOff, Volume2, VolumeX, Phone, PhoneOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
  const [sessionTime, setSessionTime] = useState(0);
  const [aiPersonality, setAiPersonality] = useState('');
  const { toast } = useToast();

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const sessionStartRef = useRef<Date | null>(null);

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

  const initializeSession = async () => {
    const personalityMap = {
      'neutral': 'Cliente profesional con actitud equilibrada',
      'curious': 'Cliente interesado que hace muchas preguntas',
      'skeptical': 'Cliente dubitativo que necesita convencimiento',
      'angry': 'Cliente frustrado que requiere manejo cuidadoso',
      'interested': 'Cliente entusiasmado y receptivo',
      'busy': 'Cliente con poco tiempo, va al grano',
      'confused': 'Cliente que necesita explicaciones claras'
    };

    setAiPersonality(personalityMap[config.clientEmotion] || 'Cliente profesional');

    // Simular sonido de llamada si es modo llamada
    if (config.interactionMode === 'call') {
      toast({
        title: "Iniciando llamada...",
        description: "Conectando con el cliente virtual",
      });

      setTimeout(() => {
        setIsSpeaking(true);
        sendInitialGreeting();
      }, 2000);
    } else {
      sendInitialGreeting();
    }
  };

  const sendInitialGreeting = async () => {
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
      }
    } catch (error) {
      console.error('Error initializing session:', error);
      toast({
        title: "Error",
        description: "Error al inicializar la sesión",
        variant: "destructive",
      });
    } finally {
      setIsSpeaking(false);
    }
  };

  const generateAndPlayAudio = async (text: string, voice: string) => {
    try {
      const elevenLabsConfig = JSON.parse(localStorage.getItem('elevenLabsConfig') || '{}');
      
      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: { 
          text, 
          voice: voice || elevenLabsConfig.defaultVoice,
          model: elevenLabsConfig.defaultModel || 'eleven_multilingual_v2',
          settings: elevenLabsConfig.stability ? {
            stability: elevenLabsConfig.stability,
            similarity_boost: elevenLabsConfig.similarityBoost,
            style: elevenLabsConfig.style,
            use_speaker_boost: elevenLabsConfig.useSpeakerBoost
          } : undefined
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

  const startListening = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        await processUserAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsListening(true);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo acceder al micrófono",
        variant: "destructive",
      });
    }
  };

  const stopListening = () => {
    if (mediaRecorderRef.current && isListening) {
      mediaRecorderRef.current.stop();
      setIsListening(false);
    }
  };

  const processUserAudio = async (audioBlob: Blob) => {
    // Aquí implementarías la conversión de audio a texto
    // Por ahora simulamos con texto placeholder
    const userText = "Mensaje de audio procesado";
    await sendUserMessage(userText);
  };

  const sendUserMessage = async (content: string) => {
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

  const endSession = async () => {
    setIsActive(false);
    
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
      onComplete(data);
    } catch (error) {
      console.error('Error evaluating session:', error);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isActive) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <div className="mb-4">
              <Phone className="h-12 w-12 mx-auto text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">¿Listo para comenzar?</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Persona: {aiPersonality}
            </p>
            <Button onClick={() => setIsActive(true)} className="w-full">
              Iniciar {config.interactionMode === 'call' ? 'Llamada' : 'Chat'}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Header con información de sesión */}
      <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="flex items-center space-x-4">
          <Badge className="bg-green-100 text-green-700 animate-pulse">
            🔴 EN VIVO
          </Badge>
          <div className="text-sm">
            <div><strong>Cliente:</strong> {aiPersonality}</div>
            <div><strong>Tiempo:</strong> {formatTime(sessionTime)}</div>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAudioEnabled(!audioEnabled)}
          >
            {audioEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </Button>
          <Button variant="destructive" onClick={endSession}>
            <PhoneOff className="h-4 w-4 mr-2" />
            Finalizar
          </Button>
        </div>
      </div>

      {/* Área de conversación */}
      <Card className="h-[400px] flex flex-col">
        <CardContent className="flex-1 p-6">
          <div className="h-full flex flex-col">
            {config.interactionMode === 'call' ? (
              // Interfaz de llamada
              <div className="flex-1 flex flex-col items-center justify-center space-y-6">
                <div className="text-center">
                  <div className="text-xl font-medium">Voy a representar el escenario:</div>
                  <div className="text-lg text-gray-600 dark:text-gray-400">
                    "{config.scenario}" - Soy un cliente
                  </div>
                </div>

                {/* Animación de ondas de audio */}
                <div className="flex items-center justify-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-1 bg-gray-400 rounded-full transition-all duration-300 ${
                        isSpeaking 
                          ? `h-8 animate-pulse` 
                          : isListening 
                            ? `h-6 animate-bounce` 
                            : 'h-4'
                      }`}
                      style={{ animationDelay: `${i * 0.1}s` }}
                    />
                  ))}
                </div>

                <div className="text-center text-sm text-gray-500">
                  {isSpeaking && "El cliente está hablando..."}
                  {isListening && "Escuchando tu respuesta..."}
                  {!isSpeaking && !isListening && "Presiona el micrófono para hablar"}
                </div>

                {/* Recordatorios útiles */}
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-center max-w-md">
                  <div className="text-blue-600 dark:text-blue-400 text-sm mb-2">Recuerda utilizar:</div>
                  <div className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                    <div>• "Califícame, por favor" - Cuando quieras finalizar</div>
                    <div>• "¿Cómo lo estoy haciendo?" - Para feedback intermedio</div>
                  </div>
                </div>

                {/* Controles de audio */}
                <div className="flex space-x-4">
                  <Button
                    size="lg"
                    variant={isListening ? "destructive" : "default"}
                    className="rounded-full w-16 h-16"
                    onClick={isListening ? stopListening : startListening}
                    disabled={isSpeaking}
                  >
                    {isListening ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
                  </Button>
                </div>
              </div>
            ) : (
              // Interfaz de chat (implementar según necesidades)
              <div className="flex-1 overflow-y-auto space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[75%] p-3 rounded-lg ${
                        message.sender === 'user'
                          ? 'bg-purple-600 text-white'
                          : 'bg-white dark:bg-gray-800 border shadow-sm'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <span className="text-xs opacity-70 block mt-1">
                        {message.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LiveTrainingInterface;
