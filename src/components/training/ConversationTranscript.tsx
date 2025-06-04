
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Bot, Mic } from 'lucide-react';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

interface ConversationTranscriptProps {
  messages: Message[];
  isListening?: boolean;
  currentUserText?: string;
  className?: string;
}

const ConversationTranscript = ({ 
  messages, 
  isListening = false, 
  currentUserText = '',
  className = ''
}: ConversationTranscriptProps) => {
  return (
    <Card className={`h-full flex flex-col ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          Transcripción de la Conversación
          {isListening && (
            <Badge variant="secondary" className="animate-pulse">
              <Mic className="h-3 w-3 mr-1" />
              Escuchando...
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto space-y-3 mb-4">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 dark:text-gray-400 py-8">
              <Bot className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>La conversación aparecerá aquí...</p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div className={`flex gap-2 max-w-[80%] ${
                  message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
                }`}>
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    message.sender === 'user' 
                      ? 'bg-blue-100 dark:bg-blue-900' 
                      : 'bg-purple-100 dark:bg-purple-900'
                  }`}>
                    {message.sender === 'user' ? (
                      <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    ) : (
                      <Bot className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    )}
                  </div>
                  
                  <div className={`rounded-lg px-3 py-2 ${
                    message.sender === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                  }`}>
                    <p className="text-sm">{message.content}</p>
                    <span className="text-xs opacity-70 mt-1 block">
                      {message.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
          
          {currentUserText && (
            <div className="flex gap-3 justify-end">
              <div className="flex gap-2 max-w-[80%] flex-row-reverse">
                <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-blue-100 dark:bg-blue-900">
                  <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="rounded-lg px-3 py-2 bg-blue-600/70 text-white">
                  <p className="text-sm italic">{currentUserText}</p>
                  <span className="text-xs opacity-70 mt-1 block">
                    Escribiendo...
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ConversationTranscript;
