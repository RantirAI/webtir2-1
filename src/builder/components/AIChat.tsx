import React, { useState, useRef, useEffect } from 'react';
import { MarkdownRenderer } from './MarkdownRenderer';
import { BuildProgressCard } from './BuildProgressCard';
import { BuildSummaryCard } from './BuildSummaryCard';
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
import { useBuildProgressStore } from '../store/useBuildProgressStore';
import { streamChat, AIMessage } from '../services/aiService';
import { parseAIResponse, flattenInstances, AIUpdateSpec } from '../utils/aiComponentGenerator';
import { useStyleStore } from '../store/useStyleStore';
import { useBuilderStore } from '../store/useBuilderStore';
import { useMediaStore } from '../store/useMediaStore';
import { generateImage } from '../services/aiImageService';
import { toast } from 'sonner';

type ChatMode = 'build' | 'discuss';

export const AIChat: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollAnchorRef = useRef<HTMLDivElement>(null);
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
  const { addInstance, setSelectedInstanceId, findInstance, getSelectedInstance, updateInstance } = useBuilderStore();

  // Style Store
  const { createStyleSource, setStyle, getComputedStyles, styleSources } = useStyleStore();

  // Media Store
  const { addAsset } = useMediaStore();

  // Build Progress Store
  const {
    startBuild,
    setTaskDescription,
    addEdit,
    addStep,
    completeLastStep,
    finishBuild,
    reset: resetBuildProgress,
  } = useBuildProgressStore();

  const [chatMode, setChatMode] = useState<ChatMode>(lastChatMode);
  const currentSession = sessions.find(s => s.id === currentSessionId) || null;
  const messages = currentSession?.messages || [];

  // Build context about selected component for AI
  const buildSelectedComponentContext = (): string => {
    const selectedInstance = getSelectedInstance();
    if (!selectedInstance || selectedInstance.id === 'root') return '';
    
    const computedStyles = getComputedStyles(selectedInstance.styleSourceIds);
    const styleSourceId = selectedInstance.styleSourceIds[0] || '';
    
    return `
## Currently Selected Component
- Type: ${selectedInstance.type}
- ID: ${selectedInstance.id}
- Label: ${selectedInstance.label || selectedInstance.type}
- Style Source ID: ${styleSourceId}

### Current Styles (use these as reference for updates)
\`\`\`json
${JSON.stringify(computedStyles, null, 2)}
\`\`\`

### Current Props
\`\`\`json
${JSON.stringify(selectedInstance.props, null, 2)}
\`\`\`

When updating this component, use targetId: "${styleSourceId}" in the update action.
`;
  };

  // Build page tree context - shows all components on the page
  const buildPageTreeContext = (): string => {
    const rootInstance = useBuilderStore.getState().rootInstance;
    if (!rootInstance || rootInstance.children.length === 0) return '';
    
    const components: Array<{
      id: string;
      type: string;
      label: string;
      styleSourceId: string;
      textContent?: string;
      path: string;
    }> = [];
    
    const traverse = (instance: { id: string; type: string; label?: string; styleSourceIds: string[]; props: Record<string, unknown>; children: unknown[] }, path: string = '') => {
      const currentPath = path ? `${path} > ${instance.label || instance.type}` : instance.label || instance.type;
      
      const textContent = typeof instance.props.children === 'string' 
        ? instance.props.children.slice(0, 50) 
        : undefined;
      
      components.push({
        id: instance.id,
        type: instance.type,
        label: instance.label || instance.type,
        styleSourceId: instance.styleSourceIds[0] || '',
        textContent,
        path: currentPath,
      });
      
      if (Array.isArray(instance.children)) {
        instance.children.forEach((child: unknown) => traverse(child as typeof instance, currentPath));
      }
    };
    
    rootInstance.children.forEach((child: unknown) => traverse(child as Parameters<typeof traverse>[0]));
    
    if (components.length === 0) return '';
    
    return `
## Current Page Components

Here are all components currently on the page. Use styleSourceId as targetId for style changes, or id for prop changes:

| Type | Label | StyleSourceId | Content Preview |
|------|-------|---------------|-----------------|
${components.slice(0, 50).map(c => `| ${c.type} | ${c.label} | ${c.styleSourceId} | ${c.textContent || '-'} |`).join('\n')}
${components.length > 50 ? `\n... and ${components.length - 50} more components` : ''}

When user says "change the heading color" or "update the button text", find the matching component above and use UPDATE action.
`;
  };

  // Helper function to find instance by description/type
  const findInstanceByDescription = (description: string): { id: string; styleSourceIds: string[]; props: Record<string, unknown> } | null => {
    const rootInstance = useBuilderStore.getState().rootInstance;
    const lowerDesc = description.toLowerCase();
    
    const findMatch = (instance: { id: string; type: string; label?: string; styleSourceIds: string[]; props: Record<string, unknown>; children: unknown[] }): typeof instance | null => {
      const label = (instance.label || '').toLowerCase();
      const type = instance.type.toLowerCase();
      const content = String(instance.props.children || '').toLowerCase();
      
      if (label.includes(lowerDesc) || type.includes(lowerDesc) || content.includes(lowerDesc)) {
        return instance;
      }
      
      if (Array.isArray(instance.children)) {
        for (const child of instance.children) {
          const found = findMatch(child as typeof instance);
          if (found) return found;
        }
      }
      return null;
    };
    
    return findMatch(rootInstance as Parameters<typeof findMatch>[0]);
  };

  // Generate a concise task title from the user message
  const generateTaskTitle = (message: string): string => {
    const lowerMsg = message.toLowerCase();
    
    // Detect common patterns
    if (lowerMsg.includes('create') || lowerMsg.includes('build') || lowerMsg.includes('add')) {
      const match = message.match(/(?:create|build|add)\s+(?:a\s+)?(.{5,40}?)(?:\.|$|,|\s+with|\s+that)/i);
      if (match) return `Creating ${match[1]}`;
    }
    if (lowerMsg.includes('update') || lowerMsg.includes('change') || lowerMsg.includes('modify')) {
      const match = message.match(/(?:update|change|modify)\s+(?:the\s+)?(.{5,30}?)(?:\.|$|,|\s+to)/i);
      if (match) return `Updating ${match[1]}`;
    }
    if (lowerMsg.includes('style') || lowerMsg.includes('color') || lowerMsg.includes('font')) {
      return 'Applying styles';
    }
    if (lowerMsg.includes('image') || lowerMsg.includes('photo') || lowerMsg.includes('picture')) {
      return 'Generating image';
    }
    
    // Fallback: truncate message
    return message.length > 35 ? message.slice(0, 32) + '...' : message;
  };

  // Update build description based on partial JSON parsing
  const updateBuildDescription = (partialJson: string) => {
    try {
      // Try to detect action type
      if (partialJson.includes('"action"')) {
        if (partialJson.includes('"create"')) {
          setTaskDescription('Creating components...');
        } else if (partialJson.includes('"update"')) {
          setTaskDescription('Updating styles...');
        } else if (partialJson.includes('"generate-image"')) {
          setTaskDescription('Generating image...');
        }
      }
      
      // Try to detect component types being created
      const typeMatches = partialJson.match(/"type"\s*:\s*"([^"]+)"/g);
      if (typeMatches && typeMatches.length > 0) {
        const types = typeMatches
          .map(m => m.match(/"type"\s*:\s*"([^"]+)"/)?.[1])
          .filter(Boolean)
          .slice(0, 3);
        if (types.length > 0) {
          setTaskDescription(`Building ${types.join(', ')}...`);
        }
      }
    } catch {
      // Ignore parse errors - partial JSON is expected
    }
  };

  // Sync chat mode to store
  useEffect(() => {
    setLastChatMode(chatMode);
  }, [chatMode, setLastChatMode]);

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollAnchorRef.current) {
      scrollAnchorRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, streamingContent]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    if (!isConfigured()) {
      setShowSettingsDialog(true);
      return;
    }

    const userMessageContent = input.trim();
    // Capture mode at send time to prevent issues if user toggles during stream
    const modeAtSend = chatMode;
    
    setInput('');
    setIsLoading(true);
    setStreamingContent('');
    
    // Start build progress tracking for build mode
    if (modeAtSend === 'build') {
      // Generate task title from user message
      const taskTitle = generateTaskTitle(userMessageContent);
      startBuild(taskTitle);
    }

    // Add user message
    addMessage({
      role: 'user',
      content: userMessageContent,
      timestamp: Date.now(),
      mode: modeAtSend,
    });

    // Build messages array for AI - include component context and page tree in build mode
    const componentContext = modeAtSend === 'build' ? buildSelectedComponentContext() : '';
    const pageTreeContext = modeAtSend === 'build' ? buildPageTreeContext() : '';
    const contextualMessage = (componentContext || pageTreeContext)
      ? `${pageTreeContext}\n\n${componentContext}\n\nUser request: ${userMessageContent}`
      : userMessageContent;

    const aiMessages: AIMessage[] = messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));
    aiMessages.push({ role: 'user', content: contextualMessage });

    let fullResponse = '';

    try {
      await streamChat({
        provider,
        apiKey,
        model: provider === 'custom' ? customModel : model,
        customEndpoint,
        messages: aiMessages,
        mode: modeAtSend,
        onDelta: (text) => {
          fullResponse += text;
          // In build mode, show progress card instead of raw JSON
          if (modeAtSend === 'build') {
            // Try to detect what's being built from partial JSON
            updateBuildDescription(fullResponse);
            // Don't show streaming content in build mode - BuildProgressCard handles display
          } else {
            setStreamingContent(fullResponse);
          }
        },
        onDone: async () => {
          let displayMessage = '';
          let componentsBuilt = false;

          // Handle build mode - parse and process actions
          if (modeAtSend === 'build') {
            console.log('Parsing AI response for build mode...');
            const parsed = parseAIResponse(fullResponse);
            console.log('Parsed result:', parsed);
            
            // Handle CREATE action
            if (parsed && parsed.action === 'create' && parsed.components && parsed.components.length > 0) {
              console.log('Processing CREATE action with', parsed.components.length, 'components');
              
              // Add step for reading component structure
              addStep({
                type: 'reading',
                description: 'Reading component structure',
                detail: `Found ${parsed.components.length} component${parsed.components.length > 1 ? 's' : ''} to create`,
              });
              
              for (const componentSpec of parsed.components) {
                try {
                  // Add step for creating this component
                  addStep({
                    type: 'creating',
                    description: `Creating ${componentSpec.type || 'component'}`,
                    target: componentSpec.label || componentSpec.type,
                  });
                  
                  const { instances, styleSources: newStyleSources, rootInstanceId } = flattenInstances(componentSpec, 'root');
                  console.log('Flattened instances:', instances.length, 'Root ID:', rootInstanceId);

                  // Add step for applying styles
                  if (Object.keys(newStyleSources).length > 0) {
                    addStep({
                      type: 'styling',
                      description: 'Applying styles',
                      detail: `${Object.keys(newStyleSources).length} style source${Object.keys(newStyleSources).length > 1 ? 's' : ''}`,
                    });
                  }
                  
                  // Add style sources with breakpoint support
                  for (const [styleSourceId, breakpointStyles] of Object.entries(newStyleSources)) {
                    createStyleSource('local', styleSourceId);
                    
                    // Apply base styles
                    if (breakpointStyles.base) {
                      for (const [property, value] of Object.entries(breakpointStyles.base)) {
                        setStyle(styleSourceId, property, value, 'base', 'default');
                      }
                    }
                    
                    // Apply tablet styles
                    if (breakpointStyles.tablet) {
                      for (const [property, value] of Object.entries(breakpointStyles.tablet)) {
                        setStyle(styleSourceId, property, value, 'tablet', 'default');
                      }
                    }
                    
                    // Apply mobile styles
                    if (breakpointStyles.mobile) {
                      for (const [property, value] of Object.entries(breakpointStyles.mobile)) {
                        setStyle(styleSourceId, property, value, 'mobile', 'default');
                      }
                    }
                  }

                  // Find the root instance (the one we just built)
                  const rootInstance = instances.find(i => i.id === rootInstanceId);
                  if (rootInstance) {
                    addInstance(rootInstance, 'root');
                    setSelectedInstanceId(rootInstanceId);
                    componentsBuilt = true;
                    console.log('Added root instance to canvas:', rootInstance.type);
                    
                    // Track the edit
                    addEdit({
                      type: 'component',
                      name: componentSpec.type || 'Component',
                      action: 'created',
                    });
                  }
                } catch (err) {
                  console.error('Error processing component:', err);
                }
              }
              
              displayMessage = componentsBuilt 
                ? `✓ ${parsed.message || 'Components created successfully!'}`
                : `⚠️ Failed to build components. Please try again.`;
              
              if (componentsBuilt) {
                toast.success('Components built on canvas!');
              }
            }
            
            // Handle UPDATE action
            else if (parsed && parsed.action === 'update' && parsed.updates && parsed.updates.length > 0) {
              console.log('Processing UPDATE action with', parsed.updates.length, 'updates');
              let updatesApplied = 0;
              
              // Add step for processing updates
              addStep({
                type: 'reading',
                description: 'Processing style updates',
                detail: `${parsed.updates.length} update${parsed.updates.length > 1 ? 's' : ''} to apply`,
              });
              
              for (const update of parsed.updates) {
                const { targetId, styles, responsiveStyles, props } = update;
                
                // Try to resolve targetId - it could be a style source ID or instance ID
                let styleSourceId = targetId;
                let instanceId = targetId;
                
                // If not a style source, try to find the instance and get its style source
                if (!styleSources[targetId]) {
                  const instance = findInstance(targetId);
                  if (instance && instance.styleSourceIds.length > 0) {
                    styleSourceId = instance.styleSourceIds[0];
                    instanceId = instance.id;
                  } else {
                    // Try finding by label/type match (fallback for when AI uses descriptive IDs)
                    const matchedInstance = findInstanceByDescription(targetId);
                    if (matchedInstance) {
                      styleSourceId = matchedInstance.styleSourceIds[0];
                      instanceId = matchedInstance.id;
                    }
                  }
                }
                
                // Apply base styles
                if (styles && styleSourceId && styleSources[styleSourceId]) {
                  // Add step for this specific update
                  addStep({
                    type: 'styling',
                    description: 'Updating styles',
                    target: targetId,
                  });
                  
                  for (const [property, value] of Object.entries(styles)) {
                    setStyle(styleSourceId, property, value, 'base', 'default');
                  }
                  updatesApplied++;
                  
                  // Track the style edit
                  addEdit({
                    type: 'style',
                    name: targetId,
                    action: 'updated',
                  });
                }
                
                // Apply tablet styles
                if (responsiveStyles?.tablet && styleSourceId) {
                  for (const [property, value] of Object.entries(responsiveStyles.tablet)) {
                    setStyle(styleSourceId, property, value, 'tablet', 'default');
                  }
                }
                
                // Apply mobile styles
                if (responsiveStyles?.mobile && styleSourceId) {
                  for (const [property, value] of Object.entries(responsiveStyles.mobile)) {
                    setStyle(styleSourceId, property, value, 'mobile', 'default');
                  }
                }
                
                // Update props if provided
                if (props) {
                  const instance = findInstance(instanceId);
                  if (instance) {
                    updateInstance(instanceId, { props: { ...instance.props, ...props } });
                    updatesApplied++;
                    
                    // Track the prop edit
                    addEdit({
                      type: 'prop',
                      name: instance.type || targetId,
                      action: 'updated',
                    });
                  }
                }
              }
              
              displayMessage = updatesApplied > 0 
                ? `✓ ${parsed.message || 'Styles updated successfully!'}`
                : `⚠️ Could not find components to update. Try selecting the component first.`;
              
              if (updatesApplied > 0) {
                toast.success('Component updated');
              } else {
                toast.warning('No components found to update');
              }
            }
            
            // Handle IMAGE GENERATION action
            else if (parsed && parsed.action === 'generate-image' && parsed.imageSpec) {
              const { prompt, type, style, targetComponent } = parsed.imageSpec;
              
              // Add step for image generation
              addStep({
                type: 'generating',
                description: 'Generating AI image',
                detail: prompt.substring(0, 50) + (prompt.length > 50 ? '...' : ''),
              });
              
              displayMessage = parsed.message || 'Generating image...';
              
              // Generate image using AI
              try {
                const result = await generateImage(apiKey, { prompt, type, style });
                
                if (result.imageUrl) {
                  // Add to media library
                  addAsset({
                    name: `AI Generated ${type}`,
                    url: result.imageUrl,
                    type: 'image',
                    mimeType: 'image/png',
                    size: 0,
                    altText: prompt,
                  });
                  
                  // Update target component if specified
                  if (targetComponent) {
                    const instance = findInstance(targetComponent);
                    if (instance && instance.type === 'Image') {
                      updateInstance(targetComponent, { 
                        props: { ...instance.props, src: result.imageUrl } 
                      });
                    }
                  }
                  
                  displayMessage = `✓ Image generated successfully! Added to media library.`;
                  toast.success('Image generated and added to media library');
                } else {
                  displayMessage = `Failed to generate image: ${result.error || 'Unknown error'}`;
                  toast.error('Image generation failed');
                }
              } catch (error) {
                displayMessage = `Failed to generate image: ${error instanceof Error ? error.message : 'Unknown error'}`;
                toast.error('Image generation failed');
              }
            }
            
            // Handle DELETE action
            else if (parsed && parsed.action === 'delete') {
              displayMessage = `✓ ${parsed.message || 'Components deleted successfully!'}`;
            }
            
            // If we couldn't parse a valid action in build mode
            else if (!parsed) {
              // Check if response looks like JSON (failed parse) vs conversation
              const looksLikeJSON = fullResponse.includes('"action"') || fullResponse.includes('"components"');
              const hasMarkdownCodeBlock = fullResponse.includes('```');
              
              if (looksLikeJSON || hasMarkdownCodeBlock) {
                console.warn('AI returned malformed JSON or wrapped in markdown:', fullResponse.substring(0, 200));
                displayMessage = '⚠️ I had trouble processing that request. Please try again with a simpler request.';
              } else {
                // It's a conversational response - the AI ignored JSON instruction
                console.warn('AI returned conversational text instead of JSON in build mode');
                displayMessage = '⚠️ Let me try that again. Please describe what you want to build.';
              }
              toast.error('Failed to build - try again');
            }
          } else {
            // Discuss mode - check if AI accidentally returned JSON
            const parsed = parseAIResponse(fullResponse);
            if (parsed && parsed.action) {
              // AI returned build instructions in discuss mode
              displayMessage = `I can help with that! Switch to **Build mode** to create: ${parsed.message || 'components'}`;
            } else {
              // Normal conversation
              displayMessage = fullResponse;
            }
          }

          // Finish build progress tracking and get summary
          let buildSummary = undefined;
          if (modeAtSend === 'build') {
            const summary = finishBuild();
            // Store the success message in the summary, clear displayMessage for build mode
            buildSummary = {
              ...summary,
              message: displayMessage.replace(/^[✓⚠️]\s*/, '') || 'Build completed successfully!',
            };
            // For build mode, we don't show the message text - the summary card handles it
            displayMessage = '';
          }

          // Add assistant message to store with build summary
          addMessage({
            role: 'assistant',
            content: displayMessage,
            timestamp: Date.now(),
            mode: modeAtSend,
            buildSummary,
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
            mode: modeAtSend,
          });
          setStreamingContent('');
          setIsLoading(false);
          
          // Reset build progress on error
          if (modeAtSend === 'build') {
            resetBuildProgress();
          }
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
          <ScrollArea className="flex-1 min-h-0 [&_[data-radix-scroll-area-viewport]]:overflow-x-hidden [&_[data-radix-scroll-area-scrollbar]]:opacity-0 [&:hover_[data-radix-scroll-area-scrollbar]]:opacity-100 [&_[data-radix-scroll-area-scrollbar]]:transition-opacity">
            <div ref={scrollRef} className="min-h-full flex flex-col justify-end space-y-2 p-2 overflow-x-hidden">
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
                      className={`text-[10px] p-2 rounded-lg min-w-0 overflow-hidden max-w-[calc(100%-1rem)] ${message.role === 'user'
                        ? 'bg-primary text-primary-foreground ml-4'
                        : 'bg-muted mr-4'
                        }`}
                    >
                      {message.role === 'assistant' ? (
                        message.buildSummary ? (
                          // Build mode: show ONLY the unified summary card
                          <BuildSummaryCard summary={message.buildSummary} />
                        ) : (
                          // Discuss mode: show markdown content
                          <MarkdownRenderer content={message.content} />
                        )
                      ) : (
                        <p className="whitespace-pre-wrap break-all">{message.content}</p>
                      )}
                    </div>
                  ))}
                  {streamingContent && (
                    <div className="text-[10px] p-2 rounded-lg bg-muted mr-4 min-w-0 overflow-hidden max-w-[calc(100%-1rem)]">
                      <MarkdownRenderer content={streamingContent} />
                    </div>
                  )}
                </>
              )}
              {/* Build mode: show BuildProgressCard only while loading */}
              {chatMode === 'build' && isLoading && <BuildProgressCard />}
              
              {/* Loading indicator for discuss mode */}
              {isLoading && !streamingContent && chatMode === 'discuss' && (
                <div className="text-[10px] text-muted-foreground italic p-2 bg-muted rounded-lg mr-4 max-w-full overflow-hidden">
                  <span className="inline-flex items-center gap-1">
                    <span className="animate-pulse">●</span>
                    <span className="animate-pulse animation-delay-100">●</span>
                    <span className="animate-pulse animation-delay-200">●</span>
                  </span>
                </div>
              )}
              <div ref={scrollAnchorRef} />
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
