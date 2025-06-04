
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Send, Loader2 } from 'lucide-react';
import ConversationTranscript from './ConversationTranscript';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
  disabled?: boolean;
}

const ChatInterface = ({ 
  messages, 
  onSendMessage, 
  isLoading = false, 
  disabled = false 
}: ChatInterfaceProps) => {
  const [inputMessage, setInputMessage] = useState('');

  const handleSend = () => {
    if (inputMessage.trim() && !isLoading && !disabled) {
      onSendMessage(inputMessage.trim());
      setInputMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="h-full flex flex-col gap-4">
      {/* Área de conversación */}
      <div className="flex-1">
        <ConversationTranscript messages={messages} />
      </div>

      {/* Área de entrada de texto */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-2">
            <Textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escribe tu mensaje aquí..."
              disabled={disabled || isLoading}
              className="min-h-[60px] resize-none"
            />
            <Button
              onClick={handleSend}
              disabled={!inputMessage.trim() || isLoading || disabled}
              size="lg"
              className="px-6"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Presiona Enter para enviar, Shift+Enter para nueva línea
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChatInterface;
