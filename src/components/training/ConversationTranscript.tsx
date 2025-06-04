
import React, { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Bot, Clock } from 'lucide-react';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  confidence?: number;
  isProcessing?: boolean;
}

interface ConversationTranscriptProps {
  messages: Message[];
  isListening: boolean;
  currentUserText?: string;
}

const ConversationTranscript = ({ messages, isListening, currentUserText }: ConversationTranscriptProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, currentUserText]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <span>Transcripción en Tiempo Real</span>
          {isListening && (
            <Badge className="bg-red-100 text-red-700 animate-pulse">
              🔴 Escuchando
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto space-y-4 pr-2">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-start space-x-3 ${
                message.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.sender === 'ai' && (
                <div className="flex-shrink-0 w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                  <Bot className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
              )}
              
              <div className={`max-w-[75%] ${message.sender === 'user' ? 'order-1' : ''}`}>
                <div
                  className={`p-3 rounded-lg ${
                    message.sender === 'user'
                      ? 'bg-blue-600 text-white ml-auto'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                  } ${message.isProcessing ? 'opacity-70' : ''}`}
                >
                  <p className="text-sm">{message.content}</p>
                  {message.isProcessing && (
                    <div className="flex items-center mt-2 text-xs opacity-75">
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current mr-2"></div>
                      Procesando...
                    </div>
                  )}
                </div>
                
                <div className={`flex items-center mt-1 text-xs text-gray-500 space-x-2 ${
                  message.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}>
                  <Clock className="h-3 w-3" />
                  <span>{formatTime(message.timestamp)}</span>
                  {message.confidence && message.confidence < 0.9 && (
                    <Badge variant="outline" className="text-xs">
                      Confianza: {Math.round(message.confidence * 100)}%
                    </Badge>
                  )}
                </div>
              </div>
              
              {message.sender === 'user' && (
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center order-2">
                  <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
              )}
            </div>
          ))}
          
          {/* Texto del usuario en tiempo real mientras habla */}
          {isListening && currentUserText && (
            <div className="flex items-start space-x-3 justify-end">
              <div className="max-w-[75%]">
                <div className="p-3 rounded-lg bg-blue-400 text-white ml-auto opacity-75">
                  <p className="text-sm">{currentUserText}</p>
                  <div className="flex items-center mt-2 text-xs">
                    <div className="animate-pulse h-2 w-2 bg-white rounded-full mr-2"></div>
                    Escribiendo...
                  </div>
                </div>
              </div>
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </CardContent>
    </Card>
  );
};

export default ConversationTranscript;
