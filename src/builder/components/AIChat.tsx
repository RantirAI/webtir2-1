import React, { useState, useRef, useEffect } from 'react';
import { MarkdownRenderer } from './MarkdownRenderer';
import { AgenticProgressCard } from './AgenticProgressCard';
import { AgenticSummaryCard } from './AgenticSummaryCard';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ArrowUp, Plus, Sparkles, MessageSquare, FileCode, FileText, Image as ImageIcon, Wrench, Settings, Eye, EyeOff, X, History, Trash2, Package, Upload, ClipboardPaste, ChevronRight } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useAISettingsStore, AI_PROVIDERS, AIProvider } from '../store/useAISettingsStore';
import { useChatStore } from '../store/useChatStore';
import { useBuildProgressStore } from '../store/useBuildProgressStore';
import { streamChat, AIMessage } from '../services/aiService';
import { parseAIResponse, flattenInstances, AIUpdateSpec, detectIncompletePage, detectTruncatedJSON } from '../utils/aiComponentGenerator';
import { inspectClipboard, parseWebflowData, ClipboardSource } from '../utils/clipboardInspector';
import { translateWebflowToWebtir, getWebflowDataSummary } from '../utils/webflowTranslator';
import { normalizeComponentBase, findMaxIndexForBase } from '../utils/autoClassSystem';
import { useStyleStore } from '../store/useStyleStore';
import { useBuilderStore } from '../store/useBuilderStore';
import { useMediaStore } from '../store/useMediaStore';
import { generateImage } from '../services/aiImageService';
import { toast } from 'sonner';

