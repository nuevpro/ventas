
import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Send, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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
  const { toast } = useToast();
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

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
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
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
    // Here you would implement speech-to-text conversion
    // For now, we'll use a placeholder
    const transcription = "Transcripción del audio (implementar speech-to-text)";
    await sendMessage(transcription);
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
      // Send to AI conversation function
      const { data, error } = await supabase.functions.invoke('ai-conversation', {
        body: {
          message: content,
          scenario,
          userProfile: 'trainee',
          difficulty,
        },
      });

      if (error) throw error;

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response,
        sender: 'ai',
        timestamp: new Date(),
      };

      // Generate audio if enabled
      if (audioEnabled) {
        const audioResponse = await supabase.functions.invoke('text-to-speech', {
          body: { text: data.response, voice: 'Aria' },
        });

        if (!audioResponse.error && audioResponse.data.audioContent) {
          const audioUrl = `data:audio/mpeg;base64,${audioResponse.data.audioContent}`;
          aiMessage.audioUrl = audioUrl;
          
          // Auto-play audio
          const audio = new Audio(audioUrl);
          audio.play().catch(console.error);
        }
      }

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
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
      .map(m => `${m.sender}: ${m.content}`)
      .join('\n');

    try {
      const { data, error } = await supabase.functions.invoke('evaluate-response', {
        body: {
          userResponse: conversationText,
          scenario,
          knowledgeBase: 'Base de conocimiento del escenario',
          expectedOutcomes: 'Objetivos esperados del entrenamiento',
        },
      });

      if (error) throw error;
      onComplete(data);
    } catch (error) {
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
  };

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Entrenamiento Conversacional - {scenario}</span>
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
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto space-y-4 mb-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-900">
          {messages.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              Inicia la conversación escribiendo un mensaje o usando el micrófono
            </div>
          )}
          
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] p-3 rounded-lg ${
                  message.sender === 'user'
                    ? 'bg-purple-600 text-white'
                    : 'bg-white dark:bg-gray-800 border'
                }`}
              >
                <p>{message.content}</p>
                {message.audioUrl && (
                  <audio controls className="mt-2 w-full">
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
              <div className="bg-white dark:bg-gray-800 border p-3 rounded-lg">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="flex space-x-2">
          <Input
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Escribe tu respuesta..."
            onKeyPress={(e) => e.key === 'Enter' && sendMessage(inputText)}
            disabled={isLoading}
          />
          
          <Button
            variant={isRecording ? "destructive" : "outline"}
            size="icon"
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isLoading}
          >
            {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </Button>
          
          <Button
            onClick={() => sendMessage(inputText)}
            disabled={!inputText.trim() || isLoading}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>

        {messages.length > 2 && (
          <Button
            className="mt-4"
            onClick={evaluateConversation}
            disabled={isLoading}
          >
            Evaluar Conversación
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default ConversationTraining;
