import React, { useState, useRef } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Send, MessageSquare, Upload, Settings, FileCode, FileText, Image, Figma, History } from 'lucide-react';

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
  const [activeMode, setActiveMode] = useState<'chat' | 'import'>('chat');
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [selectedProvider, setSelectedProvider] = useState('openai');
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleFileUpload = (type: string) => {
    if (fileInputRef.current) {
      fileInputRef.current.accept = type === 'image' ? 'image/*' : 
                                     type === 'pdf' ? '.pdf' : 
                                     type === 'txt' ? '.txt' : 
                                     type === 'html' ? '.html,.htm' : '*/*';
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log('File selected:', file.name);
      // Handle file import logic here
    }
  };

  const handleSaveSettings = () => {
    console.log('Saving API key for provider:', selectedProvider);
    setShowSettingsDialog(false);
  };

  const importOptions = [
    { id: 'webflow', label: 'Webflow', icon: FileCode },
    { id: 'framer', label: 'Framer', icon: FileCode },
    { id: 'figma', label: 'Figma', icon: Figma },
    { id: 'image', label: 'Image', icon: Image },
    { id: 'pdf', label: 'PDF', icon: FileText },
    { id: 'txt', label: 'TXT', icon: FileText },
    { id: 'html', label: 'HTML', icon: FileCode },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Mode Switcher + Settings */}
      <div className="flex items-center justify-between px-2 py-1.5 border-b">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveMode('chat')}
            className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium transition-colors ${
              activeMode === 'chat' 
                ? 'bg-primary text-primary-foreground' 
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            <MessageSquare className="w-2.5 h-2.5" />
            Chat
          </button>
          <button
            onClick={() => setActiveMode('import')}
            className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium transition-colors ${
              activeMode === 'import' 
                ? 'bg-primary text-primary-foreground' 
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            <Upload className="w-2.5 h-2.5" />
            Import
          </button>
        </div>
        <button
          onClick={() => setShowSettingsDialog(true)}
          className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          title="AI Settings"
        >
          <Settings className="w-3 h-3" />
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileChange}
      />

      {activeMode === 'chat' ? (
        <Tabs defaultValue="prompt" className="flex-1 flex flex-col">
          <TabsList className="w-full grid grid-cols-2 rounded-none border-b bg-transparent h-8 p-0.5 gap-0.5 flex-shrink-0">
            <TabsTrigger 
              value="prompt"
              className="text-[10px] h-full rounded data-[state=active]:bg-[#F5F5F5] dark:data-[state=active]:bg-zinc-800 data-[state=active]:shadow-none flex items-center gap-1"
            >
              <MessageSquare className="w-2.5 h-2.5" />
              Prompt
            </TabsTrigger>
            <TabsTrigger 
              value="history"
              className="text-[10px] h-full rounded data-[state=active]:bg-[#F5F5F5] dark:data-[state=active]:bg-zinc-800 data-[state=active]:shadow-none flex items-center gap-1"
            >
              <History className="w-2.5 h-2.5" />
              History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="prompt" className="flex-1 flex flex-col m-0 min-h-0">
            <ScrollArea className="flex-1 p-2">
              <div className="space-y-2">
                {messages.length === 0 ? (
                  <div className="text-[10px] text-muted-foreground text-center py-6">
                    <MessageSquare className="w-6 h-6 mx-auto mb-2 text-primary/50" />
                    <p>Start a conversation with AI</p>
                    <p className="mt-1">Ask me to create or modify components</p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`text-[10px] p-1.5 rounded ${
                        message.role === 'user'
                          ? 'bg-primary/10 ml-3'
                          : 'bg-muted mr-3'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    </div>
                  ))
                )}
                {isLoading && (
                  <div className="text-[10px] text-muted-foreground italic p-1.5">
                    AI is thinking...
                  </div>
                )}
              </div>
            </ScrollArea>

            <div className="p-2 border-t space-y-1.5 flex-shrink-0">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask AI to create or modify components..."
                className="text-[10px] resize-none min-h-[50px]"
                disabled={isLoading}
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="w-full h-6 text-[10px]"
              >
                <Send className="w-2.5 h-2.5 mr-1" />
                Send
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="history" className="flex-1 m-0 overflow-y-auto">
            <ScrollArea className="h-full p-2">
              {messages.length === 0 ? (
                <div className="text-[10px] text-muted-foreground text-center py-6">
                  <History className="w-6 h-6 mx-auto mb-2 text-muted-foreground/50" />
                  <p>No conversation history yet</p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className="text-[10px] p-1.5 rounded bg-muted hover:bg-muted/80 cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="font-medium text-[9px] text-muted-foreground">
                          {message.role === 'user' ? 'You' : 'AI'}
                        </span>
                        <span className="text-[9px] text-muted-foreground">
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
      ) : (
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1.5">
            <p className="text-[10px] text-muted-foreground mb-2">Import from external sources</p>
            {importOptions.map((option) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.id}
                  onClick={() => handleFileUpload(option.id)}
                  className="w-full flex items-center gap-2 p-2 rounded border border-dashed border-border hover:border-primary hover:bg-accent/50 transition-all text-[10px] text-muted-foreground hover:text-foreground"
                >
                  <Icon className="w-3 h-3" />
                  <span>{option.label}</span>
                </button>
              );
            })}
          </div>
        </ScrollArea>
      )}

      {/* AI Settings Dialog */}
      <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
        <DialogContent className="sm:max-w-[320px] p-4">
          <DialogHeader className="pb-2">
            <DialogTitle className="text-sm">AI Settings</DialogTitle>
            <DialogDescription className="text-[10px]">
              Configure your AI provider and API key
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label className="text-[10px]">Provider</Label>
              <select 
                value={selectedProvider}
                onChange={(e) => setSelectedProvider(e.target.value)}
                className="w-full h-7 px-2 text-[10px] border border-border rounded bg-background"
              >
                <option value="openai">OpenAI</option>
                <option value="anthropic">Anthropic</option>
                <option value="gemini">Google Gemini</option>
                <option value="custom">Custom Endpoint</option>
              </select>
            </div>
            <div className="space-y-1">
              <Label className="text-[10px]">API Key</Label>
              <Input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your API key..."
                className="h-7 text-[10px]"
              />
            </div>
          </div>
          <DialogFooter className="pt-3">
            <Button variant="outline" size="sm" onClick={() => setShowSettingsDialog(false)} className="h-6 text-[10px]">
              Cancel
            </Button>
            <Button size="sm" onClick={handleSaveSettings} className="h-6 text-[10px]">
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
