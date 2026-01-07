import React, { useState, useRef, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ArrowUp, Plus, Sparkles, MessageSquare, FileCode, FileText, Image, Figma, Wrench, Settings, Eye, EyeOff, X, History, Trash2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  const currentSession = sessions.find(s => s.id === currentSessionId) || null;
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
          let displayMessage = fullResponse;

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
              // Use friendly message instead of raw JSON
              displayMessage = parsed.message || '✓ Components created successfully!';
            } else if (parsed && parsed.action === 'update') {
              displayMessage = parsed.message || '✓ Components updated successfully!';
            } else if (parsed && parsed.action === 'delete') {
              displayMessage = parsed.message || '✓ Components deleted successfully!';
            }
          }

          // Add assistant message to store
          addMessage({
            role: 'assistant',
            content: displayMessage,
            timestamp: Date.now(),
            mode: chatMode,
          });

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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileType = file.type;
    const fileName = file.name.toLowerCase();

    try {
      // Handle images - add reference to input
      if (fileType.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const base64 = event.target?.result as string;
          setInput(prev => prev + `\n[Image attached: ${file.name}]`);
          toast.success(`Image "${file.name}" attached`);
        };
        reader.readAsDataURL(file);
      }
      // Handle text files (TXT, HTML, CSS, JS)
      else if (fileName.endsWith('.txt') || fileName.endsWith('.html') || 
               fileName.endsWith('.htm') || fileName.endsWith('.css') || 
               fileName.endsWith('.js')) {
        const text = await file.text();
        setInput(prev => {
          const prefix = prev ? prev + '\n\n' : '';
          return prefix + `[Content from ${file.name}]:\n\`\`\`\n${text}\n\`\`\``;
        });
        toast.success(`"${file.name}" content added to input`);
      }
      // Handle PDF
      else if (fileName.endsWith('.pdf')) {
        toast.info(`PDF import for "${file.name}" - paste the content or use a PDF-to-text converter`);
      }
      // Generic file
      else {
        toast.info(`File "${file.name}" selected - paste the code content manually`);
      }
    } catch (error) {
      toast.error(`Failed to read file: ${file.name}`);
    }

    // Reset input to allow re-selecting same file
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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

  const [activeTab, setActiveTab] = useState<'chat' | 'history'>('chat');

  const handleSelectSession = (sessionId: string) => {
    setCurrentSession(sessionId);
    setActiveTab('chat');
  };

  const handleDeleteSession = (sessionId: string) => {
    deleteSession(sessionId);
  };

  const getSessionTitle = (session: typeof sessions[0]) => {
    const firstUserMessage = session.messages.find(m => m.role === 'user');
    if (firstUserMessage) {
      return firstUserMessage.content.slice(0, 30) + (firstUserMessage.content.length > 30 ? '...' : '');
    }
    return 'New Chat';
  };

  return (
    <div className="flex flex-col h-full min-h-0 overflow-hidden">
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileChange}
      />

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'chat' | 'history')} className="flex flex-col h-full min-h-0 overflow-hidden">
        {/* Tab Header */}
        <TabsList className="flex items-center justify-between border-b h-8 px-3 bg-transparent rounded-none w-full">
          <TabsTrigger
            value="chat"
            className="flex items-center gap-1.5 text-[10px] px-0 py-1 rounded-none data-[state=active]:text-foreground text-muted-foreground bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none h-8"
          >
            <MessageSquare className="w-3 h-3" />
            Chat
          </TabsTrigger>
          <TabsTrigger
            value="history"
            className="flex items-center gap-1.5 text-[10px] px-0 py-1 rounded-none data-[state=active]:text-foreground text-muted-foreground bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none h-8"
          >
            <History className="w-3 h-3" />
            History
          </TabsTrigger>
          <button
            onClick={() => setShowSettingsDialog(true)}
            className="p-1 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            title="AI Settings"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
        </TabsList>

        {/* Chat Tab Content */}
        <TabsContent value="chat" className="flex-1 flex flex-col min-h-0 overflow-hidden mt-0 data-[state=inactive]:hidden">
          {/* Messages Area */}
          <ScrollArea className="flex-1 min-h-0 [&_[data-radix-scroll-area-scrollbar]]:opacity-0 [&:hover_[data-radix-scroll-area-scrollbar]]:opacity-100 [&_[data-radix-scroll-area-scrollbar]]:transition-opacity">
            <div ref={scrollRef} className="min-h-full flex flex-col justify-end space-y-2 p-2">
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

          {/* Bottom Input Bar - Only in Chat Tab */}
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
        </TabsContent>

        {/* History Tab Content */}
        <TabsContent value="history" className="flex-1 flex flex-col min-h-0 overflow-hidden mt-0 data-[state=inactive]:hidden">
          <ScrollArea className="flex-1 min-h-0">
            <div className="p-2 space-y-1">
              <button
                onClick={handleNewChat}
                className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-[10px] text-primary hover:bg-primary/10 transition-colors border border-dashed border-primary/30"
              >
                <Plus className="w-3.5 h-3.5" />
                New Chat
              </button>

              {sessions.length === 0 ? (
                <div className="text-[10px] text-muted-foreground text-center py-8">
                  <History className="w-6 h-6 mx-auto mb-2 text-muted-foreground/50" />
                  <p>No chat history yet</p>
                </div>
              ) : (
                sessions.map((session) => (
                  <div
                    key={session.id}
                    className={`group flex items-center gap-2 px-2 py-2 rounded-lg text-[10px] cursor-pointer transition-colors ${
                      session.id === currentSessionId
                        ? 'bg-primary/10 text-foreground'
                        : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                    }`}
                    onClick={() => handleSelectSession(session.id)}
                  >
                    <MessageSquare className="w-3 h-3 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="truncate font-medium">{getSessionTitle(session)}</p>
                      <p className="text-[9px] text-muted-foreground">
                        {formatTimestamp(session.updatedAt)}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSession(session.id);
                      }}
                      className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Delete session"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>

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
