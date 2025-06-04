import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Send, RotateCcw, User, Bot, Phone, PhoneOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  audioUrl?: string;
}

interface ConversationTrainingProps {
  scenario: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  onComplete: (evaluation: any) => void;
}

const ConversationTraining = ({ scenario, difficulty, onComplete }: ConversationTrainingProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [autoCallMode, setAutoCallMode] = useState(true);
  const [callActive, setCallActive] = useState(false);
  const [clientPersonality, setClientPersonality] = useState('');
  const [knowledgeBase, setKnowledgeBase] = useState([]);
  const [sessionMetrics, setSessionMetrics] = useState({
    startTime: null as Date | null,
    wordsSpoken: 0,
    interruptionCount: 0,
    keywordsUsed: new Set(),
    emotionalTone: 'neutral'
  });
  const { toast } = useToast();
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const callSoundRef = useRef<HTMLAudioElement | null>(null);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load knowledge base and ElevenLabs config
  useEffect(() => {
    loadKnowledgeBase();
    loadElevenLabsConfig();
    createCallSound();
  }, [scenario, difficulty]);

  const loadKnowledgeBase = () => {
    const savedDocs = localStorage.getItem('knowledgeDocuments');
    if (savedDocs) {
      const docs = JSON.parse(savedDocs);
      setKnowledgeBase(docs);
    }
  };

  const loadElevenLabsConfig = () => {
    const savedConfig = localStorage.getItem('elevenLabsConfig');
    if (savedConfig) {
      const config = JSON.parse(savedConfig);
      setAutoCallMode(config.autoCallMode || true);
    }
  };

  const createCallSound = () => {
    // Create a simple call ringing sound using Web Audio API
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    const createRingTone = () => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.5);
      
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 1);
    };
    
    callSoundRef.current = { play: createRingTone } as any;
  };

  const initiateCall = async () => {
    setCallActive(true);
    setSessionMetrics(prev => ({ ...prev, startTime: new Date() }));
    
    // Play call sound
    if (callSoundRef.current) {
      callSoundRef.current.play();
    }
    
    toast({
      title: "Iniciando llamada...",
      description: "Conectando con el cliente",
    });

    // Wait a moment then start the conversation
    setTimeout(() => {
      initializeConversation();
      toast({
        title: "Llamada conectada",
        description: "El cliente está en línea",
      });
    }, 3000);
  };

  const endCall = async () => {
    setCallActive(false);
    
    if (messages.length >= 4) {
      await evaluateConversation();
    }
    
    // Save session to history
    saveSessionToHistory();
    
    toast({
      title: "Llamada finalizada",
      description: "Sesión guardada en el historial",
    });
  };

  const saveSessionToHistory = () => {
    const elevenLabsConfig = JSON.parse(localStorage.getItem('elevenLabsConfig') || '{}');
    const voiceUsed = elevenLabsConfig.defaultVoice || 'EXAVITQu4vr4xnSDxMaL';
    
    const session = {
      id: Date.now().toString(),
      title: `${scenario} - ${new Date().toLocaleDateString()}`,
      scenario,
      type: autoCallMode ? 'call_simulation' : 'conversation',
      date: new Date().toISOString().split('T')[0],
      duration: calculateDuration(),
      score: calculateScore(),
      voice: {
        name: getVoiceName(voiceUsed),
        language: 'english',
        gender: getVoiceGender(voiceUsed),
        age: 'middle'
      },
      client: {
        name: getClientName(),
        personality: clientPersonality,
        objections: getScenarioObjections()
      },
      metrics: {
        wordsPerMinute: calculateWPM(),
        interruptionCount: sessionMetrics.interruptionCount,
        emotionalTone: sessionMetrics.emotionalTone,
        keywordsUsed: Array.from(sessionMetrics.keywordsUsed),
        clientSatisfaction: Math.random() * 3 + 7 // Mock satisfaction score
      },
      transcript: {
        messages: messages.map(m => ({
          speaker: m.sender,
          content: m.content,
          timestamp: m.timestamp.toLocaleTimeString(),
          audioUrl: m.audioUrl
        }))
      },
      evaluation: {
        strengths: ['Buena comunicación', 'Manejo profesional'],
        improvements: ['Mejorar el cierre', 'Más preguntas abiertas'],
        overallRating: calculateScore() / 10,
        specificFeedback: 'Sesión completada exitosamente.'
      },
      tags: [scenario.split('-')[0], difficulty],
      isStarred: false
    };

    const existingSessions = JSON.parse(localStorage.getItem('trainingSessions') || '[]');
    const updatedSessions = [session, ...existingSessions];
    localStorage.setItem('trainingSessions', JSON.stringify(updatedSessions));
  };

  const calculateDuration = () => {
    if (!sessionMetrics.startTime) return '00:00';
    const duration = Math.floor((Date.now() - sessionMetrics.startTime.getTime()) / 1000);
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const calculateScore = () => {
    const baseScore = 60;
    const messageBonus = Math.min(messages.length * 5, 30);
    const interruptionPenalty = sessionMetrics.interruptionCount * 5;
    const keywordBonus = Math.min(sessionMetrics.keywordsUsed.size * 2, 15);
    
    return Math.max(0, Math.min(100, baseScore + messageBonus - interruptionPenalty + keywordBonus));
  };

  const calculateWPM = () => {
    const userMessages = messages.filter(m => m.sender === 'user');
    const totalWords = userMessages.reduce((acc, m) => acc + m.content.split(' ').length, 0);
    const durationMinutes = sessionMetrics.startTime 
      ? (Date.now() - sessionMetrics.startTime.getTime()) / 60000 
      : 1;
    return Math.round(totalWords / durationMinutes);
  };

  const getVoiceName = (voiceId: string) => {
    const voiceMap = {
      'EXAVITQu4vr4xnSDxMaL': 'Sarah',
      'JBFqnCBsd6RMkjVDRZzb': 'George',
      'XB0fDUnXU5powFXDhCwa': 'Charlotte',
      'onwK4e9ZLuTAKqWW03F9': 'Daniel'
    };
    return voiceMap[voiceId] || 'Sarah';
  };

  const getVoiceGender = (voiceId: string) => {
    const genderMap = {
      'EXAVITQu4vr4xnSDxMaL': 'female',
      'JBFqnCBsd6RMkjVDRZzb': 'male',
      'XB0fDUnXU5powFXDhCwa': 'female',
      'onwK4e9ZLuTAKqWW03F9': 'male'
    };
    return genderMap[voiceId] || 'female';
  };

  const getClientName = () => {
    const names = {
      'sales-cold-call': 'George Thompson',
      'sales-objection-handling': 'Maria Rodriguez',
      'recruitment-interview': 'Charlotte Williams',
      'education-presentation': 'Dr. Johnson'
    };
    return names[scenario] || 'Cliente';
  };

  const getScenarioObjections = () => {
    const objections = {
      'sales-cold-call': ['No tengo tiempo', 'Ya tengo proveedor', 'No me interesa'],
      'sales-objection-handling': ['Es muy caro', 'No tenemos presupuesto', 'Necesitamos más tiempo'],
      'recruitment-interview': ['Experiencia técnica', 'Trabajo en equipo', 'Liderazgo'],
      'education-presentation': ['Conceptos complejos', 'Ejemplos prácticos', 'Aplicación real']
    };
    return objections[scenario] || [];
  };

  const initializeConversation = async () => {
    const elevenLabsConfig = JSON.parse(localStorage.getItem('elevenLabsConfig') || '{}');
    
    const greetingMessages = {
      'sales-cold-call': elevenLabsConfig.callIntroMessage?.replace('{name}', getClientName()) || 
        `¡Hola! Habla ${getClientName()}. ¿Tengo unos minutos de su tiempo?`,
      'sales-objection-handling': 'Buenos días, ya me presentaron su propuesta pero tengo algunas dudas sobre los costos...',
      'recruitment-interview': `Buenos días, soy ${getClientName()}, gerente de RRHH. Gracias por venir a esta entrevista.`,
      'education-presentation': 'Buenos días, somos sus estudiantes de hoy. Estamos listos para su presentación.'
    };

    const personalities = {
      'sales-cold-call': 'Cliente ocupado y inicialmente escéptico',
      'sales-objection-handling': 'Cliente con preocupaciones específicas sobre costos',
      'recruitment-interview': 'Entrevistador profesional evaluando competencias',
      'education-presentation': 'Audiencia atenta esperando aprender'
    };

    setClientPersonality(personalities[scenario] || 'Persona interactuando profesionalmente');

    const greeting = greetingMessages[scenario] || '¡Hola! ¿Cómo está usted hoy?';
    
    const aiMessage: Message = {
      id: Date.now().toString(),
      content: greeting,
      sender: 'ai',
      timestamp: new Date(),
    };

    // Generate audio for greeting if enabled
    if (audioEnabled) {
      try {
        const audioResponse = await supabase.functions.invoke('text-to-speech', {
          body: { 
            text: greeting, 
            voice: getVoiceName(elevenLabsConfig.defaultVoice || 'EXAVITQu4vr4xnSDxMaL'),
            model: elevenLabsConfig.defaultModel || 'eleven_multilingual_v2',
            settings: elevenLabsConfig.stability ? {
              stability: elevenLabsConfig.stability,
              similarity_boost: elevenLabsConfig.similarityBoost,
              style: elevenLabsConfig.style,
              use_speaker_boost: elevenLabsConfig.useSpeakerBoost
            } : undefined
          },
        });

        if (!audioResponse.error && audioResponse.data.audioContent) {
          const audioUrl = `data:audio/mpeg;base64,${audioResponse.data.audioContent}`;
          aiMessage.audioUrl = audioUrl;
          
          // Auto-play greeting audio
          setTimeout(() => {
            const audio = new Audio(audioUrl);
            audio.play().catch(console.error);
          }, 1000);
        }
      } catch (error) {
        console.error('Error generating greeting audio:', error);
      }
    }

    setMessages([aiMessage]);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        await processAudio(audioBlob);
        // Stop all tracks to free up the microphone
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      
      toast({
        title: "Grabando...",
        description: "Hable ahora, presione el botón nuevamente para enviar",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo acceder al micrófono",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const processAudio = async (audioBlob: Blob) => {
    // Convert audio to base64 for processing
    const reader = new FileReader();
    reader.onload = async () => {
      const base64Audio = (reader.result as string).split(',')[1];
      
      try {
        // Call speech-to-text function (would need to implement)
        // For now, use placeholder text
        const transcription = "Audio transcrito: " + inputText || "Mensaje de voz procesado";
        await sendMessage(transcription);
      } catch (error) {
        toast({
          title: "Error",
          description: "Error procesando el audio",
          variant: "destructive",
        });
      }
    };
    reader.readAsDataURL(audioBlob);
  };

  const sendMessage = async (content: string) => {
    if (!content.trim()) return;

    // Update metrics
    const words = content.split(' ').length;
    const keywords = ['beneficio', 'solución', 'precio', 'calidad', 'experiencia', 'proyecto'];
    const foundKeywords = keywords.filter(keyword => content.toLowerCase().includes(keyword));
    
    setSessionMetrics(prev => ({
      ...prev,
      wordsSpoken: prev.wordsSpoken + words,
      keywordsUsed: new Set([...prev.keywordsUsed, ...foundKeywords])
    }));

    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('ai-conversation', {
        body: {
          message: content,
          scenario,
          userProfile: 'trainee',
          difficulty,
          conversationHistory: messages.slice(-5),
          knowledgeBase: knowledgeBase,
        },
      });

      if (error) throw error;

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response,
        sender: 'ai',
        timestamp: new Date(),
      };

      // Generate audio with the specified voice and custom settings
      if (audioEnabled && data.voice) {
        try {
          const elevenLabsConfig = JSON.parse(localStorage.getItem('elevenLabsConfig') || '{}');

          const audioResponse = await supabase.functions.invoke('text-to-speech', {
            body: { 
              text: data.response, 
              voice: data.voice,
              model: elevenLabsConfig.defaultModel || 'eleven_multilingual_v2',
              settings: elevenLabsConfig.stability ? {
                stability: elevenLabsConfig.stability,
                similarity_boost: elevenLabsConfig.similarityBoost,
                style: elevenLabsConfig.style,
                use_speaker_boost: elevenLabsConfig.useSpeakerBoost
              } : undefined
            },
          });

          if (!audioResponse.error && audioResponse.data.audioContent) {
            const audioUrl = `data:audio/mpeg;base64,${audioResponse.data.audioContent}`;
            aiMessage.audioUrl = audioUrl;
            
            setTimeout(() => {
              const audio = new Audio(audioUrl);
              audio.play().catch(console.error);
            }, 300);
          }
        } catch (audioError) {
          console.error('Error generating audio:', audioError);
        }
      }

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Conversation error:', error);
      toast({
        title: "Error",
        description: "Error en la conversación con IA",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const evaluateConversation = async () => {
    const conversationText = messages
      .map(m => `${m.sender === 'user' ? 'Usuario' : 'Cliente/IA'}: ${m.content}`)
      .join('\n');

    try {
      const { data, error } = await supabase.functions.invoke('evaluate-response', {
        body: {
          userResponse: conversationText,
          scenario,
          knowledgeBase: knowledgeBase.map(doc => `${doc.title}: ${doc.content}`).join('\n'),
          expectedOutcomes: 'Objetivos específicos del entrenamiento completados exitosamente',
        },
      });

      if (error) throw error;
      onComplete(data);
    } catch (error) {
      console.error('Evaluation error:', error);
      toast({
        title: "Error",
        description: "Error al evaluar la conversación",
        variant: "destructive",
      });
    }
  };

  const resetConversation = () => {
    setMessages([]);
    setInputText('');
    setCallActive(false);
    setSessionMetrics({
      startTime: null,
      wordsSpoken: 0,
      interruptionCount: 0,
      keywordsUsed: new Set(),
      emotionalTone: 'neutral'
    });
  };

  const getDifficultyColor = () => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-700';
      case 'intermediate': return 'bg-yellow-100 text-yellow-700';
      case 'advanced': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <Card className="h-[700px] flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span>
              {autoCallMode ? '📞 Llamada Simulada' : '💬 Conversación'}: {scenario}
            </span>
            <Badge className={getDifficultyColor()}>
              {difficulty}
            </Badge>
            {knowledgeBase.length > 0 && (
              <Badge variant="outline">
                {knowledgeBase.length} docs disponibles
              </Badge>
            )}
            {callActive && (
              <Badge className="bg-green-100 text-green-700 animate-pulse">
                🔴 EN VIVO
              </Badge>
            )}
          </div>
          <div className="flex space-x-2">
            {!callActive ? (
              <Button onClick={initiateCall} className="bg-green-600 hover:bg-green-700">
                <Phone className="h-4 w-4 mr-2" />
                Iniciar Llamada
              </Button>
            ) : (
              <Button onClick={endCall} variant="destructive">
                <PhoneOff className="h-4 w-4 mr-2" />
                Finalizar
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAudioEnabled(!audioEnabled)}
            >
              {audioEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </Button>
            <Button variant="outline" size="sm" onClick={resetConversation}>
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </CardTitle>
        {callActive && (
          <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
            <div><strong>Cliente:</strong> {getClientName()}</div>
            <div><strong>Personalidad:</strong> {clientPersonality}</div>
            <div><strong>Duración:</strong> {calculateDuration()}</div>
            <div><strong>Palabras/min:</strong> {calculateWPM()}</div>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto space-y-4 mb-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-900">
          {!callActive && messages.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              <Phone className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Presiona "Iniciar Llamada" para comenzar la simulación</p>
            </div>
          )}
          
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
                <div className="flex items-center mb-1">
                  {message.sender === 'user' ? (
                    <User className="h-4 w-4 mr-2" />
                  ) : (
                    <Bot className="h-4 w-4 mr-2" />
                  )}
                  <span className="text-xs font-medium">
                    {message.sender === 'user' ? 'Usted' : getClientName()}
                  </span>
                </div>
                <p className="text-sm">{message.content}</p>
                {message.audioUrl && (
                  <audio controls className="mt-2 w-full max-w-[200px]">
                    <source src={message.audioUrl} type="audio/mpeg" />
                  </audio>
                )}
                <span className="text-xs opacity-70 block mt-1">
                  {message.timestamp.toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white dark:bg-gray-800 border p-3 rounded-lg shadow-sm">
                <div className="flex items-center space-x-2">
                  <Bot className="h-4 w-4" />
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area - Only show if call is active */}
        {callActive && (
          <div className="space-y-3">
            <div className="flex space-x-2">
              <Input
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Escriba su respuesta..."
                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage(inputText)}
                disabled={isLoading}
                className="flex-1"
              />
              
              <Button
                onClick={() => sendMessage(inputText)}
                disabled={!inputText.trim() || isLoading}
                title="Enviar mensaje"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>

            {messages.length >= 4 && (
              <Button
                className="w-full"
                onClick={endCall}
                variant="destructive"
              >
                <PhoneOff className="h-4 w-4 mr-2" />
                Finalizar Llamada y Evaluar
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ConversationTraining;