// Import platform icons
import webflowIcon from '@/assets/webflow-icon.png';
import figmaIcon from '@/assets/figma-icon.jpg';
import framerIcon from '@/assets/framer-icon.png';
import wordpressIcon from '@/assets/wordpress-icon.png';
import shopifyIcon from '@/assets/shopify-icon.png';

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
  const [originalRequest, setOriginalRequest] = useState('');
  const [pendingContinuation, setPendingContinuation] = useState(false);
  const [showPasteDialog, setShowPasteDialog] = useState<'webflow' | 'figma' | 'framer' | null>(null);
  const [pasteCode, setPasteCode] = useState('');

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
    setTruncated,
    addAgentMessage,
    setStreamingIntent,
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

  // Build page tree context - COMPACT version: only top-level sections to save tokens
  const buildPageTreeContext = (): string => {
    const rootInstance = useBuilderStore.getState().rootInstance;
    if (!rootInstance || rootInstance.children.length === 0) return '';
    
    // Only include top-level sections (direct children of root)
    const sections = rootInstance.children.map((child: unknown, index: number) => {
      const instance = child as { id: string; type: string; label?: string; styleSourceIds: string[]; props: Record<string, unknown>; children: unknown[] };
      const childCount = Array.isArray(instance.children) ? instance.children.length : 0;
      return {
        index: index + 1,
        type: instance.type,
        label: instance.label || instance.type,
        styleSourceId: instance.styleSourceIds[0] || '',
        childCount,
      };
    });
    
    if (sections.length === 0) return '';
    
    return `
## Current Page Sections (${sections.length} total)

| # | Type | Label | StyleSourceId | Children |
|---|------|-------|---------------|----------|
${sections.map(s => `| ${s.index} | ${s.type} | ${s.label} | ${s.styleSourceId} | ${s.childCount} |`).join('\n')}

When continuing a build, add NEW sections after these. Do NOT recreate existing sections.
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

  // Generate agentic intent message based on user request
  const generateIntentMessage = (message: string): string => {
    const lowerMsg = message.toLowerCase();
    
    // Landing page / full page
    if (lowerMsg.includes('landing page') || lowerMsg.includes('homepage') || lowerMsg.includes('full page')) {
      const pageMatch = message.match(/(?:landing page|homepage|page)\s+(?:for\s+)?(.{3,30}?)(?:\.|$|,|\s+with)/i);
      const pageName = pageMatch ? pageMatch[1] : 'the page';
      return `I'll create a complete ${pageName} with hero section, features, testimonials, and more.`;
    }
    
    // Specific section creation
    if (lowerMsg.includes('hero section') || lowerMsg.includes('hero')) {
      return "I'll build a hero section with headline, description, and call-to-action buttons.";
    }
    if (lowerMsg.includes('feature') || lowerMsg.includes('features section')) {
      return "I'll create a features section showcasing your key benefits with icons and descriptions.";
    }
    if (lowerMsg.includes('testimonial')) {
      return "I'll design a testimonials section with customer quotes and avatars.";
    }
    if (lowerMsg.includes('pricing')) {
      return "I'll build a pricing section with plan comparisons and CTAs.";
    }
    if (lowerMsg.includes('footer')) {
      return "I'll create a footer with navigation links, social icons, and copyright.";
    }
    if (lowerMsg.includes('navigation') || lowerMsg.includes('navbar') || lowerMsg.includes('header')) {
      return "I'll build a navigation bar with logo, links, and action buttons.";
    }
    
    // Updates and styling
    if (lowerMsg.includes('update') || lowerMsg.includes('change') || lowerMsg.includes('modify')) {
      return "I'll update the component with your requested changes.";
    }
    if (lowerMsg.includes('style') || lowerMsg.includes('color') || lowerMsg.includes('font')) {
      return "I'll apply the style changes to match your requirements.";
    }
    
    // Image generation
    if (lowerMsg.includes('image') || lowerMsg.includes('generate') && lowerMsg.includes('photo')) {
      return "I'll generate an image based on your description.";
    }
    
    // Continue building
    if (lowerMsg.includes('continue')) {
      return "I'll continue building the remaining sections.";
    }
    
    // Generic fallback
    return "I'll analyze your request and build the components you need.";
  };

  // Track which messages we've already added to avoid duplicates
  const addedMessagesRef = useRef<Set<string>>(new Set());

  // Update build description based on partial JSON parsing
  const updateBuildDescription = (partialJson: string) => {
    try {
      // Try to detect action type and add agentic messages
      if (partialJson.includes('"action"')) {
        if (partialJson.includes('"create"') && !addedMessagesRef.current.has('create')) {
          setTaskDescription('Creating components...');
          addAgentMessage('Building the component structure...');
          addedMessagesRef.current.add('create');
        } else if (partialJson.includes('"update"') && !addedMessagesRef.current.has('update')) {
          setTaskDescription('Updating styles...');
          addAgentMessage('Applying your style changes...');
          addedMessagesRef.current.add('update');
        } else if (partialJson.includes('"generate-image"') && !addedMessagesRef.current.has('image')) {
          setTaskDescription('Generating image...');
          addAgentMessage('Creating the image you described...');
          addedMessagesRef.current.add('image');
        }
      }
      
      // Try to detect section types being created
      const labelMatches = partialJson.match(/"label"\s*:\s*"([^"]+)"/g);
      if (labelMatches && labelMatches.length > 0) {
        const labels = labelMatches
          .map(m => m.match(/"label"\s*:\s*"([^"]+)"/)?.[1])
          .filter(Boolean)
          .filter(l => l && l.toLowerCase().includes('section'))
          .slice(-1);
        if (labels.length > 0 && !addedMessagesRef.current.has(labels[0] || '')) {
          const sectionName = labels[0];
          addAgentMessage(`Creating ${sectionName}...`);
          addedMessagesRef.current.add(sectionName || '');
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
  
  // Reset the added messages tracker when starting a new build
  useEffect(() => {
    if (!isLoading) {
      addedMessagesRef.current.clear();
    }
  }, [isLoading]);

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

  // Handle pending continuation for incomplete pages
  useEffect(() => {
    if (pendingContinuation && !isLoading) {
      const rootInstance = useBuilderStore.getState().rootInstance;
      const existingSections = rootInstance.children.map((c: { label?: string; type: string }) => c.label || c.type).join(', ');
      
      const continueMessage = `Continue building the remaining sections. Currently on canvas: ${existingSections}. 
Do NOT recreate any existing sections - only add NEW sections that weren't created yet.
Add what's missing: Features, Testimonials, Pricing, CTA, Footer, etc.`;
      
      console.log('Executing pending continuation...');
      toast.info('Continuing to build remaining sections...');
      setPendingContinuation(false);
      setInput(continueMessage);
      
      // Trigger send after state updates
      setTimeout(() => {
        const sendButton = document.querySelector('[data-send-button]') as HTMLButtonElement;
        if (sendButton) sendButton.click();
      }, 200);
    }
  }, [pendingContinuation, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    if (!isConfigured()) {
      setShowSettingsDialog(true);
      return;
    }

    const userMessageContent = input.trim();
    // Capture mode at send time to prevent issues if user toggles during stream
    const modeAtSend = chatMode;
    
    // Store original request for page completeness check
    if (!userMessageContent.toLowerCase().includes('continue building')) {
      setOriginalRequest(userMessageContent);
    }
    
    setInput('');
    setIsLoading(true);
    setStreamingContent('');
    
    // Start build progress tracking for build mode
    if (modeAtSend === 'build') {
      // Generate task title and intent message
      const taskTitle = generateTaskTitle(userMessageContent);
      const intentMessage = generateIntentMessage(userMessageContent);
      startBuild(taskTitle, intentMessage);
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
              
              // Create semantic class name generator using style store
              const { styleSources, createStyleSource: createStyleSourceFn } = useStyleStore.getState();
              
              // Get existing class names for uniqueness checking
              const existingNames = new Set(
                Object.values(styleSources)
                  .filter(s => s.type === 'local')
                  .map(s => s.name)
              );
              
              const getSemanticClassName = (componentType: string, label?: string): string => {
                let baseName: string;
                
                // If AI provided a semantic label, use it as the base name
                if (label && label.toLowerCase() !== componentType.toLowerCase()) {
                  // Convert label to valid class name: "Hero Section" → "hero-section"
                  baseName = label
                    .toLowerCase()
                    .trim()
                    .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
                    .replace(/\s+/g, '-')         // Spaces to hyphens
                    .replace(/-+/g, '-')          // Collapse multiple hyphens
                    .replace(/^-|-$/g, '');       // Trim leading/trailing hyphens
                  
                  // If the semantic name is too short or generic, fall back to type-based
                  if (baseName.length < 2) {
                    baseName = normalizeComponentBase(componentType);
                  }
                } else {
                  // Fall back to component type (e.g., "Section" → "section")
                  baseName = normalizeComponentBase(componentType);
                }
                
                // Generate unique name by finding next available index
                // First, try the base name without a number (e.g., "hero-section")
                if (!existingNames.has(baseName)) {
                  existingNames.add(baseName); // Track it to prevent duplicates in same batch
                  const actualId = createStyleSourceFn('local', baseName);
                  return actualId;
                }
                
                // If base name exists, find next available index
                const maxIndex = findMaxIndexForBase(baseName, existingNames);
                const nextIndex = maxIndex > 0 ? maxIndex + 1 : 2;
                const numberedName = `${baseName}-${nextIndex}`;
                existingNames.add(numberedName); // Track it
                
                const actualId = createStyleSourceFn('local', numberedName);
                return actualId;
              };
              
              for (const componentSpec of parsed.components) {
                try {
                  // Add step for creating this component
                  addStep({
                    type: 'creating',
                    description: `Creating ${componentSpec.type || 'component'}`,
                    target: componentSpec.label || componentSpec.type,
                  });
                  
                  const { instances, styleSources: newStyleSources, rootInstanceId } = flattenInstances(
                    componentSpec, 
                    'root',
                    getSemanticClassName
                  );
                  console.log('Flattened instances:', instances.length, 'Root ID:', rootInstanceId);

                  // Add step for applying styles
                  if (Object.keys(newStyleSources).length > 0) {
                    addStep({
                      type: 'styling',
                      description: 'Applying styles',
                      detail: `${Object.keys(newStyleSources).length} style source${Object.keys(newStyleSources).length > 1 ? 's' : ''}`,
                    });
                  }
                  
                  // Apply styles (style sources already created in getSemanticClassName)
                  for (const [styleSourceId, breakpointStyles] of Object.entries(newStyleSources)) {
                    
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
              
              // Check for truncation and trigger auto-continue
              // This now also handles cases where JSON was cut mid-stream
              const shouldAutoContinue = parsed.wasTruncated && parsed.truncatedCount && parsed.truncatedCount > 0;
              
              // Also check page completeness for full-page requests
              const rootInstance = useBuilderStore.getState().rootInstance;
              const sectionCount = rootInstance.children.length;
              const sectionLabels = rootInstance.children.map((c: { label?: string; type: string }) => c.label || c.type);
              const pageCheck = detectIncompletePage(originalRequest, sectionCount, sectionLabels);
              
              if (shouldAutoContinue || pageCheck.isIncomplete) {
                const reason = shouldAutoContinue 
                  ? `Truncated (${parsed.truncatedCount} incomplete)` 
                  : pageCheck.reason;
                console.log(`Auto-continue triggered: ${reason}`);
                setTruncated(true, parsed.truncatedCount || 1);
                
                // Use pending continuation state for reliable auto-continue
                setPendingContinuation(true);
              } else {
                setTruncated(false, 0);
              }
              
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
              // detectTruncatedJSON is now imported at top of file
              const wasTruncatedMidStream = detectTruncatedJSON(fullResponse);
              
              if (wasTruncatedMidStream) {
                // JSON was cut mid-stream - use pending continuation
                console.warn('AI response was truncated mid-JSON, triggering auto-continue...');
                displayMessage = 'Response was truncated. Continuing...';
                setTruncated(true, 1);
                setPendingContinuation(true);
              } else {
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
            // Generate summary lines based on what was built
            const summaryLines: string[] = [];
            const summaryMessage = displayMessage.replace(/^[✓⚠️]\s*/, '');
            
            if (componentsBuilt) {
              summaryLines.push('Successfully created the components you requested.');
              if (summaryMessage) {
                summaryLines.push(summaryMessage);
              }
            } else if (summaryMessage) {
              summaryLines.push(summaryMessage);
            } else {
              summaryLines.push('Build completed successfully!');
            }
            
            const summary = finishBuild(summaryLines);
            // Store the success message in the summary, clear displayMessage for build mode
            buildSummary = {
              ...summary,
              message: summaryMessage || 'Build completed successfully!',
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
            type === 'html' ? '.html,.htm' :
              type === 'zip' ? '.zip' : '*/*';
      fileInputRef.current.click();
    }
  };

  // Handle paste import for design tools (Webflow, Figma, Framer)
  const handlePasteImport = (platform: 'webflow' | 'figma' | 'framer') => {
    setShowPasteDialog(platform);
    setPasteCode('');
  };

  // Convert pasted code from design tool
  const handleConvertPaste = () => {
    if (!pasteCode.trim() || !showPasteDialog) return;

    if (showPasteDialog === 'webflow') {
      const wfData = parseWebflowData(pasteCode);
      if (wfData) {
        const instance = translateWebflowToWebtir(wfData);
        if (instance) {
          const { rootInstance } = useBuilderStore.getState();
          addInstance(instance, rootInstance.id);
          const summary = getWebflowDataSummary(wfData);
          toast.success(`Imported ${summary.nodeCount} components from Webflow`);
          setShowPasteDialog(null);
          setPasteCode('');
          return;
        }
      }
      toast.error('Could not parse Webflow data. Make sure you copied correctly from Webflow.');
      return;
    }

    // Figma and Framer - coming soon
    if (showPasteDialog === 'figma') {
      toast.info('Figma import coming soon. For now, use a Figma-to-code plugin.');
      setShowPasteDialog(null);
      return;
    }

    if (showPasteDialog === 'framer') {
      toast.info('Framer import coming soon. For now, export as code.');
      setShowPasteDialog(null);
      return;
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
      // Handle ZIP files
      else if (fileName.endsWith('.zip')) {
        const JSZip = (await import('jszip')).default;
        const zip = await JSZip.loadAsync(file);
        
        let extractedContent = '';
        const supportedExtensions = ['.html', '.htm', '.css', '.js', '.json', '.txt', '.md'];
        
        for (const [path, zipEntry] of Object.entries(zip.files)) {
          if (!zipEntry.dir) {
            const ext = '.' + path.split('.').pop()?.toLowerCase();
            if (supportedExtensions.includes(ext)) {
              const content = await zipEntry.async('string');
              extractedContent += `\n\n[File: ${path}]:\n\`\`\`${ext.slice(1)}\n${content}\n\`\`\``;
            }
          }
        }
        
        if (extractedContent) {
          setInput(prev => {
            const prefix = prev ? prev + '\n\n' : '';
            return prefix + `[Extracted from ${file.name}]:${extractedContent}`;
          });
          toast.success(`ZIP "${file.name}" extracted successfully`);
        } else {
          toast.error(`No supported files found in ZIP`);
        }
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

  // Design tool options (have both upload and paste)
  const designToolOptions = [
    { id: 'webflow', label: 'Webflow', iconSrc: webflowIcon },
    { id: 'figma', label: 'Figma', iconSrc: figmaIcon },
    { id: 'framer', label: 'Framer', iconSrc: framerIcon },
  ];

  // Other import options (upload only)
  const otherImportOptions = [
    { id: 'wordpress', label: 'WordPress', iconSrc: wordpressIcon },
    { id: 'shopify', label: 'Shopify', iconSrc: shopifyIcon },
    { id: 'image', label: 'Image', icon: ImageIcon },
    { id: 'zip', label: 'ZIP', icon: Package },
  ];

  // Track which design tool submenu is open
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);

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
                          // Build mode: show agentic summary card
                          <AgenticSummaryCard summary={message.buildSummary} />
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
              {/* Build mode: show AgenticProgressCard only while loading */}
              {chatMode === 'build' && isLoading && <AgenticProgressCard />}
              
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

          {/* Continue Building Button - shows when page is incomplete */}
          {!isLoading && chatMode === 'build' && messages.length > 0 && (() => {
            const rootInstance = useBuilderStore.getState().rootInstance;
            const sectionCount = rootInstance.children.length;
            const sectionLabels = rootInstance.children.map((c: { label?: string; type: string }) => c.label || c.type);
            const pageCheck = detectIncompletePage(originalRequest, sectionCount, sectionLabels);
            
            if (pageCheck.isIncomplete && sectionCount > 0 && sectionCount < 6) {
              return (
                <div className="px-2 pb-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const existingSections = sectionLabels.join(', ');
                      const continueMsg = `Continue building the remaining sections. Currently: ${existingSections}. Add: ${pageCheck.missingSections.join(', ')}. Do NOT recreate existing sections.`;
                      setInput(continueMsg);
                      setTimeout(() => {
                        const sendButton = document.querySelector('[data-send-button]') as HTMLButtonElement;
                        if (sendButton) sendButton.click();
                      }, 100);
                    }}
                    className="w-full h-7 text-[10px] gap-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    Continue Building ({sectionCount} sections, missing: {pageCheck.missingSections.slice(0, 2).join(', ')})
                  </Button>
                </div>
              );
            }
            return null;
          })()}

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
                      ? 'bg-foreground text-background border-foreground/30 dark:bg-white dark:text-black dark:border-white/30'
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
                    <PopoverContent side="top" align="start" sideOffset={8} className="w-48 p-1.5 bg-popover border border-border shadow-lg z-50">
                      <div className="space-y-0.5">
                        <p className="text-[9px] text-muted-foreground px-2 py-1 font-medium uppercase tracking-wider">Design Tools</p>
                        {designToolOptions.map((option) => (
                          <div
                            key={option.id}
                            className="relative"
                            onMouseEnter={() => setOpenSubmenu(option.id)}
                            onMouseLeave={() => setOpenSubmenu(null)}
                          >
                            <button
                              className="w-full flex items-center justify-between gap-2 px-2 py-2 rounded text-[11px] text-foreground hover:bg-accent transition-colors"
                            >
                              <div className="flex items-center gap-2.5">
                                <img src={option.iconSrc} alt={option.label} className="w-5 h-5 object-contain rounded-sm" />
                                <span>{option.label}</span>
                              </div>
                              <ChevronRight className="w-3 h-3 text-muted-foreground" />
                            </button>
                            
                            {/* Submenu for Upload/Paste */}
                            {openSubmenu === option.id && (
                              <div className="absolute left-full top-0 ml-1 w-36 p-1 bg-popover border border-border rounded-md shadow-lg z-50">
                                <button
                                  onClick={() => {
                                    handleFileUpload('zip');
                                    setOpenSubmenu(null);
                                  }}
                                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-[10px] text-foreground hover:bg-accent transition-colors"
                                >
                                  <Upload className="w-3.5 h-3.5 text-muted-foreground" />
                                  <span>Upload ZIP</span>
                                </button>
                                <button
                                  onClick={() => {
                                    handlePasteImport(option.id as 'webflow' | 'figma' | 'framer');
                                    setOpenSubmenu(null);
                                  }}
                                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-[10px] text-foreground hover:bg-accent transition-colors group relative"
                                >
                                  <ClipboardPaste className="w-3.5 h-3.5 text-muted-foreground" />
                                  <span>Paste Code</span>
                                  {/* Badge tooltip */}
                                  <span className="absolute -right-1 -top-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="relative flex h-2 w-2">
                                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                      <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                                    </span>
                                  </span>
                                </button>
                                <p className="text-[8px] text-muted-foreground px-2 py-1 mt-0.5 border-t border-border/50">
                                  Paste {option.label} code directly
                                </p>
                              </div>
                            )}
                          </div>
                        ))}
                        
                        <div className="h-px bg-border my-1" />
                        <p className="text-[9px] text-muted-foreground px-2 py-1 font-medium uppercase tracking-wider">Other</p>
                        
                        {otherImportOptions.map((option) => (
                          <button
                            key={option.id}
                            onClick={() => handleFileUpload(option.id)}
                            className="w-full flex items-center gap-2.5 px-2 py-2 rounded text-[11px] text-foreground hover:bg-accent transition-colors"
                          >
                            {option.iconSrc ? (
                              <img src={option.iconSrc} alt={option.label} className="w-5 h-5 object-contain rounded-sm" />
                            ) : option.icon ? (
                              <option.icon className="w-4 h-4 text-muted-foreground" />
                            ) : null}
                            <span>{option.label}</span>
                          </button>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>

                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  data-send-button
                  className={`p-1.5 rounded-full transition-all duration-200 ${input.trim() && !isLoading
                    ? 'bg-foreground text-background dark:bg-white dark:text-black hover:opacity-90'
                    : 'bg-foreground/30 text-background/50 dark:bg-white/30 dark:text-black/50 cursor-not-allowed'
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

      {/* Paste Code Dialog */}
      <Dialog open={showPasteDialog !== null} onOpenChange={(open) => !open && setShowPasteDialog(null)}>
        <DialogContent className="sm:max-w-[420px] p-4">
          <DialogHeader className="pb-2">
            <DialogTitle className="text-sm flex items-center gap-2">
              {showPasteDialog === 'webflow' && <img src={webflowIcon} alt="Webflow" className="w-5 h-5 rounded" />}
              {showPasteDialog === 'figma' && <img src={figmaIcon} alt="Figma" className="w-5 h-5 rounded" />}
              {showPasteDialog === 'framer' && <img src={framerIcon} alt="Framer" className="w-5 h-5 rounded" />}
              Paste {showPasteDialog ? showPasteDialog.charAt(0).toUpperCase() + showPasteDialog.slice(1) : ''} Code
            </DialogTitle>
            <DialogDescription className="text-[10px]">
              Copy elements from {showPasteDialog} and paste the code below
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Textarea
              value={pasteCode}
              onChange={(e) => setPasteCode(e.target.value)}
              placeholder={`Paste your ${showPasteDialog} code here...`}
              className="min-h-[150px] font-mono text-[10px]"
            />
            <div className="p-2 rounded-md bg-muted/50 border border-border">
              <p className="text-[9px] text-muted-foreground">
                {showPasteDialog === 'webflow' && '💡 In Webflow, select elements and use Cmd/Ctrl+C to copy. Paste the JSON data here.'}
                {showPasteDialog === 'figma' && '💡 In Figma, select frames and copy. Alternatively, use a Figma-to-code plugin.'}
                {showPasteDialog === 'framer' && '💡 In Framer, copy components or use export to get the code.'}
              </p>
            </div>
          </div>
          <DialogFooter className="pt-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPasteDialog(null)}
              className="h-7 text-[10px]"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleConvertPaste}
              disabled={!pasteCode.trim()}
              className="h-7 text-[10px]"
            >
              Import
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
