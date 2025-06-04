import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Send, RotateCcw, User, Bot } from 'lucide-react';
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
  const [clientPersonality, setClientPersonality] = useState('');
  const [knowledgeBase, setKnowledgeBase] = useState([]);
  const { toast } = useToast();
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load knowledge base and initialize conversation
  useEffect(() => {
    loadKnowledgeBase();
    initializeConversation();
  }, [scenario, difficulty]);

  const loadKnowledgeBase = () => {
    const savedDocs = localStorage.getItem('knowledgeDocuments');
    if (savedDocs) {
      const docs = JSON.parse(savedDocs);
      setKnowledgeBase(docs);
    }
  };

  const initializeConversation = async () => {
    const greetingMessages = {
      'sales-cold-call': '¡Hola! Habla María González de Tecnologías Avanzadas. ¿Tengo unos minutos de su tiempo?',
      'sales-objection-handling': 'Buenos días, ya me presentaron su propuesta pero tengo algunas dudas sobre los costos...',
      'recruitment-interview': 'Buenos días, soy el gerente de RRHH. Gracias por venir a esta entrevista. Cuénteme sobre usted.',
      'education-presentation': 'Buenos días, somos sus estudiantes de hoy. Estamos listos para su presentación.'
    };

    const personalities = {
      'sales-cold-call': 'Cliente ocupado y inicialmente escéptico',
      'sales-objection-handling': 'Cliente con preocupaciones sobre costos',
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
        // Get ElevenLabs configuration
        const elevenLabsConfig = localStorage.getItem('elevenLabsConfig');
        const config = elevenLabsConfig ? JSON.parse(elevenLabsConfig) : {};

        const audioResponse = await supabase.functions.invoke('text-to-speech', {
          body: { 
            text: greeting, 
            voice: 'Sarah',
            model: config.defaultModel || 'eleven_multilingual_v2',
            settings: config.stability ? {
              stability: config.stability,
              similarity_boost: config.similarityBoost,
              style: config.style,
              use_speaker_boost: config.useSpeakerBoost
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
          }, 500);
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
      // Send to AI conversation function with conversation history and knowledge base
      const { data, error } = await supabase.functions.invoke('ai-conversation', {
        body: {
          message: content,
          scenario,
          userProfile: 'trainee',
          difficulty,
          conversationHistory: messages.slice(-5), // Send last 5 messages for context
          knowledgeBase: knowledgeBase, // Include knowledge base
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
          // Get ElevenLabs configuration
          const elevenLabsConfig = localStorage.getItem('elevenLabsConfig');
          const config = elevenLabsConfig ? JSON.parse(elevenLabsConfig) : {};

          const audioResponse = await supabase.functions.invoke('text-to-speech', {
            body: { 
              text: data.response, 
              voice: data.voice,
              model: config.defaultModel || 'eleven_multilingual_v2',
              settings: config.stability ? {
                stability: config.stability,
                similarity_boost: config.similarityBoost,
                style: config.style,
                use_speaker_boost: config.useSpeakerBoost
              } : undefined
            },
          });

          if (!audioResponse.error && audioResponse.data.audioContent) {
            const audioUrl = `data:audio/mpeg;base64,${audioResponse.data.audioContent}`;
            aiMessage.audioUrl = audioUrl;
            
            // Auto-play audio after a short delay
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
    initializeConversation();
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
            <span>Simulación: {scenario}</span>
            <Badge className={getDifficultyColor()}>
              {difficulty}
            </Badge>
            {knowledgeBase.length > 0 && (
              <Badge variant="outline">
                {knowledgeBase.length} docs disponibles
              </Badge>
            )}
          </div>
          <div className="flex space-x-2">
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
        <div className="text-sm text-gray-600 dark:text-gray-400">
          <strong>Personaje:</strong> {clientPersonality}
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto space-y-4 mb-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-900">
          {messages.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              <Bot className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>La conversación comenzará automáticamente...</p>
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
                    {message.sender === 'user' ? 'Usted' : 'Cliente/IA'}
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

        {/* Input Area */}
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
              variant={isRecording ? "destructive" : "outline"}
              size="icon"
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isLoading}
              title={isRecording ? "Detener grabación" : "Grabar mensaje de voz"}
            >
              {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>
            
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
              onClick={evaluateConversation}
              disabled={isLoading}
            >
              Finalizar y Evaluar Conversación
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ConversationTraining;
