import React, { useState, useRef, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ArrowUp, Plus, Sparkles, MessageSquare, FileCode, FileText, Image, Figma, History, Wrench, Settings, Trash2, Eye, EyeOff, X } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useAISettingsStore, AI_PROVIDERS, AIProvider } from '../store/useAISettingsStore';
import { useChatStore } from '../store/useChatStore';
import { streamChat, AIMessage } from '../services/aiService';
import { parseAIResponse, flattenInstances } from '../utils/aiComponentGenerator';
import { useStyleStore } from '../store/useStyleStore';
import { useBuilderStore } from '../store/useBuilderStore';
import { toast } from 'sonner';

type ChatMode = 'build' | 'discuss';

export const AIChat: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');

  // AI Settings Store
  const {
    provider,
    apiKey,
    model,
    customEndpoint,
    customModel,
    lastChatMode,
    setProvider,
    setApiKey,
    setModel,
    setCustomEndpoint,
    setCustomModel,
    setLastChatMode,
    isConfigured,
    getProviderConfig,
  } = useAISettingsStore();

  // Chat Store
  const {
    sessions,
    currentSessionId,
    createSession,
    addMessage,
    updateLastAssistantMessage,
    deleteSession,
    setCurrentSession,
    getCurrentSession,
  } = useChatStore();

  // Builder Store
  const { addInstance, setSelectedInstanceId } = useBuilderStore();

  // Style Store
  const { createStyleSource, setStyle } = useStyleStore();

  const [chatMode, setChatMode] = useState<ChatMode>(lastChatMode);
  const currentSession = getCurrentSession();
  const messages = currentSession?.messages || [];
  // Sync chat mode to store
  useEffect(() => {
    setLastChatMode(chatMode);
  }, [chatMode, setLastChatMode]);

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, streamingContent]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    if (!isConfigured()) {
      setShowSettingsDialog(true);
      return;
    }

    const userMessageContent = input.trim();
    setInput('');
    setIsLoading(true);
    setStreamingContent('');

    // Add user message
    addMessage({
      role: 'user',
      content: userMessageContent,
      timestamp: Date.now(),
      mode: chatMode,
    });

    // Build messages array for AI
    const aiMessages: AIMessage[] = messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));
    aiMessages.push({ role: 'user', content: userMessageContent });

    let fullResponse = '';

    try {
      await streamChat({
        provider,
        apiKey,
        model: provider === 'custom' ? customModel : model,
        customEndpoint,
        messages: aiMessages,
        mode: chatMode,
        onDelta: (text) => {
          fullResponse += text;
          setStreamingContent(fullResponse);
        },
        onDone: () => {
          // Add assistant message to store
          addMessage({
            role: 'assistant',
            content: fullResponse,
            timestamp: Date.now(),
            mode: chatMode,
          });

          // Handle build mode - parse and add components
          if (chatMode === 'build') {
            const parsed = parseAIResponse(fullResponse);
            if (parsed && parsed.action === 'create' && parsed.components.length > 0) {
              for (const componentSpec of parsed.components) {
                const { instances, styleSources: newStyleSources, rootInstanceId } = flattenInstances(componentSpec, 'root');

                // Add style sources first
                for (const [styleSourceId, styles] of Object.entries(newStyleSources)) {
                  createStyleSource('local', styleSourceId);
                  for (const [property, value] of Object.entries(styles)) {
                    setStyle(styleSourceId, property, value);
                  }
                }

                // Find the root instance (the one we just built)
                const rootInstance = instances.find(i => i.id === rootInstanceId);
                if (rootInstance) {
                  addInstance(rootInstance, 'root');
                  setSelectedInstanceId(rootInstanceId);
                }
              }
            }
          }

          setStreamingContent('');
          setIsLoading(false);
        },
        onError: (error) => {
          console.error('AI Error:', error);
          addMessage({
            role: 'assistant',
            content: `Error: ${error.message}`,
            timestamp: Date.now(),
            mode: chatMode,
          });
          setStreamingContent('');
          setIsLoading(false);
        },
      });
    } catch (error) {
      console.error('Stream error:', error);
      setStreamingContent('');
      setIsLoading(false);
    }
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
    }
  };

  const handleNewChat = () => {
    createSession();
  };

  const formatTimestamp = (timestamp: number): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday = date.toDateString() === yesterday.toDateString();

    if (isToday) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (isYesterday) return 'Yesterday';
    return date.toLocaleDateString();
  };

  const providerConfig = getProviderConfig();

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
    <div className="flex flex-col h-full min-h-0 overflow-hidden">
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Top Tabs */}
      <Tabs defaultValue="chat" className="flex-1 flex flex-col min-h-0">
        <div className="flex items-center border-b">
          <TabsList className="flex-1 grid grid-cols-2 rounded-none bg-transparent h-8 p-0.5 gap-0.5">
            <TabsTrigger
              value="chat"
              className="text-[10px] h-full rounded data-[state=active]:bg-[#F5F5F5] dark:data-[state=active]:bg-zinc-800 data-[state=active]:shadow-none flex items-center gap-1"
            >
              <MessageSquare className="w-2.5 h-2.5" />
              Chat
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="text-[10px] h-full rounded data-[state=active]:bg-[#F5F5F5] dark:data-[state=active]:bg-zinc-800 data-[state=active]:shadow-none flex items-center gap-1"
            >
              <History className="w-2.5 h-2.5" />
              History
            </TabsTrigger>
          </TabsList>
          <button
            onClick={() => setShowSettingsDialog(true)}
            className="p-1.5 mr-1 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            title="AI Settings"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
        </div>

      <TabsContent value="chat" className="flex-1 flex flex-col m-0 min-h-0 overflow-hidden">
          {/* Messages Area */}
          <ScrollArea className="flex-1 min-h-0 [&_[data-radix-scroll-area-scrollbar]]:opacity-0 [&:hover_[data-radix-scroll-area-scrollbar]]:opacity-100 [&_[data-radix-scroll-area-scrollbar]]:transition-opacity">
            <div ref={scrollRef} className="space-y-2 p-2">
              {!isConfigured() ? (
                <div className="text-[10px] text-muted-foreground text-center py-8">
                  <Settings className="w-6 h-6 mx-auto mb-2 text-muted-foreground/50" />
                  <p className="font-medium">Configure AI to get started</p>
                  <p className="mt-1 text-muted-foreground/70">Add your API key in settings</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowSettingsDialog(true)}
                    className="mt-3 h-6 text-[10px]"
                  >
                    Open Settings
                  </Button>
                </div>
              ) : messages.length === 0 && !streamingContent ? (
                <div className="text-[10px] text-muted-foreground text-center py-8">
                  {chatMode === 'build' ? (
                    <>
                      <Sparkles className="w-6 h-6 mx-auto mb-2 text-primary/50" />
                      <p className="font-medium">Ask AI to build something</p>
                      <p className="mt-1 text-muted-foreground/70">Create or modify components</p>
                    </>
                  ) : (
                    <>
                      <MessageSquare className="w-6 h-6 mx-auto mb-2 text-blue-500/50" />
                      <p className="font-medium">Discuss features and ideas</p>
                      <p className="mt-1 text-muted-foreground/70">Chat about your project</p>
                    </>
                  )}
                </div>
              ) : (
                <>
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`text-[10px] p-2 rounded-lg ${message.role === 'user'
                        ? 'bg-primary text-primary-foreground ml-4'
                        : 'bg-muted mr-4'
                        }`}
                    >
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    </div>
                  ))}
                  {streamingContent && (
                    <div className="text-[10px] p-2 rounded-lg bg-muted mr-4">
                      <p className="whitespace-pre-wrap">{streamingContent}</p>
                    </div>
                  )}
                </>
              )}
              {isLoading && !streamingContent && (
                <div className="text-[10px] text-muted-foreground italic p-2 bg-muted rounded-lg mr-4">
                  <span className="inline-flex items-center gap-1">
                    <span className="animate-pulse">●</span>
                    <span className="animate-pulse animation-delay-100">●</span>
                    <span className="animate-pulse animation-delay-200">●</span>
                  </span>
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="history" className="flex-1 m-0 overflow-hidden flex flex-col justify-start">
          <div className="p-2 border-b">
            <Button
              variant="outline"
              size="sm"
              onClick={handleNewChat}
              className="w-full h-7 text-[10px]"
            >
              <Plus className="w-3 h-3 mr-1" />
              New Chat
            </Button>
          </div>
          <ScrollArea className="flex-1 [&_[data-radix-scroll-area-scrollbar]]:opacity-0 [&:hover_[data-radix-scroll-area-scrollbar]]:opacity-100 [&_[data-radix-scroll-area-scrollbar]]:transition-opacity">
            <div className="p-2">
            {sessions.length === 0 ? (
              <div className="text-[10px] text-muted-foreground text-center py-6">
                <History className="w-6 h-6 mx-auto mb-2 text-muted-foreground/50" />
                <p>No conversation history yet</p>
              </div>
            ) : (
              <div className="space-y-1">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    onClick={() => setCurrentSession(session.id)}
                    className={`text-[10px] p-2 rounded cursor-pointer group flex items-start justify-between gap-2 ${session.id === currentSessionId
                      ? 'bg-primary/10 border border-primary/20'
                      : 'bg-muted hover:bg-muted/80'
                      }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="font-medium truncate">{session.title}</span>
                      </div>
                      <p className="text-muted-foreground truncate">
                        {session.messages[session.messages.length - 1]?.content.slice(0, 50) || 'No messages'}
                      </p>
                      <span className="text-[9px] text-muted-foreground">
                        {formatTimestamp(session.updatedAt)}
                      </span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteSession(session.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>

      {/* Bottom Input Bar - Always visible */}
      <div className="p-2 border-t flex-shrink-0">
        <div className="flex flex-col gap-2 bg-muted/50 rounded-xl px-3 py-2 border border-border">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={chatMode === 'build' ? 'Ask AI to build something...' : 'Discuss features and ideas...'}
            className="min-h-[60px] max-h-[120px] resize-none bg-transparent border-none outline-none text-[11px] p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            disabled={isLoading}
          />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setChatMode(chatMode === 'build' ? 'discuss' : 'build')}
                className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] border transition-colors ${chatMode === 'build'
                  ? 'bg-primary/10 text-primary border-primary/30'
                  : 'bg-blue-500/10 text-blue-500 border-blue-500/30'
                  }`}
                title={chatMode === 'build' ? 'Build Mode - AI makes changes to canvas' : 'Chat Mode - Discuss features'}
              >
                {chatMode === 'build' ? (
                  <>
                    <Wrench className="w-3 h-3" />
                    <span>Build</span>
                  </>
                ) : (
                  <>
                    <MessageSquare className="w-3 h-3" />
                    <span>Chat</span>
                  </>
                )}
              </button>

              <Popover>
                <PopoverTrigger asChild>
                  <button
                    className="p-1.5 rounded-full border border-border hover:bg-background transition-colors text-muted-foreground hover:text-foreground"
                    title="Import"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </PopoverTrigger>
                <PopoverContent side="top" align="start" sideOffset={8} className="w-44 p-1.5 bg-popover border border-border shadow-lg z-50">
                  <div className="space-y-0.5">
                    <p className="text-[9px] text-muted-foreground px-2 py-1 font-medium uppercase tracking-wider">Import from</p>
                    {importOptions.map((option) => {
                      const Icon = option.icon;
                      return (
                        <button
                          key={option.id}
                          onClick={() => handleFileUpload(option.id)}
                          className="w-full flex items-center gap-2.5 px-2 py-2 rounded text-[11px] text-foreground hover:bg-accent transition-colors"
                        >
                          <Icon className="w-4 h-4 text-muted-foreground" />
                          <span>{option.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className={`p-1.5 rounded-full transition-colors ${input.trim() && !isLoading
                ? 'bg-foreground text-background hover:bg-foreground/90'
                : 'bg-muted text-muted-foreground cursor-not-allowed'
                }`}
            >
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* AI Settings Dialog */}
      <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
        <DialogContent className="sm:max-w-[360px] p-4">
          <DialogHeader className="pb-2">
            <DialogTitle className="text-sm">AI Settings</DialogTitle>
            <DialogDescription className="text-[10px]">
              Configure your AI provider and API key
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-[10px]">Provider</Label>
              <select
                value={provider}
                onChange={(e) => setProvider(e.target.value as AIProvider)}
                className="w-full h-8 px-2 text-[11px] border border-border rounded-md bg-background"
              >
                {AI_PROVIDERS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {provider !== 'custom' && (
              <div className="space-y-1.5">
                <Label className="text-[10px]">Model</Label>
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full h-8 px-2 text-[11px] border border-border rounded-md bg-background"
                >
                  {providerConfig.models.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {provider === 'custom' && (
              <>
                <div className="space-y-1.5">
                  <Label className="text-[10px]">Endpoint URL</Label>
                  <Input
                    value={customEndpoint}
                    onChange={(e) => setCustomEndpoint(e.target.value)}
                    placeholder="http://localhost:11434/v1/chat/completions"
                    className="h-8 text-[11px]"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px]">Model Name</Label>
                  <Input
                    value={customModel}
                    onChange={(e) => setCustomModel(e.target.value)}
                    placeholder="llama2"
                    className="h-8 text-[11px]"
                  />
                </div>
              </>
            )}

            {provider !== 'custom' && (
              <div className="space-y-1.5">
                <Label className="text-[10px]">API Key</Label>
                <div className="relative">
                  <Input
                    type={showApiKey ? 'text' : 'password'}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Enter your API key..."
                    className="h-8 text-[11px] pr-8"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showApiKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <p className="text-[9px] text-muted-foreground mt-1">
                  {provider === 'openai' && 'Get your key from platform.openai.com'}
                  {provider === 'anthropic' && 'Get your key from console.anthropic.com'}
                  {provider === 'gemini' && 'Get your key from aistudio.google.com'}
                </p>
              </div>
            )}

            <div className="p-2 rounded-md bg-amber-500/10 border border-amber-500/20">
              <p className="text-[9px] text-amber-600 dark:text-amber-400">
                ⚠️ API keys are stored in your browser's localStorage. Clear settings if using a shared computer.
              </p>
            </div>
          </div>
          <DialogFooter className="pt-4">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-[10px] text-destructive hover:text-destructive"
                >
                  Clear Settings
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-sm">Clear AI Settings?</AlertDialogTitle>
                  <AlertDialogDescription className="text-xs">
                    This will delete your API key and reset all AI settings. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="h-7 text-[10px]">Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => {
                      useAISettingsStore.getState().clearSettings();
                      setShowSettingsDialog(false);
                      toast.success('AI settings cleared');
                    }}
                    className="h-7 text-[10px] bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Clear Settings
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Button
              size="sm"
              onClick={() => setShowSettingsDialog(false)}
              className="h-7 text-[10px]"
            >
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
