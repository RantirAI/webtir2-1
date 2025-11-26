import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Sparkles, History } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export const AIChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate AI response (replace with actual AI integration)
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'AI chat integration coming soon. This will help you build and modify components using natural language.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full">
      <Tabs defaultValue="prompt" className="flex-1 flex flex-col">
        <TabsList className="w-full grid grid-cols-2 rounded-none border-b bg-transparent h-10 p-1 gap-1 flex-shrink-0">
          <TabsTrigger 
            value="prompt"
            className="text-xs h-full rounded-md data-[state=active]:bg-[#F5F5F5] dark:data-[state=active]:bg-zinc-800 data-[state=active]:shadow-none flex items-center gap-1"
          >
            <Sparkles className="w-3 h-3" />
            Prompt
          </TabsTrigger>
          <TabsTrigger 
            value="history"
            className="text-xs h-full rounded-md data-[state=active]:bg-[#F5F5F5] dark:data-[state=active]:bg-zinc-800 data-[state=active]:shadow-none flex items-center gap-1"
          >
            <History className="w-3 h-3" />
            History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="prompt" className="flex-1 flex flex-col m-0 min-h-0">
          <ScrollArea className="flex-1 p-3">
            <div className="space-y-3">
              {messages.length === 0 ? (
                <div className="text-xs text-muted-foreground text-center py-8">
                  <Sparkles className="w-8 h-8 mx-auto mb-2 text-primary/50" />
                  <p>Start a conversation with AI</p>
                  <p className="mt-1">Ask me to create or modify components</p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`text-xs p-2 rounded ${
                      message.role === 'user'
                        ? 'bg-primary/10 ml-4'
                        : 'bg-muted mr-4'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>
                ))
              )}
              {isLoading && (
                <div className="text-xs text-muted-foreground italic p-2">
                  AI is thinking...
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="p-3 border-t space-y-2 flex-shrink-0">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask AI to create or modify components..."
              className="text-xs resize-none min-h-[60px]"
              disabled={isLoading}
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="w-full h-8 text-xs"
            >
              <Send className="w-3 h-3 mr-1" />
              Send
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="history" className="flex-1 m-0 overflow-y-auto">
          <ScrollArea className="h-full p-3">
            {messages.length === 0 ? (
              <div className="text-xs text-muted-foreground text-center py-8">
                <History className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
                <p>No conversation history yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className="text-xs p-2 rounded bg-muted hover:bg-muted/80 cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-[10px] text-muted-foreground">
                        {message.role === 'user' ? 'You' : 'AI'}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {message.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="line-clamp-2">{message.content}</p>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
};
