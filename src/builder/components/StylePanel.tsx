import React, { useState, useEffect } from 'react';
import { useBuilderStore } from '../store/useBuilderStore';
import { useStyleStore } from '../store/useStyleStore';
import { PseudoState } from '../store/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Paintbrush, Plus, Square, Type, Heading as HeadingIcon, MousePointerClick, Image as ImageIcon, Link as LinkIcon, X, ChevronDown, ChevronRight, Settings as SettingsIcon, Zap, Database, RotateCcw, Info, AlignLeft, AlignCenter, AlignRight, AlignJustify, ArrowRight, ArrowDown, ArrowLeft, ArrowUp, Box, LayoutList, LayoutGrid, Minus, EyeOff, FileText, Home, Copy, Trash2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/hooks/use-toast';
import { componentRegistry } from '../primitives/registry';
import { UnitInput } from './UnitInput';
import { ColorPicker } from './ColorPicker';
import { SpacingControl } from './SpacingControl';
import { FontPicker } from './FontPicker';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ClassSelector } from './ClassSelector';
import { ImageUpload } from './ImageUpload';
import { VideoUpload } from './VideoUpload';
import { ShadowManager } from './ShadowManager';
import { ShadowItem } from '../store/types';
import { compileMetadataToCSS } from '../utils/cssCompiler';
import '../styles/style-panel.css';
import '../styles/tokens.css';

interface StylePanelProps {
  pages: string[];
  currentPage: string;
  pageNames: Record<string, string>;
  onPageChange: (page: string) => void;
  onPageNameChange: (pageId: string, newName: string) => void;
  onDeletePage: (pageId: string) => void;
  onDuplicatePage: (pageId: string) => void;
  onSetHomePage: (pageId: string) => void;
  homePage: string;
}

export const StylePanel: React.FC<StylePanelProps> = ({
  pages,
  currentPage,
  pageNames,
  onPageChange,
  onPageNameChange,
  onDeletePage,
  onDuplicatePage,
  onSetHomePage,
  homePage,
}) => {
  const { getSelectedInstance, updateInstance } = useBuilderStore();
  const { setStyle, getComputedStyles, styleSources, createStyleSource, nextLocalClassName, renameStyleSource, deleteStyleSource, currentPseudoState, setCurrentPseudoState, resetStyles, setStyleMetadata, getStyleMetadata, getPropertyState } = useStyleStore();
  const selectedInstance = getSelectedInstance();
  
  // ALL useState hooks MUST be at the top, before any conditional logic
  const [classNameInput, setClassNameInput] = useState('');
  const [isEditingLabel, setIsEditingLabel] = useState(false);
  const [labelInput, setLabelInput] = useState('');
  const [activeTab, setActiveTab] = useState('style');
  const [activeClassIndex, setActiveClassIndex] = useState<number | null>(null);
  const [isMarginLinked, setIsMarginLinked] = useState(false);
  const [isPaddingLinked, setIsPaddingLinked] = useState(false);
  const [pageSettingsOpen, setPageSettingsOpen] = useState(false);
  const [selectedPageForSettings, setSelectedPageForSettings] = useState<string>('');
  const [pageMetaTitle, setPageMetaTitle] = useState('');
  const [pageMetaDescription, setPageMetaDescription] = useState('');
  const [customCode, setCustomCode] = useState('');
  const [statusCode, setStatusCode] = useState('200');
  const [redirect, setRedirect] = useState('');
  const [language, setLanguage] = useState('en-US');
  
  // Initialize label input and active class when selectedInstance changes
  useEffect(() => {
    if (selectedInstance) {
      setLabelInput(selectedInstance.label || selectedInstance.type);
      setActiveTab('style'); // Reset to style tab when component is selected
      // Set active class to primary (index 0) when switching to a different component
      setActiveClassIndex(selectedInstance.styleSourceIds && selectedInstance.styleSourceIds.length > 0 ? 0 : null);
    }
  }, [selectedInstance?.id]);

  const [openSections, setOpenSections] = useState({
    layout: true,
    space: false,
    size: false,
    position: false,
    typography: false,
    backgrounds: false,
    borders: false,
    effects: false,
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // Get the active style source ID based on activeClassIndex
  const activeStyleSourceId = selectedInstance && selectedInstance.styleSourceIds && activeClassIndex !== null
    ? selectedInstance.styleSourceIds[activeClassIndex]
    : selectedInstance?.styleSourceIds?.[0];

  // Get computed styles - always show the full cascade (all classes combined)
  const computedStyles = selectedInstance
    ? getComputedStyles(selectedInstance.styleSourceIds || [])
    : {};

  // Helper to check if a property is inherited from a parent class
  const getPropertySource = (property: string): 'active' | 'inherited' | 'none' => {
    if (!selectedInstance || !activeStyleSourceId) return 'none';
    
    // Check if defined on the active class
    const activeValue = getPropertyState(activeStyleSourceId, property);
    if (activeValue !== undefined) return 'active';
    
    // Check if it exists in computed (inherited from parent classes)
    const computedValue = (computedStyles as any)[property];
    if (computedValue !== undefined && computedValue !== '') return 'inherited';
    
    return 'none';
  };

  // Helper to get text color class based on property source
  const getPropertyColorClass = (property: string): string => {
    const source = getPropertySource(property);
    if (source === 'active') return 'text-blue-600 dark:text-blue-400';
    if (source === 'inherited') return 'text-yellow-600 dark:text-yellow-400';
    return ''; // grey/default
  };

  // Helper component to render property indicator dot
  const PropertyIndicator: React.FC<{ property: string }> = ({ property }) => {
    const source = getPropertySource(property);
    if (source === 'none') return null;
    
    const color = source === 'active' 
      ? 'hsl(217, 91%, 60%)' 
      : 'hsl(45, 93%, 47%)';
    
    return (
      <span style={{ 
        width: '6px', 
        height: '6px', 
        borderRadius: '50%', 
        background: color,
        display: 'inline-block',
        marginLeft: '4px'
      }} />
    );
  };

  // Sync label input to selected instance (unconditional hook placement)
  useEffect(() => {
    if (selectedInstance) {
      setLabelInput(selectedInstance.label || selectedInstance.type);
    }
  }, [selectedInstance?.id, selectedInstance?.label, selectedInstance?.type]);

  const handlePageClick = (page: string) => {
    setSelectedPageForSettings(page);
    setPageSettingsOpen(true);
  };

  const safePages = Array.isArray(pages) ? pages : [];

  if (!selectedInstance) {
    return (
      <div className="w-64 h-full bg-background border border-border rounded-lg shadow-xl flex flex-col overflow-hidden backdrop-blur-md bg-white/70 dark:bg-zinc-900/70">
        <Tabs defaultValue="styles" className="flex-1 flex flex-col">
          <TabsList className="w-full grid grid-cols-3 rounded-none border-b bg-transparent h-10 p-1 gap-1">
            <TabsTrigger 
              value="styles" 
              className="gap-1 text-xs h-full rounded-md data-[state=active]:bg-[#F5F5F5] dark:data-[state=active]:bg-zinc-800 data-[state=active]:shadow-none"
            >
              <Paintbrush className="w-3 h-3" />
              Styles
            </TabsTrigger>
            <TabsTrigger 
              value="settings" 
              className="gap-1 text-xs h-full rounded-md data-[state=active]:bg-[#F5F5F5] dark:data-[state=active]:bg-zinc-800 data-[state=active]:shadow-none"
            >
              <SettingsIcon className="w-3 h-3" />
              Settings
            </TabsTrigger>
            <TabsTrigger 
              value="pages" 
              className="gap-1 text-xs h-full rounded-md data-[state=active]:bg-[#F5F5F5] dark:data-[state=active]:bg-zinc-800 data-[state=active]:shadow-none"
            >
              <FileText className="w-3 h-3" />
              Pages
            </TabsTrigger>
          </TabsList>
          <TabsContent value="styles" className="flex-1 m-0 p-3 overflow-y-auto">
            <div className="text-xs text-muted-foreground text-center">
              Select an element to edit its style
            </div>
          </TabsContent>
          <TabsContent value="settings" className="flex-1 m-0 p-3 overflow-y-auto">
            <div className="text-xs text-muted-foreground text-center">
              Select an element to configure settings
            </div>
          </TabsContent>
          <TabsContent value="pages" className="flex-1 m-0 p-0 overflow-y-auto">
            <div className="p-1.5">
              {safePages.map((page) => (
                <div
                  key={page}
                  className={`flex items-center justify-between p-1.5 rounded cursor-pointer hover:bg-accent ${
                    currentPage === page ? 'bg-accent' : ''
                  }`}
                  onClick={() => handlePageClick(page)}
                >
                  <div className="flex items-center gap-2">
                    {homePage === page ? (
                      <Home className="w-4 h-4 text-primary" />
                    ) : (
                      <FileText className="w-4 h-4" />
                    )}
                    <span className="text-xs">{pageNames[page] || page}</span>
                  </div>
                  <ChevronRight 
                    className="w-4 h-4 text-muted-foreground hover:text-foreground"
                  />
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  const ensurePrimaryClass = () => {
    if (!selectedInstance.styleSourceIds || selectedInstance.styleSourceIds.length === 0) {
      // Auto-create class on first style edit (Webflow pattern)
      const name = nextLocalClassName(selectedInstance.type);
      const id = createStyleSource('local', name);
      
      // Apply default styles from registry on first class creation
      const meta = componentRegistry[selectedInstance.type];
      if (meta?.defaultStyles) {
        Object.entries(meta.defaultStyles).forEach(([property, value]) => {
          setStyle(id, property, value);
        });
      }
      
      updateInstance(selectedInstance.id, { styleSourceIds: [id] });
      return id;
    }
    return selectedInstance.styleSourceIds[0];
  };

  const updateStyle = (property: string, value: string) => {
    // Strict inheritance rules: Only allow editing the LAST class in the chain
    if (!selectedInstance.styleSourceIds || selectedInstance.styleSourceIds.length === 0) {
      // No classes exist, create primary class
      const targetClassId = ensurePrimaryClass();
      setStyle(targetClassId, property, value);
      return;
    }

    // Get the last class in the chain (the only editable one)
    const lastClassIndex = selectedInstance.styleSourceIds.length - 1;
    const lastClassId = selectedInstance.styleSourceIds[lastClassIndex];

    // Check if trying to edit a class that's not the last one
    if (activeClassIndex !== null && activeClassIndex !== lastClassIndex) {
      const { isClassEditable } = useStyleStore.getState();
      if (!isClassEditable(selectedInstance.styleSourceIds[activeClassIndex])) {
        console.warn(`Cannot modify Class ${activeClassIndex + 1} - it has dependent classes. Only Class ${lastClassIndex + 1} can be edited.`);
        // Automatically switch to the last class
        setActiveClassIndex(lastClassIndex);
      }
    }

    // Always target the last class in the chain
    setStyle(lastClassId, property, value);
    
    // Ensure we're viewing the last class
    if (activeClassIndex !== lastClassIndex) {
      setActiveClassIndex(lastClassIndex);
    }
  };

  const handleAddClass = (className: string) => {
    const safeName = className.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '-');
    if (!safeName) return;
    
    // Check if class already exists in the style store
    const existingClassId = Object.entries(styleSources).find(
      ([_, source]) => source.name === safeName && source.type === 'local'
    )?.[0];
    
    let classIdToAdd: string;
    
    if (existingClassId) {
      // Reuse existing class
      classIdToAdd = existingClassId;
    } else {
      // Create new class
      classIdToAdd = createStyleSource('local', safeName);
    }
    
    // Add to instance's styleSourceIds if not already present
    const currentIds = selectedInstance.styleSourceIds || [];
    if (!currentIds.includes(classIdToAdd)) {
      const newStyleSourceIds = [...currentIds, classIdToAdd];
      updateInstance(selectedInstance.id, { styleSourceIds: newStyleSourceIds });
      // Set this as the active class
      setActiveClassIndex(newStyleSourceIds.length - 1);
    }
  };

  const handleRemoveClass = (classId: string) => {
    const newStyleSourceIds = selectedInstance.styleSourceIds?.filter(id => id !== classId) || [];
    updateInstance(selectedInstance.id, { styleSourceIds: newStyleSourceIds });
    
    // Reset active class index if needed
    if (activeClassIndex !== null && activeClassIndex >= newStyleSourceIds.length) {
      setActiveClassIndex(newStyleSourceIds.length > 0 ? 0 : null);
    }
  };

  const handleClassClick = (classId: string, index: number) => {
    setActiveClassIndex(index);
  };

  const handleResetStyles = () => {
    const primaryClassId = selectedInstance.styleSourceIds?.[0];
    if (primaryClassId) {
      resetStyles(primaryClassId);
    }
  };

  const classes = selectedInstance.styleSourceIds
    ?.map((id, index) => ({
      id,
      name: styleSources[id]?.name || id,
      isPrimary: index === 0,
    }))
    .filter(Boolean) || [];

  const isFlexDisplay = computedStyles.display === 'flex';
  const isGridDisplay = computedStyles.display === 'grid';
  
  // Calculate dimensions
  const width = computedStyles.width || 'auto';
  const height = computedStyles.height || 'auto';
  const dimensionText = `${width} × ${height}`;
  
  // Count children components
  const childrenCount = selectedInstance?.children?.length || 0;


  const handleLabelSave = () => {
    if (labelInput.trim()) {
      updateInstance(selectedInstance.id, { label: labelInput.trim() });
    }
    setIsEditingLabel(false);
  };

  const getComponentIcon = (type: string) => {
    const iconName = componentRegistry[type]?.icon;
    const iconMap: Record<string, React.ReactNode> = {
      Square: <Square className="w-4 h-4" />,
      Type: <Type className="w-4 h-4" />,
      Heading: <HeadingIcon className="w-4 h-4" />,
      MousePointerClick: <MousePointerClick className="w-4 h-4" />,
      Image: <ImageIcon className="w-4 h-4" />,
      Link: <LinkIcon className="w-4 h-4" />,
    };
    return iconMap[iconName || ''] || <Square className="w-4 h-4" />;
  };

  const hasStylesInSection = (properties: string[]) => {
    // Check the active class or primary class
    const targetClassId = activeClassIndex !== null && activeClassIndex >= 0 && selectedInstance.styleSourceIds
      ? selectedInstance.styleSourceIds[activeClassIndex]
      : selectedInstance.styleSourceIds?.[0];
      
    if (!targetClassId) return false;
    const { styles, currentBreakpointId, currentPseudoState, styleSources } = useStyleStore.getState();
    const name = styleSources[targetClassId]?.name?.trim();
    if (!name) return false;
    
    // Check if any property has an explicit value set for this class at this breakpoint and state
    return properties.some((prop) => {
      const key = `${targetClassId}:${currentBreakpointId}:${currentPseudoState}:${prop}`;
      const val = styles[key];
      return val !== undefined && val !== '' && val !== 'initial' && val !== 'inherit' && val !== 'normal' && val !== 'auto' && val !== 'none';
    });
  };
  
  const clearSectionStyles = (properties: string[]) => {
    const targetClassId = activeClassIndex !== null && activeClassIndex >= 0 && selectedInstance.styleSourceIds
      ? selectedInstance.styleSourceIds[activeClassIndex]
      : selectedInstance.styleSourceIds?.[0];
      
    if (!targetClassId) return;
    properties.forEach(prop => {
      setStyle(targetClassId, prop, '');
    });
  };

  const AccordionSection: React.FC<{
    title: string;
    section: keyof typeof openSections;
    children?: React.ReactNode;
    hasAddButton?: boolean;
    indicator?: boolean;
    properties?: string[];
  }> = ({ title, section, children, hasAddButton, indicator, properties }) => {
    const hasStyles = properties ? hasStylesInSection(properties) : indicator;
    const isPrimary = activeClassIndex === null || activeClassIndex === 0;
    const [isHovered, setIsHovered] = useState(false);
    
    return (
      <div className="Section">
        <div 
          className="SectionHeader group" 
          onClick={() => toggleSection(section)}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <span className="SectionTitle">
              {title}
            </span>
            {hasStyles && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ 
                  width: '8px', 
                  height: '8px', 
                  borderRadius: '50%', 
                  background: 'hsl(217, 91%, 60%)'
                }} />
                {isHovered && properties && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            clearSectionStyles(properties);
                          }}
                          className="w-4 h-4 flex items-center justify-center rounded hover:bg-accent transition-colors"
                          style={{ padding: '2px' }}
                        >
                          <RotateCcw className="w-3 h-3 text-muted-foreground hover:text-foreground" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="bg-popover border border-border">
                        <span className="text-xs">Reset {title} styles</span>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
            )}
          </div>
          {hasAddButton && <Plus className={`SectionIcon ${openSections[section] ? 'open' : ''}`} size={18} />}
        </div>
        {openSections[section] && children && <div className="SectionContent">{children}</div>}
      </div>
    );
  };


  return (
    <div className="w-64 h-full bg-background border border-border rounded-lg shadow-xl flex flex-col overflow-hidden backdrop-blur-md bg-white/70 dark:bg-zinc-900/70">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
        <TabsList className="w-full grid grid-cols-3 rounded-none border-b bg-transparent h-10 p-1 gap-1 flex-shrink-0">
          <TabsTrigger 
            value="style"
            className="text-xs h-full rounded-md data-[state=active]:bg-[#F5F5F5] dark:data-[state=active]:bg-zinc-800 data-[state=active]:shadow-none flex items-center gap-1"
          >
            <Paintbrush className="w-3 h-3" />
            Style
          </TabsTrigger>
          <TabsTrigger 
            value="settings" 
            className="text-xs h-full rounded-md data-[state=active]:bg-[#F5F5F5] dark:data-[state=active]:bg-zinc-800 data-[state=active]:shadow-none flex items-center gap-1"
          >
            <SettingsIcon className="w-3 h-3" />
            Settings
          </TabsTrigger>
          <TabsTrigger 
            value="pages" 
            className="text-xs h-full rounded-md data-[state=active]:bg-[#F5F5F5] dark:data-[state=active]:bg-zinc-800 data-[state=active]:shadow-none flex items-center gap-1"
          >
            <FileText className="w-3 h-3" />
            Pages
          </TabsTrigger>
        </TabsList>

        <TabsContent value="style" className="flex-1 min-h-0 m-0 overflow-y-auto overflow-x-hidden">
          <div className="StylePanel">
            <div style={{ 
              padding: 'var(--space-1) var(--space-2)',
              borderBottom: '1px solid hsl(var(--border))'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <span className="text-foreground">{getComponentIcon(selectedInstance.type)}</span>
                {isEditingLabel ? (
                  <input
                    type="text"
                    value={labelInput}
                    onChange={(e) => setLabelInput(e.target.value)}
                    onBlur={handleLabelSave}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleLabelSave();
                      if (e.key === 'Escape') {
                        setLabelInput(selectedInstance.label || selectedInstance.type);
                        setIsEditingLabel(false);
                      }
                    }}
                    autoFocus
                    className="Input"
                    style={{ fontSize: '11px', fontWeight: 600, padding: '2px 4px', flex: 1 }}
                  />
                ) : (
                  <span 
                    style={{ fontSize: '11px', fontWeight: 600, cursor: 'pointer', flex: 1 }} 
                    className="text-foreground hover:text-primary"
                    onClick={() => setIsEditingLabel(true)}
                  >
                    {selectedInstance.label || selectedInstance.type}
                  </span>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: '9px', color: 'hsl(var(--muted-foreground))' }}>
                  <span>{dimensionText}</span>
                  {childrenCount > 0 && (
                    <>
                      <span>•</span>
                      <span>{childrenCount} {childrenCount === 1 ? 'child' : 'children'}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

              {/* Class Selector - Multi-class support */}
            <div style={{ padding: 'var(--space-3)', borderBottom: '1px solid hsl(var(--border))' }}>
              <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'flex-start', marginBottom: 'var(--space-2)' }}>
                <div style={{ flex: 1 }}>
                  <ClassSelector 
                    selectedClasses={classes}
                    onAddClass={handleAddClass}
                    onRemoveClass={handleRemoveClass}
                    onClassClick={handleClassClick}
                    activeClassIndex={activeClassIndex}
                    componentType={selectedInstance.type}
                    showAutoClassPreview={true}
                  />
                </div>
                
                {/* State dropdown on same line */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className={`h-9 w-6 p-0 justify-center border border-border flex-shrink-0 ${currentPseudoState !== 'default' ? 'bg-green-500/10 border-green-500/50' : ''}`}
                      title={`State: ${currentPseudoState}`}
                    >
                      <ChevronDown className="w-2.5 h-2.5 text-muted-foreground" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" side="bottom" className="w-28 bg-popover border border-border z-[10000]">
                    {(['default', 'hover', 'focus', 'active', 'visited'] as const).map((state) => {
                      // Check if this state has any styles
                      const hasStyles = selectedInstance.styleSourceIds?.some(classId => {
                        const { styles, currentBreakpointId } = useStyleStore.getState();
                        return Object.keys(styles).some(key => {
                          const [keyClassId, keyBreakpoint, keyState] = key.split(':');
                          return keyClassId === classId && keyBreakpoint === currentBreakpointId && keyState === state;
                        });
                      });
                      
                      return (
                        <DropdownMenuItem 
                          key={state}
                          onClick={() => setCurrentPseudoState(state as PseudoState)}
                          className="flex items-center justify-between text-xs py-1"
                        >
                          <span className="capitalize">{state}</span>
                          {hasStyles && state !== 'default' && (
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                          )}
                        </DropdownMenuItem>
                      );
                    })}
                  </DropdownMenuContent>
                </DropdownMenu>
                
                {classes.length > 0 && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-5 w-5 p-0 text-foreground hover:text-primary flex-shrink-0"
                          onClick={handleResetStyles}
                        >
                          <RotateCcw className="w-3 h-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Reset styles to default</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>

              {classes.length === 0 && (
                <div style={{ fontSize: '10px', color: 'hsl(var(--muted-foreground))', marginTop: 'var(--space-1)' }}>
                  No classes assigned
                </div>
              )}
            </div>

            {/* Layout */}
            <AccordionSection title="Layout" section="layout" properties={['display', 'flexDirection', 'justifyContent', 'alignItems', 'flexWrap', 'gap', 'gridTemplateColumns', 'gridTemplateRows', 'gridAutoFlow', 'placeItems', 'placeContent']}>
              <div className="Col" style={{ gap: 'var(--space-2)' }}>
          {/* Display Type with Icon Buttons */}
          <div className="Col" style={{ gap: 'var(--space-1)' }}>
            <label className="Label" style={{ fontWeight: 600, fontSize: '10px' }}>Display</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 32px)', gap: '2px', justifyContent: 'start' }}>
              <button
                className={`w-8 h-8 flex items-center justify-center rounded ${computedStyles.display === 'block' ? 'bg-accent border-2 border-primary' : 'border border-input bg-[#F5F5F5] dark:bg-[#09090b] hover:bg-accent'}`}
                onClick={() => updateStyle('display', 'block')}
                title="Block"
              >
                <Box className="w-3.5 h-3.5 text-foreground" />
              </button>
              <button
                className={`w-8 h-8 flex items-center justify-center rounded ${computedStyles.display === 'flex' ? 'bg-accent border-2 border-primary' : 'border border-input bg-[#F5F5F5] dark:bg-[#09090b] hover:bg-accent'}`}
                onClick={() => updateStyle('display', 'flex')}
                title="Flex"
              >
                <LayoutList className="w-3.5 h-3.5 text-foreground" />
              </button>
              <button
                className={`w-8 h-8 flex items-center justify-center rounded ${computedStyles.display === 'grid' ? 'bg-accent border-2 border-primary' : 'border border-input bg-[#F5F5F5] dark:bg-[#09090b] hover:bg-accent'}`}
                onClick={() => updateStyle('display', 'grid')}
                title="Grid"
              >
                <LayoutGrid className="w-3.5 h-3.5 text-foreground" />
              </button>
              <button
                className={`w-8 h-8 flex items-center justify-center rounded ${computedStyles.display === 'inline' ? 'bg-accent border-2 border-primary' : 'border border-input bg-[#F5F5F5] dark:bg-[#09090b] hover:bg-accent'}`}
                onClick={() => updateStyle('display', 'inline')}
                title="Inline"
              >
                <Minus className="w-3.5 h-3.5 text-foreground" />
              </button>
              <button
                className={`w-8 h-8 flex items-center justify-center rounded ${computedStyles.display === 'inline-block' ? 'bg-accent border-2 border-primary' : 'border border-input bg-[#F5F5F5] dark:bg-[#09090b] hover:bg-accent'}`}
                onClick={() => updateStyle('display', 'inline-block')}
                title="Inline Block"
              >
                <Square className="w-3.5 h-3.5 text-foreground" />
              </button>
              <button
                className={`w-8 h-8 flex items-center justify-center rounded ${computedStyles.display === 'none' ? 'bg-accent border-2 border-primary' : 'border border-input bg-[#F5F5F5] dark:bg-[#09090b] hover:bg-accent'}`}
                onClick={() => updateStyle('display', 'none')}
                title="None"
              >
                <EyeOff className="w-3.5 h-3.5 text-foreground" />
              </button>
            </div>
          </div>

          {isFlexDisplay && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', marginTop: 'var(--space-1)' }}>
              {/* Direction Icons */}
              <div className="Col" style={{ gap: 'var(--space-1)' }}>
                <label className="Label" style={{ fontSize: '10px' }}>Direction</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 32px)', gap: '2px', justifyContent: 'start' }}>
                  <button
                    className={`w-8 h-8 flex items-center justify-center rounded border ${computedStyles.flexDirection === 'row' || !computedStyles.flexDirection ? 'bg-accent border-2 border-primary' : 'bg-[#F5F5F5] dark:bg-[#09090b] border-input hover:bg-accent'}`}
                    onClick={() => updateStyle('flexDirection', 'row')}
                    title="Row"
                  >
                    <ArrowRight className="w-3.5 h-3.5 text-foreground" />
                  </button>
                  <button
                    className={`w-8 h-8 flex items-center justify-center rounded border ${computedStyles.flexDirection === 'column' ? 'bg-accent border-2 border-primary' : 'bg-[#F5F5F5] dark:bg-[#09090b] border-input hover:bg-accent'}`}
                    onClick={() => updateStyle('flexDirection', 'column')}
                    title="Column"
                  >
                    <ArrowDown className="w-3.5 h-3.5 text-foreground" />
                  </button>
                  <button
                    className={`w-8 h-8 flex items-center justify-center rounded border ${computedStyles.flexDirection === 'row-reverse' ? 'bg-accent border-2 border-primary' : 'bg-[#F5F5F5] dark:bg-[#09090b] border-input hover:bg-accent'}`}
                    onClick={() => updateStyle('flexDirection', 'row-reverse')}
                    title="Row Reverse"
                  >
                    <ArrowLeft className="w-3.5 h-3.5 text-foreground" />
                  </button>
                  <button
                    className={`w-8 h-8 flex items-center justify-center rounded border ${computedStyles.flexDirection === 'column-reverse' ? 'bg-accent border-2 border-primary' : 'bg-[#F5F5F5] dark:bg-[#09090b] border-input hover:bg-accent'}`}
                    onClick={() => updateStyle('flexDirection', 'column-reverse')}
                    title="Column Reverse"
                  >
                    <ArrowUp className="w-3.5 h-3.5 text-foreground" />
                  </button>
                </div>
              </div>

              {/* Alignment Section - 50/50 Grid Layout */}
              <div className="Col" style={{ gap: 'var(--space-1)' }}>
                <label className="Label" style={{ fontSize: '10px' }}>Align</label>
                <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: 'var(--space-2)', alignItems: 'start' }}>
                  {/* Left: Alignment Grid - 100px x 100px */}
                  <div 
                    className="AlignGrid"
                    style={{
                      width: '100px',
                      height: '100px',
                    }}
                  >
                    {Array.from({ length: 9 }).map((_, i) => {
                      const row = Math.floor(i / 3);
                      const col = i % 3;
                      
                      // Determine alignment states
                      const justifyMap = ['flex-start', 'center', 'flex-end'];
                      const alignMap = ['flex-start', 'center', 'flex-end'];
                      
                      const isJustifyActive = computedStyles.justifyContent === justifyMap[col] || 
                        (col === 0 && !computedStyles.justifyContent);
                      const isAlignActive = computedStyles.alignItems === alignMap[row] ||
                        (row === 0 && !computedStyles.alignItems);
                      
                      const isActive = isJustifyActive && isAlignActive;
                      
                      return (
                        <button 
                          key={i} 
                          className="AlignBtn"
                          data-state={isActive ? "on" : "off"}
                          onClick={() => {
                            updateStyle('justifyContent', justifyMap[col]);
                            updateStyle('alignItems', alignMap[row]);
                          }}
                          onDoubleClick={() => {
                            // Double click for advanced options
                            if (col === 1 && row === 1) {
                              // Center - cycle through space options
                              const current = computedStyles.justifyContent;
                              if (current === 'center') updateStyle('justifyContent', 'space-between');
                              else if (current === 'space-between') updateStyle('justifyContent', 'space-around');
                              else if (current === 'space-around') updateStyle('justifyContent', 'space-evenly');
                              else updateStyle('justifyContent', 'center');
                            }
                          }}
                        />
                      );
                    })}
                  </div>

                  {/* Right: Stacked Controls */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
                    <div className="Col" style={{ gap: '2px' }}>
                      <label className="Label" style={{ fontSize: '9px' }}>Justify</label>
                      <select
                        className="Select"
                        value={computedStyles.justifyContent || 'flex-start'}
                        onChange={(e) => updateStyle('justifyContent', e.target.value)}
                        style={{ fontSize: '9px', padding: '2px 4px', height: '22px', maxWidth: '90px' }}
                      >
                        <option value="flex-start">Start</option>
                        <option value="center">Center</option>
                        <option value="flex-end">End</option>
                        <option value="space-between">Between</option>
                        <option value="space-around">Around</option>
                        <option value="space-evenly">Evenly</option>
                      </select>
                    </div>

                    <div className="Col" style={{ gap: '2px' }}>
                      <label className="Label" style={{ fontSize: '9px' }}>Align</label>
                      <select
                        className="Select"
                        value={computedStyles.alignItems || 'stretch'}
                        onChange={(e) => updateStyle('alignItems', e.target.value)}
                        style={{ fontSize: '9px', padding: '2px 4px', height: '22px', maxWidth: '90px' }}
                      >
                        <option value="stretch">Stretch</option>
                        <option value="flex-start">Start</option>
                        <option value="center">Center</option>
                        <option value="flex-end">End</option>
                        <option value="baseline">Baseline</option>
                      </select>
                    </div>

                    <div className="Col" style={{ gap: '2px' }}>
                      <label className="Label" style={{ fontSize: '9px' }}>Gap</label>
                      <UnitInput
                        value={computedStyles.gap || ''}
                        onChange={(val) => updateStyle('gap', val)}
                        placeholder="0px"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {isGridDisplay && (
            <div style={{ marginTop: 'var(--space-3)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {/* First 2x2 Grid: Cols, Rows, Template Cols, Template Rows */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-2)' }}>
                <div className="Col" style={{ gap: '2px' }}>
                  <label className="Label" style={{ fontSize: '9px' }}>Cols</label>
                  <input
                    className="Input"
                    type="number"
                    min="1"
                    value={(() => {
                      const val = computedStyles.gridTemplateColumns || '';
                      const match = val.match(/repeat\((\d+),/);
                      return match ? parseInt(match[1]) : val.split(' ').filter(Boolean).length || 2;
                    })()}
                    onChange={(e) => {
                      const count = Math.max(1, parseInt(e.target.value) || 1);
                      updateStyle('gridTemplateColumns', `repeat(${count}, 1fr)`);
                    }}
                    style={{ textAlign: 'center', height: '22px' }}
                  />
                </div>

                <div className="Col" style={{ gap: '2px' }}>
                  <label className="Label" style={{ fontSize: '9px' }}>Rows</label>
                  <input
                    className="Input"
                    type="number"
                    min="1"
                    value={(() => {
                      const val = computedStyles.gridTemplateRows || '';
                      const match = val.match(/repeat\((\d+),/);
                      return match ? parseInt(match[1]) : val.split(' ').filter(Boolean).length || 2;
                    })()}
                    onChange={(e) => {
                      const count = Math.max(1, parseInt(e.target.value) || 1);
                      updateStyle('gridTemplateRows', `repeat(${count}, auto)`);
                    }}
                    style={{ textAlign: 'center', height: '22px' }}
                  />
                </div>

                <div className="Col" style={{ gap: '2px' }}>
                  <label className="Label" style={{ fontSize: '9px' }}>Template Cols</label>
                  <input
                    className="Input"
                    type="text"
                    placeholder="repeat(3, 1fr)"
                    value={computedStyles.gridTemplateColumns || ''}
                    onChange={(e) => updateStyle('gridTemplateColumns', e.target.value)}
                    style={{ height: '22px', fontSize: '9px' }}
                  />
                </div>

                <div className="Col" style={{ gap: '2px' }}>
                  <label className="Label" style={{ fontSize: '9px' }}>Template Rows</label>
                  <input
                    className="Input"
                    type="text"
                    placeholder="repeat(2, auto)"
                    value={computedStyles.gridTemplateRows || ''}
                    onChange={(e) => updateStyle('gridTemplateRows', e.target.value)}
                    style={{ height: '22px', fontSize: '9px' }}
                  />
                </div>
              </div>

              {/* Second 2x2 Grid: Direction, Align, Gap, Place */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-2)' }}>
                <div className="Col" style={{ gap: '2px' }}>
                  <label className="Label" style={{ fontSize: '9px' }}>Direction</label>
                  <select
                    className="Select"
                    value={computedStyles.gridAutoFlow || 'row'}
                    onChange={(e) => updateStyle('gridAutoFlow', e.target.value)}
                    style={{ fontSize: '9px', padding: '2px 4px', height: '22px', maxWidth: '90px' }}
                  >
                    <option value="row">Row</option>
                    <option value="column">Column</option>
                    <option value="dense">Dense</option>
                    <option value="row dense">Row Dense</option>
                    <option value="column dense">Col Dense</option>
                  </select>
                </div>

                <div className="Col" style={{ gap: '2px' }}>
                  <label className="Label" style={{ fontSize: '9px' }}>Align</label>
                  <select
                    className="Select"
                    value={computedStyles.alignItems || 'stretch'}
                    onChange={(e) => updateStyle('alignItems', e.target.value)}
                    style={{ fontSize: '9px', padding: '2px 4px', height: '22px', maxWidth: '90px' }}
                  >
                    <option value="stretch">Stretch</option>
                    <option value="start">Start</option>
                    <option value="center">Center</option>
                    <option value="end">End</option>
                  </select>
                </div>

                <div className="Col" style={{ gap: '2px' }}>
                  <label className="Label" style={{ fontSize: '9px' }}>Gap</label>
                  <UnitInput
                    value={computedStyles.gap || ''}
                    onChange={(val) => updateStyle('gap', val)}
                    placeholder="0px"
                  />
                </div>

                <div className="Col" style={{ gap: '2px' }}>
                  <label className="Label" style={{ fontSize: '9px' }}>Place</label>
                  <select
                    className="Select"
                    value={computedStyles.placeContent || 'normal'}
                    onChange={(e) => updateStyle('placeContent', e.target.value)}
                    style={{ fontSize: '9px', padding: '2px 4px', height: '22px', maxWidth: '90px' }}
                  >
                    <option value="normal">Normal</option>
                    <option value="start">Start</option>
                    <option value="center">Center</option>
                    <option value="end">End</option>
                    <option value="space-between">Between</option>
                    <option value="space-around">Around</option>
                    <option value="space-evenly">Evenly</option>
                    <option value="stretch">Stretch</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
            </AccordionSection>

            {/* Space */}
            <AccordionSection title="Space" section="space" properties={['marginTop', 'marginRight', 'marginBottom', 'marginLeft', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft']}>
        <SpacingControl
          marginTop={computedStyles.marginTop}
          marginRight={computedStyles.marginRight}
          marginBottom={computedStyles.marginBottom}
          marginLeft={computedStyles.marginLeft}
          paddingTop={computedStyles.paddingTop}
          paddingRight={computedStyles.paddingRight}
          paddingBottom={computedStyles.paddingBottom}
          paddingLeft={computedStyles.paddingLeft}
          onUpdate={updateStyle}
          styleSourceIds={selectedInstance.styleSourceIds}
          activeClassIndex={activeClassIndex}
          isMarginLinked={isMarginLinked}
          isPaddingLinked={isPaddingLinked}
          onMarginLinkChange={setIsMarginLinked}
          onPaddingLinkChange={setIsPaddingLinked}
        />
            </AccordionSection>

            {/* Size */}
            <AccordionSection title="Size" section="size" properties={['width', 'height', 'minWidth', 'minHeight', 'maxWidth', 'maxHeight']}>
        <div className="Col" style={{ gap: '4px' }}>
          {/* Width and Height */}
          <div style={{ display: 'grid', gridTemplateColumns: '26px 1fr 26px 1fr', gap: '2px', alignItems: 'center' }}>
            <label className={`Label ${getPropertyColorClass('width')}`}>
              Width<PropertyIndicator property="width" />
            </label>
            <UnitInput
              value={computedStyles.width || ''}
              onChange={(val) => updateStyle('width', val)}
              placeholder="Auto"
            />
            <label className={`Label ${getPropertyColorClass('height')}`}>
              Height<PropertyIndicator property="height" />
            </label>
            <UnitInput
              value={computedStyles.height || ''}
              onChange={(val) => updateStyle('height', val)}
              placeholder="Auto"
            />
          </div>

          {/* Min Width and Min Height */}
          <div style={{ display: 'grid', gridTemplateColumns: '26px 1fr 26px 1fr', gap: '2px', alignItems: 'center' }}>
            <label className={`Label ${getPropertyColorClass('minWidth')}`}>
              Min W<PropertyIndicator property="minWidth" />
            </label>
            <UnitInput
              value={computedStyles.minWidth || ''}
              onChange={(val) => updateStyle('minWidth', val)}
              placeholder="auto"
            />
            <label className={`Label ${getPropertyColorClass('minHeight')}`}>
              Min H<PropertyIndicator property="minHeight" />
            </label>
            <UnitInput
              value={computedStyles.minHeight || ''}
              onChange={(val) => updateStyle('minHeight', val)}
              placeholder="auto"
            />
          </div>

          {/* Max Width and Max Height */}
          <div style={{ display: 'grid', gridTemplateColumns: '26px 1fr 26px 1fr', gap: '2px', alignItems: 'center' }}>
            <label className={`Label ${getPropertyColorClass('maxWidth')}`}>
              Max W<PropertyIndicator property="maxWidth" />
            </label>
            <UnitInput
              value={computedStyles.maxWidth || ''}
              onChange={(val) => updateStyle('maxWidth', val)}
              placeholder="none"
            />
            <label className={`Label ${getPropertyColorClass('maxHeight')}`}>
              Max H<PropertyIndicator property="maxHeight" />
            </label>
            <UnitInput
              value={computedStyles.maxHeight || ''}
              onChange={(val) => updateStyle('maxHeight', val)}
              placeholder="none"
            />
          </div>

          {/* Overflow */}
          <div style={{ display: 'grid', gridTemplateColumns: '26px 1fr', gap: '2px', alignItems: 'center' }}>
            <label className={`Label ${getPropertyColorClass('overflow')}`}>
              Over<PropertyIndicator property="overflow" />
            </label>
            <select
              className="Select"
              value={computedStyles.overflow || 'visible'}
              onChange={(e) => updateStyle('overflow', e.target.value)}
              style={{ maxWidth: '90px' }}
            >
              <option value="visible">Visible</option>
              <option value="hidden">Hidden</option>
              <option value="scroll">Scroll</option>
              <option value="auto">Auto</option>
            </select>
          </div>
        </div>
            </AccordionSection>

            {/* Position */}
            <AccordionSection title="Position" section="position" properties={['position', 'top', 'right', 'bottom', 'left', 'zIndex']}>
        <div className="Col" style={{ gap: '4px' }}>
          {/* Position Type */}
          <div style={{ display: 'grid', gridTemplateColumns: '26px 1fr', gap: '2px', alignItems: 'center' }}>
            <label className={`Label ${getPropertyColorClass('position')}`}>
              Pos<PropertyIndicator property="position" />
            </label>
            <select
              className="Select"
              value={computedStyles.position || 'static'}
              onChange={(e) => updateStyle('position', e.target.value)}
              style={{ maxWidth: '120px' }}
            >
              <option value="static">Static</option>
              <option value="relative">Relative</option>
              <option value="absolute">Absolute</option>
              <option value="fixed">Fixed</option>
              <option value="sticky">Sticky</option>
            </select>
          </div>

          {(computedStyles.position === 'absolute' || computedStyles.position === 'relative' || computedStyles.position === 'fixed' || computedStyles.position === 'sticky') && (
            <>
              {/* Position Grid - Top/Right/Bottom/Left */}
              <div style={{ 
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gridTemplateRows: '1fr 1fr 1fr',
                gap: '4px',
                padding: 'var(--space-2)',
                border: '1px solid hsl(var(--border))',
                borderRadius: '4px',
                background: 'hsl(var(--muted) / 0.3)'
              }}>
                <div style={{ gridColumn: '2' }}>
                  <UnitInput
                    value={computedStyles.top || ''}
                    onChange={(val) => updateStyle('top', val)}
                    placeholder="Auto"
                    className="SpaceInputSmall"
                    style={{ textAlign: 'center' }}
                  />
                </div>
                <div style={{ gridColumn: '1', gridRow: '2' }}>
                  <UnitInput
                    value={computedStyles.left || ''}
                    onChange={(val) => updateStyle('left', val)}
                    placeholder="Auto"
                    className="SpaceInputSmall"
                    style={{ textAlign: 'center' }}
                  />
                </div>
                <div style={{ gridColumn: '2', gridRow: '2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span className="Label" style={{ fontSize: '9px', color: 'hsl(var(--muted-foreground))' }}>Auto</span>
                </div>
                <div style={{ gridColumn: '3', gridRow: '2' }}>
                  <UnitInput
                    value={computedStyles.right || ''}
                    onChange={(val) => updateStyle('right', val)}
                    placeholder="Auto"
                    className="SpaceInputSmall"
                    style={{ textAlign: 'center' }}
                  />
                </div>
                <div style={{ gridColumn: '2', gridRow: '3' }}>
                  <UnitInput
                    value={computedStyles.bottom || ''}
                    onChange={(val) => updateStyle('bottom', val)}
                    placeholder="Auto"
                    className="SpaceInputSmall"
                    style={{ textAlign: 'center' }}
                  />
                </div>
              </div>

          {/* Z-Index */}
          <div style={{ display: 'grid', gridTemplateColumns: '26px 1fr', gap: '2px', alignItems: 'center' }}>
            <label className={`Label ${getPropertyColorClass('zIndex')}`}>
              Z<PropertyIndicator property="zIndex" />
            </label>
                <input
                  className="Input"
                  type="number"
                  value={computedStyles.zIndex?.toString() || ''}
                  onChange={(e) => updateStyle('zIndex', e.target.value)}
                  placeholder="Auto"
                  style={{ maxWidth: '48px' }}
                />
              </div>
            </>
          )}
        </div>
            </AccordionSection>

            {/* Typography */}
            <AccordionSection title="Typography" section="typography" properties={['fontFamily', 'fontSize', 'fontWeight', 'lineHeight', 'letterSpacing', 'textAlign', 'textDecoration', 'textTransform', 'color', 'textIndent', 'wordBreak', 'whiteSpace', 'textOverflow']}>
        <div className="Col" style={{ gap: '8px' }}>
          {/* Heading Tag Selector - Only for Heading components */}
          {selectedInstance.type === 'Heading' && (
            <div>
              <label className="Label" style={{ fontSize: '10px', marginBottom: '4px', display: 'block' }}>Tag</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '2px' }}>
                {['1', '2', '3', '4', '5', '6'].map((num) => {
                  const tag = `h${num}`;
                  const isActive = (selectedInstance.props.level || 'h1') === tag;
                  return (
                    <button
                      key={num}
                      onClick={() => {
                        updateInstance(selectedInstance.id, {
                          props: { ...selectedInstance.props, level: tag },
                        });
                      }}
                      className={`h-7 flex items-center justify-center rounded border text-xs font-medium transition-colors ${
                        isActive
                          ? 'bg-accent border-primary text-foreground'
                          : 'bg-[#F5F5F5] dark:bg-[#09090b] border-input text-muted-foreground hover:bg-accent hover:text-foreground'
                      }`}
                    >
                      {num}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          
          <div>
            <label className="Label" style={{ fontSize: '10px', marginBottom: '4px', display: 'block' }}>Font</label>
            <FontPicker
              value={computedStyles.fontFamily || ''}
              weight={computedStyles.fontWeight || '400'}
              onChange={(val) => updateStyle('fontFamily', val)}
              onWeightChange={(val) => updateStyle('fontWeight', val)}
            />
          </div>
          
          {/* Font Size and Line Height */}
          <div style={{ display: 'grid', gridTemplateColumns: '26px 1fr 26px 1fr', gap: '2px', alignItems: 'center' }}>
            <label className={`Label ${getPropertyColorClass('fontSize')}`}>
              Size<PropertyIndicator property="fontSize" />
            </label>
            <UnitInput
              value={computedStyles.fontSize || ''}
              onChange={(val) => updateStyle('fontSize', val)}
              placeholder="16px"
            />
            <label className={`Label ${getPropertyColorClass('lineHeight')}`}>
              Height<PropertyIndicator property="lineHeight" />
            </label>
            <UnitInput
              value={computedStyles.lineHeight || ''}
              onChange={(val) => updateStyle('lineHeight', val)}
              placeholder="1.5"
            />
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '26px 1fr', gap: '2px', alignItems: 'center' }}>
            <label className={`Label ${getPropertyColorClass('color')}`}>
              Color<PropertyIndicator property="color" />
            </label>
            <ColorPicker
              value={computedStyles.color || 'hsl(var(--foreground))'}
              onChange={(val) => updateStyle('color', val)}
            />
          </div>

          {/* Text Align with Icons */}
          <div style={{ display: 'grid', gridTemplateColumns: '26px 1fr', gap: '2px', alignItems: 'center' }}>
            <label className="Label">Align</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 32px)', gap: '2px', justifyContent: 'start' }}>
              <button
                className={`w-8 h-8 flex items-center justify-center rounded border ${computedStyles.textAlign === 'left' || !computedStyles.textAlign ? 'bg-accent border-2 border-primary' : 'bg-[#F5F5F5] dark:bg-[#09090b] border-input hover:bg-accent'}`}
                onClick={() => updateStyle('textAlign', 'left')}
              >
                <AlignLeft className="w-3.5 h-3.5 text-foreground" />
              </button>
              <button
                className={`w-8 h-8 flex items-center justify-center rounded border ${computedStyles.textAlign === 'center' ? 'bg-accent border-2 border-primary' : 'bg-[#F5F5F5] dark:bg-[#09090b] border-input hover:bg-accent'}`}
                onClick={() => updateStyle('textAlign', 'center')}
              >
                <AlignCenter className="w-3.5 h-3.5 text-foreground" />
              </button>
              <button
                className={`w-8 h-8 flex items-center justify-center rounded border ${computedStyles.textAlign === 'right' ? 'bg-accent border-2 border-primary' : 'bg-[#F5F5F5] dark:bg-[#09090b] border-input hover:bg-accent'}`}
                onClick={() => updateStyle('textAlign', 'right')}
              >
                <AlignRight className="w-3.5 h-3.5 text-foreground" />
              </button>
              <button
                className={`w-8 h-8 flex items-center justify-center rounded border ${computedStyles.textAlign === 'justify' ? 'bg-accent border-2 border-primary' : 'bg-[#F5F5F5] dark:bg-[#09090b] border-input hover:bg-accent'}`}
                onClick={() => updateStyle('textAlign', 'justify')}
              >
                <AlignJustify className="w-3.5 h-3.5 text-foreground" />
              </button>
            </div>
          </div>

          {/* Decor and Transform side by side */}
          <div style={{ display: 'grid', gridTemplateColumns: '26px 1fr 26px 1fr', gap: '2px', alignItems: 'center' }}>
            <label className={`Label ${getPropertyColorClass('textDecoration')}`}>
              Decor<PropertyIndicator property="textDecoration" />
            </label>
            <select
              className="Select"
              value={computedStyles.textDecoration || 'none'}
              onChange={(e) => updateStyle('textDecoration', e.target.value)}
              style={{ maxWidth: '90px' }}
            >
              <option value="none">None</option>
              <option value="underline">Under</option>
              <option value="overline">Over</option>
              <option value="line-through">Strike</option>
            </select>
            <label className={`Label ${getPropertyColorClass('textTransform')}`}>
              Trans<PropertyIndicator property="textTransform" />
            </label>
            <select
              className="Select"
              value={computedStyles.textTransform || 'none'}
              onChange={(e) => updateStyle('textTransform', e.target.value)}
              style={{ maxWidth: '90px' }}
            >
              <option value="none">None</option>
              <option value="uppercase">Upper</option>
              <option value="lowercase">Lower</option>
              <option value="capitalize">Caps</option>
            </select>
          </div>

          {/* Letter Spacing and Text Indent */}
          <div style={{ display: 'grid', gridTemplateColumns: '26px 1fr 26px 1fr', gap: '2px', alignItems: 'center' }}>
            <label className={`Label ${getPropertyColorClass('letterSpacing')}`}>
              Letter<PropertyIndicator property="letterSpacing" />
            </label>
            <UnitInput
              value={computedStyles.letterSpacing || ''}
              onChange={(val) => updateStyle('letterSpacing', val)}
              placeholder="0"
            />
            <label className={`Label ${getPropertyColorClass('textIndent')}`}>
              Indent<PropertyIndicator property="textIndent" />
            </label>
            <UnitInput
              value={computedStyles.textIndent || ''}
              onChange={(val) => updateStyle('textIndent', val)}
              placeholder="0"
            />
          </div>

          {/* Break, Wrap, Overflow side by side */}
          <div style={{ display: 'grid', gridTemplateColumns: '26px 1fr', gap: '2px', alignItems: 'center' }}>
            <label className="Label">Break</label>
            <select
              className="Select"
              value={computedStyles.wordBreak || 'normal'}
              onChange={(e) => updateStyle('wordBreak', e.target.value)}
              style={{ maxWidth: '90px' }}
            >
              <option value="normal">Normal</option>
              <option value="break-all">All</option>
              <option value="keep-all">Keep</option>
              <option value="break-word">Word</option>
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '26px 1fr 26px 1fr', gap: '2px', alignItems: 'center' }}>
            <label className="Label">Wrap</label>
            <select
              className="Select"
              value={computedStyles.whiteSpace || 'normal'}
              onChange={(e) => updateStyle('whiteSpace', e.target.value)}
              style={{ maxWidth: '90px' }}
            >
              <option value="normal">Normal</option>
              <option value="nowrap">None</option>
              <option value="pre">Pre</option>
              <option value="pre-wrap">Wrap</option>
            </select>
            <label className="Label">Over</label>
            <select
              className="Select"
              value={computedStyles.textOverflow || 'clip'}
              onChange={(e) => updateStyle('textOverflow', e.target.value)}
              style={{ maxWidth: '90px' }}
            >
              <option value="clip">Clip</option>
              <option value="ellipsis">...</option>
            </select>
          </div>
        </div>
            </AccordionSection>

            {/* Backgrounds */}
            <AccordionSection title="Backgrounds" section="backgrounds" properties={['backgroundColor', 'backgroundImage', 'backgroundSize', 'backgroundPosition', 'backgroundRepeat', 'backgroundClip']}>
        <div className="Col" style={{ gap: '4px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '26px 1fr', gap: '2px', alignItems: 'center' }}>
            <label className={`Label ${getPropertyColorClass('backgroundColor')}`}>
              Color<PropertyIndicator property="backgroundColor" />
            </label>
            <ColorPicker
              value={computedStyles.backgroundColor || 'transparent'}
              onChange={(val) => updateStyle('backgroundColor', val)}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '26px 1fr', gap: '2px', alignItems: 'center' }}>
            <label className={`Label ${getPropertyColorClass('backgroundClip')}`}>
              Clip<PropertyIndicator property="backgroundClip" />
            </label>
            <select
              className="Select"
              value={computedStyles.backgroundClip || 'border-box'}
              onChange={(e) => updateStyle('backgroundClip', e.target.value)}
              style={{ maxWidth: '90px' }}
            >
              <option value="border-box">Border</option>
              <option value="padding-box">Padding</option>
              <option value="content-box">Content</option>
              <option value="text">Text</option>
            </select>
          </div>
        </div>
            </AccordionSection>

            {/* Borders */}
            <AccordionSection title="Borders" section="borders" properties={['borderWidth', 'borderStyle', 'borderColor', 'borderRadius', 'borderTopLeftRadius', 'borderTopRightRadius', 'borderBottomRightRadius', 'borderBottomLeftRadius']}>
        <div className="Col" style={{ gap: '4px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '26px 1fr', gap: '2px', alignItems: 'center' }}>
            <label className={`Label ${getPropertyColorClass('borderRadius')}`}>
              Radius<PropertyIndicator property="borderRadius" />
            </label>
            <UnitInput
              value={computedStyles.borderRadius || ''}
              onChange={(val) => updateStyle('borderRadius', val)}
              placeholder="0"
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '26px 1fr 26px 1fr', gap: '2px', alignItems: 'center' }}>
            <label className={`Label ${getPropertyColorClass('borderStyle')}`}>
              Style<PropertyIndicator property="borderStyle" />
            </label>
            <select
              className="Select"
              value={computedStyles.borderStyle || 'none'}
              onChange={(e) => updateStyle('borderStyle', e.target.value)}
              style={{ maxWidth: '90px' }}
            >
              <option value="none">None</option>
              <option value="solid">Solid</option>
              <option value="dashed">Dash</option>
              <option value="dotted">Dot</option>
              <option value="double">Double</option>
            </select>
            <label className={`Label ${getPropertyColorClass('borderWidth')}`}>
              Width<PropertyIndicator property="borderWidth" />
            </label>
            <UnitInput
              value={computedStyles.borderWidth || ''}
              onChange={(val) => updateStyle('borderWidth', val)}
              placeholder="0"
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '26px 1fr', gap: '2px', alignItems: 'center' }}>
            <label className={`Label ${getPropertyColorClass('borderColor')}`}>
              Color<PropertyIndicator property="borderColor" />
            </label>
            <ColorPicker
              value={computedStyles.borderColor || 'hsl(var(--border))'}
              onChange={(val) => updateStyle('borderColor', val)}
            />
          </div>
        </div>
            </AccordionSection>

            {/* Effects */}
            <AccordionSection title="Effects" section="effects" properties={['opacity', 'mixBlendMode', 'boxShadow', 'filter', 'backdropFilter', 'transform', 'transition', 'cursor', 'outline', 'outlineWidth', 'outlineStyle', 'outlineColor']}>
        <div className="Col" style={{ gap: '4px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '26px 1fr', gap: '2px', alignItems: 'center' }}>
            <label className={`Label ${getPropertyColorClass('mixBlendMode')}`}>
              Blend<PropertyIndicator property="mixBlendMode" />
            </label>
            <select
              className="Select"
              value={computedStyles.mixBlendMode || 'normal'}
              onChange={(e) => updateStyle('mixBlendMode', e.target.value)}
              style={{ maxWidth: '90px' }}
            >
              <option value="normal">Normal</option>
              <option value="multiply">Multiply</option>
              <option value="screen">Screen</option>
              <option value="overlay">Overlay</option>
              <option value="darken">Darken</option>
              <option value="lighten">Lighten</option>
            </select>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '26px 1fr', gap: '2px', alignItems: 'center' }}>
            <label className={`Label ${getPropertyColorClass('opacity')}`}>
              Opac<PropertyIndicator property="opacity" />
            </label>
            <input
              className="Input"
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={computedStyles.opacity || '1'}
              onChange={(e) => updateStyle('opacity', e.target.value)}
            />
          </div>
          
          {/* Shadow Manager */}
          <div className="pt-2">
            <ShadowManager
              shadows={(() => {
                if (!selectedInstance.styleSourceIds || selectedInstance.styleSourceIds.length === 0) return [];
                const activeClassId = selectedInstance.styleSourceIds[activeClassIndex ?? 0];
                if (!activeClassId) return [];
                const metadata = getStyleMetadata(activeClassId);
                return metadata?.shadows || [];
              })()}
              onChange={(shadows) => {
                if (!selectedInstance.styleSourceIds || selectedInstance.styleSourceIds.length === 0) return;
                const activeClassId = selectedInstance.styleSourceIds[activeClassIndex ?? 0];
                if (!activeClassId) return;
                const metadata = getStyleMetadata(activeClassId) || {};
                setStyleMetadata(activeClassId, { ...metadata, shadows });
              }}
            />
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '26px 1fr', gap: '2px', alignItems: 'center' }}>
            <label className={`Label ${getPropertyColorClass('filter')}`}>
              Filter<PropertyIndicator property="filter" />
            </label>
            <input
              className="Input"
              type="text"
              placeholder="blur(4px)"
              value={computedStyles.filter || ''}
              onChange={(e) => updateStyle('filter', e.target.value)}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '26px 1fr', gap: '2px', alignItems: 'center' }}>
            <label className={`Label ${getPropertyColorClass('transform')}`}>
              Trans<PropertyIndicator property="transform" />
            </label>
            <input
              className="Input"
              type="text"
              placeholder="rotate(10deg)"
              value={computedStyles.transform || ''}
              onChange={(e) => updateStyle('transform', e.target.value)}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '26px 1fr', gap: '2px', alignItems: 'center' }}>
            <label className={`Label ${getPropertyColorClass('cursor')}`}>
              Cursor<PropertyIndicator property="cursor" />
            </label>
            <select
              className="Select"
              value={computedStyles.cursor || 'auto'}
              onChange={(e) => updateStyle('cursor', e.target.value)}
              style={{ maxWidth: '90px' }}
            >
              <option value="auto">Auto</option>
              <option value="pointer">Pointer</option>
              <option value="text">Text</option>
              <option value="move">Move</option>
              <option value="grab">Grab</option>
              <option value="not-allowed">Not Allow</option>
            </select>
          </div>
        </div>
      </AccordionSection>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="flex-1 min-h-0 m-0 p-4 overflow-y-auto overflow-x-hidden">
          {selectedInstance.type === 'Table' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground">Rows</label>
                <Input
                  type="number"
                  min={1}
                  max={20}
                  value={selectedInstance.props?.rows || 3}
                  onChange={(e) => {
                    const newRows = parseInt(e.target.value) || 3;
                    const currentRows = selectedInstance.props?.rows || 3;
                    const currentData = selectedInstance.props?.data || [];
                    const columns = selectedInstance.props?.columns || 3;
                    
                    let newData = [...currentData];
                    if (newRows > currentRows) {
                      // Add rows
                      for (let i = currentRows; i < newRows; i++) {
                        newData.push(Array(columns).fill(''));
                      }
                    } else {
                      // Remove rows
                      newData = newData.slice(0, newRows);
                    }
                    
                    updateInstance(selectedInstance.id, {
                      props: { ...selectedInstance.props, rows: newRows, data: newData }
                    });
                  }}
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground">Columns</label>
                <Input
                  type="number"
                  min={1}
                  max={10}
                  value={selectedInstance.props?.columns || 3}
                  onChange={(e) => {
                    const newColumns = parseInt(e.target.value) || 3;
                    const currentColumns = selectedInstance.props?.columns || 3;
                    const currentHeaders = selectedInstance.props?.headers || [];
                    const currentData = selectedInstance.props?.data || [];
                    
                    let newHeaders = [...currentHeaders];
                    if (newColumns > currentColumns) {
                      // Add columns
                      for (let i = currentColumns; i < newColumns; i++) {
                        newHeaders.push(`Column ${i + 1}`);
                      }
                    } else {
                      // Remove columns
                      newHeaders = newHeaders.slice(0, newColumns);
                    }
                    
                    const newData = currentData.map((row: string[]) => {
                      const newRow = [...row];
                      if (newColumns > currentColumns) {
                        // Add empty cells
                        for (let i = currentColumns; i < newColumns; i++) {
                          newRow.push('');
                        }
                      } else {
                        // Remove cells
                        return newRow.slice(0, newColumns);
                      }
                      return newRow;
                    });
                    
                    updateInstance(selectedInstance.id, {
                      props: { ...selectedInstance.props, columns: newColumns, headers: newHeaders, data: newData }
                    });
                  }}
                  className="h-8 text-xs"
                />
              </div>
              
              <p className="text-xs text-muted-foreground">
                Double-click on table cells to edit content
              </p>
            </div>
          )}

          {selectedInstance.type === 'Image' && (
            <div className="space-y-4">
              <ImageUpload
                currentValue={selectedInstance.props.src || ''}
                onImageChange={(url) => {
                  updateInstance(selectedInstance.id, {
                    props: { ...selectedInstance.props, src: url }
                  });
                }}
                mode="src"
                label="Image Source"
              />
              
              <div className="space-y-2">
                <label className="text-[10pt] font-semibold text-foreground">Alt Text</label>
                <Input
                  type="text"
                  placeholder="Image description"
                  value={selectedInstance.props.alt || ''}
                  onChange={(e) => {
                    updateInstance(selectedInstance.id, {
                      props: { ...selectedInstance.props, alt: e.target.value }
                    });
                  }}
                  className="h-8 text-[10pt]"
                />
                <p className="text-[10pt] text-muted-foreground">
                  Describe the image for accessibility and SEO
                </p>
              </div>
            </div>
          )}

          {selectedInstance.type === 'Video' && (
            <div className="space-y-4">
              <VideoUpload
                currentValue={selectedInstance.props.src || ''}
                onVideoChange={(url) => {
                  updateInstance(selectedInstance.id, {
                    props: { ...selectedInstance.props, src: url }
                  });
                }}
                loop={selectedInstance.props.loop || false}
                autoplay={selectedInstance.props.autoplay || false}
                showControls={selectedInstance.props.controls || false}
                onLoopChange={(loop) => {
                  updateInstance(selectedInstance.id, {
                    props: { ...selectedInstance.props, loop }
                  });
                }}
                onAutoplayChange={(autoplay) => {
                  updateInstance(selectedInstance.id, {
                    props: { ...selectedInstance.props, autoplay }
                  });
                }}
                onShowControlsChange={(controls) => {
                  updateInstance(selectedInstance.id, {
                    props: { ...selectedInstance.props, controls }
                  });
                }}
                label="Background Video"
              />
            </div>
          )}

          {selectedInstance.type === 'Youtube' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10pt] font-semibold text-foreground">YouTube Video ID</label>
                <Input
                  type="text"
                  placeholder="dQw4w9WgXcQ"
                  value={selectedInstance.props.videoId || ''}
                  onChange={(e) => {
                    updateInstance(selectedInstance.id, {
                      props: { ...selectedInstance.props, videoId: e.target.value }
                    });
                  }}
                  className="h-8 text-[10pt]"
                />
                <p className="text-[10pt] text-muted-foreground">
                  Enter the video ID from the YouTube URL (e.g., youtube.com/watch?v=<strong>dQw4w9WgXcQ</strong>)
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-[10pt] font-semibold text-foreground">Or paste full YouTube URL</label>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                    onChange={(e) => {
                      const url = e.target.value;
                      // Extract video ID from various YouTube URL formats
                      const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
                      if (match) {
                        updateInstance(selectedInstance.id, {
                          props: { ...selectedInstance.props, videoId: match[1] }
                        });
                        toast({
                          title: 'Video ID extracted',
                          description: `Using video ID: ${match[1]}`,
                        });
                      }
                    }}
                    className="h-8 text-[10pt]"
                  />
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-border">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="youtube-autoplay"
                    checked={selectedInstance.props.autoplay || false}
                    onCheckedChange={(checked) => {
                      updateInstance(selectedInstance.id, {
                        props: { ...selectedInstance.props, autoplay: checked }
                      });
                    }}
                  />
                  <label htmlFor="youtube-autoplay" className="text-[10pt] font-medium cursor-pointer">
                    Autoplay video
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="youtube-loop"
                    checked={selectedInstance.props.loop || false}
                    onCheckedChange={(checked) => {
                      updateInstance(selectedInstance.id, {
                        props: { ...selectedInstance.props, loop: checked }
                      });
                    }}
                  />
                  <label htmlFor="youtube-loop" className="text-[10pt] font-medium cursor-pointer">
                    Loop video
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="youtube-muted"
                    checked={selectedInstance.props.muted || false}
                    onCheckedChange={(checked) => {
                      updateInstance(selectedInstance.id, {
                        props: { ...selectedInstance.props, muted: checked }
                      });
                    }}
                  />
                  <label htmlFor="youtube-muted" className="text-[10pt] font-medium cursor-pointer">
                    Muted
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="youtube-controls"
                    checked={selectedInstance.props.controls !== false}
                    onCheckedChange={(checked) => {
                      updateInstance(selectedInstance.id, {
                        props: { ...selectedInstance.props, controls: checked }
                      });
                    }}
                  />
                  <label htmlFor="youtube-controls" className="text-[10pt] font-medium cursor-pointer">
                    Show controls
                  </label>
                </div>
              </div>
            </div>
          )}

          {selectedInstance.type === 'Lottie' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10pt] font-semibold text-foreground">Lottie Animation JSON</label>
                <input
                  ref={(input) => {
                    if (input) {
                      input.onclick = () => {
                        const fileInput = document.createElement('input');
                        fileInput.type = 'file';
                        fileInput.accept = '.json,application/json';
                        fileInput.onchange = async (e: any) => {
                          const file = e.target?.files?.[0];
                          if (file) {
                            try {
                              const text = await file.text();
                              const json = JSON.parse(text);
                              const blob = new Blob([JSON.stringify(json)], { type: 'application/json' });
                              const url = URL.createObjectURL(blob);
                              updateInstance(selectedInstance.id, {
                                props: { ...selectedInstance.props, src: url }
                              });
                              toast({
                                title: 'Lottie JSON uploaded',
                                description: `${file.name} has been loaded`,
                              });
                            } catch (error) {
                              toast({
                                title: 'Invalid JSON',
                                description: 'Please upload a valid Lottie JSON file',
                                variant: 'destructive',
                              });
                            }
                          }
                        };
                        fileInput.click();
                      };
                    }
                  }}
                  type="button"
                  value="Upload Lottie JSON"
                  className="w-full h-24 px-4 text-[10pt] border-2 border-dashed border-border rounded-md bg-background hover:border-primary hover:bg-primary/5 cursor-pointer transition-colors"
                />
                <p className="text-[10pt] text-muted-foreground">
                  Upload a Lottie JSON file from your computer
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-[10pt] font-semibold text-foreground">Or enter JSON URL</label>
                <Input
                  type="text"
                  placeholder="https://example.com/animation.json"
                  value={selectedInstance.props.src || ''}
                  onChange={(e) => {
                    updateInstance(selectedInstance.id, {
                      props: { ...selectedInstance.props, src: e.target.value }
                    });
                  }}
                  className="h-8 text-[10pt]"
                />
              </div>

              <div className="space-y-2 pt-2 border-t border-border">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="lottie-autoplay"
                    checked={selectedInstance.props.autoplay !== false}
                    onCheckedChange={(checked) => {
                      updateInstance(selectedInstance.id, {
                        props: { ...selectedInstance.props, autoplay: checked }
                      });
                    }}
                  />
                  <label htmlFor="lottie-autoplay" className="text-[10pt] font-medium cursor-pointer">
                    Autoplay animation
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="lottie-loop"
                    checked={selectedInstance.props.loop !== false}
                    onCheckedChange={(checked) => {
                      updateInstance(selectedInstance.id, {
                        props: { ...selectedInstance.props, loop: checked }
                      });
                    }}
                  />
                  <label htmlFor="lottie-loop" className="text-[10pt] font-medium cursor-pointer">
                    Loop animation
                  </label>
                </div>
              </div>
            </div>
          )}

          {(selectedInstance.type === 'Container' || selectedInstance.type === 'Div' || selectedInstance.type === 'Section') && (
            <div className="space-y-4">
              <ImageUpload
                currentValue={computedStyles.backgroundImage?.match(/url\(['"]?(.+?)['"]?\)/)?.[1] || ''}
                onImageChange={(url) => {
                  if (url) {
                    updateStyle('backgroundImage', `url(${url})`);
                    updateStyle('backgroundSize', 'cover');
                    updateStyle('backgroundPosition', 'center');
                    updateStyle('backgroundRepeat', 'no-repeat');
                  } else {
                    updateStyle('backgroundImage', '');
                  }
                }}
                mode="background"
                label="Background Image"
              />

              {computedStyles.backgroundImage && (
                <div className="space-y-3 pt-3 border-t border-border">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-foreground">Background Size</label>
                    <select
                      className="w-full h-8 px-2 text-xs rounded-md border border-border bg-background"
                      value={computedStyles.backgroundSize || 'cover'}
                      onChange={(e) => updateStyle('backgroundSize', e.target.value)}
                    >
                      <option value="cover">Cover</option>
                      <option value="contain">Contain</option>
                      <option value="auto">Auto</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-foreground">Background Position</label>
                    <select
                      className="w-full h-8 px-2 text-xs rounded-md border border-border bg-background"
                      value={computedStyles.backgroundPosition || 'center'}
                      onChange={(e) => updateStyle('backgroundPosition', e.target.value)}
                    >
                      <option value="center">Center</option>
                      <option value="top">Top</option>
                      <option value="bottom">Bottom</option>
                      <option value="left">Left</option>
                      <option value="right">Right</option>
                      <option value="top left">Top Left</option>
                      <option value="top right">Top Right</option>
                      <option value="bottom left">Bottom Left</option>
                      <option value="bottom right">Bottom Right</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-foreground">Background Repeat</label>
                    <select
                      className="w-full h-8 px-2 text-xs rounded-md border border-border bg-background"
                      value={computedStyles.backgroundRepeat || 'no-repeat'}
                      onChange={(e) => updateStyle('backgroundRepeat', e.target.value)}
                    >
                      <option value="no-repeat">No Repeat</option>
                      <option value="repeat">Repeat</option>
                      <option value="repeat-x">Repeat X</option>
                      <option value="repeat-y">Repeat Y</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          )}

          {selectedInstance.type === 'Navigation' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground">Layout Alignment</label>
                <select
                  className="w-full h-8 px-2 text-xs rounded-md border border-border bg-background"
                  value={selectedInstance.props.alignment || 'left-right'}
                  onChange={(e) => {
                    updateInstance(selectedInstance.id, {
                      props: { ...selectedInstance.props, alignment: e.target.value }
                    });
                  }}
                >
                  <option value="left-right">Logo Left / Menu Right</option>
                  <option value="center">Logo Center / Menu Centered</option>
                  <option value="right-left">Logo Right / Menu Left</option>
                </select>
              </div>

              <div className="space-y-2 pt-3 border-t border-border">
                <label className="text-xs font-semibold text-foreground">Mobile Animation</label>
                <select
                  className="w-full h-8 px-2 text-xs rounded-md border border-border bg-background"
                  value={selectedInstance.props.mobileAnimation || 'slide'}
                  onChange={(e) => {
                    updateInstance(selectedInstance.id, {
                      props: { ...selectedInstance.props, mobileAnimation: e.target.value }
                    });
                  }}
                >
                  <option value="none">None</option>
                  <option value="slide">Slide Down</option>
                  <option value="fade">Fade In</option>
                  <option value="scale">Scale Up</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground">Animation Duration (ms)</label>
                <Input
                  type="number"
                  min={0}
                  max={1000}
                  step={50}
                  value={selectedInstance.props.animationDuration || 300}
                  onChange={(e) => {
                    updateInstance(selectedInstance.id, {
                      props: { ...selectedInstance.props, animationDuration: parseInt(e.target.value) || 300 }
                    });
                  }}
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-2 pt-3 border-t border-border">
                <label className="text-xs font-semibold text-foreground">Hamburger Icon Style</label>
                <select
                  className="w-full h-8 px-2 text-xs rounded-md border border-border bg-background"
                  value={selectedInstance.props.hamburgerStyle || 'classic'}
                  onChange={(e) => {
                    updateInstance(selectedInstance.id, {
                      props: { ...selectedInstance.props, hamburgerStyle: e.target.value }
                    });
                  }}
                >
                  <option value="classic">Classic</option>
                  <option value="minimal">Minimal</option>
                  <option value="dots">Dots</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="animateIcon"
                  checked={selectedInstance.props.animateIcon !== false}
                  onChange={(e) => {
                    updateInstance(selectedInstance.id, {
                      props: { ...selectedInstance.props, animateIcon: e.target.checked }
                    });
                  }}
                  className="w-4 h-4"
                />
                <label htmlFor="animateIcon" className="text-xs text-foreground cursor-pointer">
                  Animate icon to X when open
                </label>
              </div>

              <div className="space-y-3 pt-3 border-t border-border">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-foreground">Menu Items</label>
                  <Button
                    size="sm"
                    onClick={() => {
                      const currentItems = selectedInstance.props.menuItems || [];
                      const newItem = {
                        text: 'New Item',
                        url: '#',
                        id: Date.now().toString()
                      };
                      updateInstance(selectedInstance.id, {
                        props: { ...selectedInstance.props, menuItems: [...currentItems, newItem] }
                      });
                    }}
                    className="h-6 text-xs px-2"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Add Item
                  </Button>
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {(selectedInstance.props.menuItems || []).map((item: { text: string; url: string; id: string }, index: number) => (
                    <div key={item.id} className="flex items-center gap-2 p-2 bg-muted/50 rounded-md">
                      <div className="flex-1 space-y-1">
                        <Input
                          type="text"
                          value={item.text}
                          onChange={(e) => {
                            const newItems = [...selectedInstance.props.menuItems];
                            newItems[index] = { ...item, text: e.target.value };
                            updateInstance(selectedInstance.id, {
                              props: { ...selectedInstance.props, menuItems: newItems }
                            });
                          }}
                          className="h-6 text-xs"
                          placeholder="Menu text"
                        />
                        <Input
                          type="text"
                          value={item.url}
                          onChange={(e) => {
                            const newItems = [...selectedInstance.props.menuItems];
                            newItems[index] = { ...item, url: e.target.value };
                            updateInstance(selectedInstance.id, {
                              props: { ...selectedInstance.props, menuItems: newItems }
                            });
                          }}
                          className="h-6 text-xs"
                          placeholder="URL"
                        />
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          const newItems = selectedInstance.props.menuItems.filter((_: any, i: number) => i !== index);
                          updateInstance(selectedInstance.id, {
                            props: { ...selectedInstance.props, menuItems: newItems }
                          });
                        }}
                        className="h-6 w-6 p-0"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <p className="text-xs text-muted-foreground pt-2">
                Double-click on logo or menu items in the canvas to edit them directly
              </p>
            </div>
          )}

          {selectedInstance.type === 'FormButton' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground">Button Type</label>
                <select
                  className="w-full h-8 px-2 text-xs rounded-md border border-border bg-background"
                  value={selectedInstance.props.type || 'button'}
                  onChange={(e) => {
                    updateInstance(selectedInstance.id, {
                      props: { ...selectedInstance.props, type: e.target.value }
                    });
                  }}
                >
                  <option value="button">Button</option>
                  <option value="submit">Submit</option>
                  <option value="reset">Reset</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="disabled"
                  checked={selectedInstance.props.disabled || false}
                  onChange={(e) => {
                    updateInstance(selectedInstance.id, {
                      props: { ...selectedInstance.props, disabled: e.target.checked }
                    });
                  }}
                  className="w-4 h-4"
                />
                <label htmlFor="disabled" className="text-xs text-foreground cursor-pointer">
                  Disabled
                </label>
              </div>
            </div>
          )}

          {selectedInstance.type === 'InputLabel' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground">For (Input ID)</label>
                <Input
                  type="text"
                  value={selectedInstance.props.htmlFor || ''}
                  onChange={(e) => {
                    updateInstance(selectedInstance.id, {
                      props: { ...selectedInstance.props, htmlFor: e.target.value }
                    });
                  }}
                  className="h-8 text-xs"
                  placeholder="input-id"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="required"
                  checked={selectedInstance.props.required || false}
                  onChange={(e) => {
                    updateInstance(selectedInstance.id, {
                      props: { ...selectedInstance.props, required: e.target.checked }
                    });
                  }}
                  className="w-4 h-4"
                />
                <label htmlFor="required" className="text-xs text-foreground cursor-pointer">
                  Required
                </label>
              </div>
            </div>
          )}

          {selectedInstance.type === 'TextInput' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground">Placeholder</label>
                <Input
                  type="text"
                  value={selectedInstance.props.placeholder || ''}
                  onChange={(e) => {
                    updateInstance(selectedInstance.id, {
                      props: { ...selectedInstance.props, placeholder: e.target.value }
                    });
                  }}
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground">Input Type</label>
                <select
                  className="w-full h-8 px-2 text-xs rounded-md border border-border bg-background"
                  value={selectedInstance.props.type || 'text'}
                  onChange={(e) => {
                    updateInstance(selectedInstance.id, {
                      props: { ...selectedInstance.props, type: e.target.value }
                    });
                  }}
                >
                  <option value="text">Text</option>
                  <option value="email">Email</option>
                  <option value="password">Password</option>
                  <option value="tel">Telephone</option>
                  <option value="url">URL</option>
                  <option value="search">Search</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="required"
                  checked={selectedInstance.props.required || false}
                  onChange={(e) => {
                    updateInstance(selectedInstance.id, {
                      props: { ...selectedInstance.props, required: e.target.checked }
                    });
                  }}
                  className="w-4 h-4"
                />
                <label htmlFor="required" className="text-xs text-foreground cursor-pointer">
                  Required
                </label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="disabled"
                  checked={selectedInstance.props.disabled || false}
                  onChange={(e) => {
                    updateInstance(selectedInstance.id, {
                      props: { ...selectedInstance.props, disabled: e.target.checked }
                    });
                  }}
                  className="w-4 h-4"
                />
                <label htmlFor="disabled" className="text-xs text-foreground cursor-pointer">
                  Disabled
                </label>
              </div>
            </div>
          )}

          {selectedInstance.type === 'TextArea' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground">Placeholder</label>
                <Input
                  type="text"
                  value={selectedInstance.props.placeholder || ''}
                  onChange={(e) => {
                    updateInstance(selectedInstance.id, {
                      props: { ...selectedInstance.props, placeholder: e.target.value }
                    });
                  }}
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground">Rows</label>
                <Input
                  type="number"
                  min={1}
                  max={20}
                  value={selectedInstance.props.rows || 4}
                  onChange={(e) => {
                    updateInstance(selectedInstance.id, {
                      props: { ...selectedInstance.props, rows: parseInt(e.target.value) || 4 }
                    });
                  }}
                  className="h-8 text-xs"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="required"
                  checked={selectedInstance.props.required || false}
                  onChange={(e) => {
                    updateInstance(selectedInstance.id, {
                      props: { ...selectedInstance.props, required: e.target.checked }
                    });
                  }}
                  className="w-4 h-4"
                />
                <label htmlFor="required" className="text-xs text-foreground cursor-pointer">
                  Required
                </label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="disabled"
                  checked={selectedInstance.props.disabled || false}
                  onChange={(e) => {
                    updateInstance(selectedInstance.id, {
                      props: { ...selectedInstance.props, disabled: e.target.checked }
                    });
                  }}
                  className="w-4 h-4"
                />
                <label htmlFor="disabled" className="text-xs text-foreground cursor-pointer">
                  Disabled
                </label>
              </div>
            </div>
          )}

          {selectedInstance.type === 'Select' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground">Placeholder</label>
                <Input
                  type="text"
                  value={selectedInstance.props.placeholder || ''}
                  onChange={(e) => {
                    updateInstance(selectedInstance.id, {
                      props: { ...selectedInstance.props, placeholder: e.target.value }
                    });
                  }}
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-3 pt-3 border-t border-border">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-foreground">Options</label>
                  <Button
                    size="sm"
                    onClick={() => {
                      const currentOptions = selectedInstance.props.options || [];
                      const newOption = {
                        id: Date.now().toString(),
                        label: 'New Option',
                        value: 'new-option'
                      };
                      updateInstance(selectedInstance.id, {
                        props: { ...selectedInstance.props, options: [...currentOptions, newOption] }
                      });
                    }}
                    className="h-6 text-xs px-2"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Add Option
                  </Button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {(selectedInstance.props.options || []).map((option: { id: string; label: string; value: string }, index: number) => (
                    <div key={option.id} className="flex items-center gap-2 p-2 bg-muted/50 rounded-md">
                      <div className="flex-1 space-y-1">
                        <Input
                          type="text"
                          value={option.label}
                          onChange={(e) => {
                            const newOptions = [...selectedInstance.props.options];
                            newOptions[index] = { ...option, label: e.target.value };
                            updateInstance(selectedInstance.id, {
                              props: { ...selectedInstance.props, options: newOptions }
                            });
                          }}
                          className="h-6 text-xs"
                          placeholder="Option label"
                        />
                        <Input
                          type="text"
                          value={option.value}
                          onChange={(e) => {
                            const newOptions = [...selectedInstance.props.options];
                            newOptions[index] = { ...option, value: e.target.value };
                            updateInstance(selectedInstance.id, {
                              props: { ...selectedInstance.props, options: newOptions }
                            });
                          }}
                          className="h-6 text-xs"
                          placeholder="Option value"
                        />
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          const newOptions = selectedInstance.props.options.filter((_: any, i: number) => i !== index);
                          updateInstance(selectedInstance.id, {
                            props: { ...selectedInstance.props, options: newOptions }
                          });
                        }}
                        className="h-6 w-6 p-0"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="required"
                  checked={selectedInstance.props.required || false}
                  onChange={(e) => {
                    updateInstance(selectedInstance.id, {
                      props: { ...selectedInstance.props, required: e.target.checked }
                    });
                  }}
                  className="w-4 h-4"
                />
                <label htmlFor="required" className="text-xs text-foreground cursor-pointer">
                  Required
                </label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="disabled"
                  checked={selectedInstance.props.disabled || false}
                  onChange={(e) => {
                    updateInstance(selectedInstance.id, {
                      props: { ...selectedInstance.props, disabled: e.target.checked }
                    });
                  }}
                  className="w-4 h-4"
                />
                <label htmlFor="disabled" className="text-xs text-foreground cursor-pointer">
                  Disabled
                </label>
              </div>
            </div>
          )}

          {selectedInstance.type === 'RadioGroup' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground">Name</label>
                <Input
                  type="text"
                  value={selectedInstance.props.name || 'radio-group'}
                  onChange={(e) => {
                    updateInstance(selectedInstance.id, {
                      props: { ...selectedInstance.props, name: e.target.value }
                    });
                  }}
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground">Orientation</label>
                <select
                  className="w-full h-8 px-2 text-xs rounded-md border border-border bg-background"
                  value={selectedInstance.props.orientation || 'vertical'}
                  onChange={(e) => {
                    updateInstance(selectedInstance.id, {
                      props: { ...selectedInstance.props, orientation: e.target.value }
                    });
                  }}
                >
                  <option value="horizontal">Horizontal</option>
                  <option value="vertical">Vertical</option>
                </select>
              </div>

              <div className="space-y-3 pt-3 border-t border-border">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-foreground">Options</label>
                  <Button
                    size="sm"
                    onClick={() => {
                      const currentOptions = selectedInstance.props.options || [];
                      const newOption = {
                        id: Date.now().toString(),
                        label: 'New Option',
                        value: 'new-option'
                      };
                      updateInstance(selectedInstance.id, {
                        props: { ...selectedInstance.props, options: [...currentOptions, newOption] }
                      });
                    }}
                    className="h-6 text-xs px-2"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Add Option
                  </Button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {(selectedInstance.props.options || []).map((option: { id: string; label: string; value: string }, index: number) => (
                    <div key={option.id} className="flex items-center gap-2 p-2 bg-muted/50 rounded-md">
                      <div className="flex-1 space-y-1">
                        <Input
                          type="text"
                          value={option.label}
                          onChange={(e) => {
                            const newOptions = [...selectedInstance.props.options];
                            newOptions[index] = { ...option, label: e.target.value };
                            updateInstance(selectedInstance.id, {
                              props: { ...selectedInstance.props, options: newOptions }
                            });
                          }}
                          className="h-6 text-xs"
                          placeholder="Option label"
                        />
                        <Input
                          type="text"
                          value={option.value}
                          onChange={(e) => {
                            const newOptions = [...selectedInstance.props.options];
                            newOptions[index] = { ...option, value: e.target.value };
                            updateInstance(selectedInstance.id, {
                              props: { ...selectedInstance.props, options: newOptions }
                            });
                          }}
                          className="h-6 text-xs"
                          placeholder="Option value"
                        />
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          const newOptions = selectedInstance.props.options.filter((_: any, i: number) => i !== index);
                          updateInstance(selectedInstance.id, {
                            props: { ...selectedInstance.props, options: newOptions }
                          });
                        }}
                        className="h-6 w-6 p-0"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="required"
                  checked={selectedInstance.props.required || false}
                  onChange={(e) => {
                    updateInstance(selectedInstance.id, {
                      props: { ...selectedInstance.props, required: e.target.checked }
                    });
                  }}
                  className="w-4 h-4"
                />
                <label htmlFor="required" className="text-xs text-foreground cursor-pointer">
                  Required
                </label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="disabled"
                  checked={selectedInstance.props.disabled || false}
                  onChange={(e) => {
                    updateInstance(selectedInstance.id, {
                      props: { ...selectedInstance.props, disabled: e.target.checked }
                    });
                  }}
                  className="w-4 h-4"
                />
                <label htmlFor="disabled" className="text-xs text-foreground cursor-pointer">
                  Disabled
                </label>
              </div>
            </div>
          )}

          {selectedInstance.type === 'CheckboxField' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="required"
                  checked={selectedInstance.props.required || false}
                  onChange={(e) => {
                    updateInstance(selectedInstance.id, {
                      props: { ...selectedInstance.props, required: e.target.checked }
                    });
                  }}
                  className="w-4 h-4"
                />
                <label htmlFor="required" className="text-xs text-foreground cursor-pointer">
                  Required
                </label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="disabled"
                  checked={selectedInstance.props.disabled || false}
                  onChange={(e) => {
                    updateInstance(selectedInstance.id, {
                      props: { ...selectedInstance.props, disabled: e.target.checked }
                    });
                  }}
                  className="w-4 h-4"
                />
                <label htmlFor="disabled" className="text-xs text-foreground cursor-pointer">
                  Disabled
                </label>
              </div>
            </div>
          )}

          {selectedInstance.type !== 'Image' && 
           selectedInstance.type !== 'Container' && 
           selectedInstance.type !== 'Div' && 
           selectedInstance.type !== 'Section' &&
           selectedInstance.type !== 'Table' &&
           selectedInstance.type !== 'Navigation' &&
           selectedInstance.type !== 'FormButton' &&
           selectedInstance.type !== 'InputLabel' &&
           selectedInstance.type !== 'TextInput' &&
           selectedInstance.type !== 'TextArea' &&
           selectedInstance.type !== 'Select' &&
           selectedInstance.type !== 'RadioGroup' &&
           selectedInstance.type !== 'CheckboxField' && (
            <div className="text-sm text-muted-foreground text-center">
              No settings available for this component
            </div>
          )}
        </TabsContent>

        <TabsContent value="pages" className="flex-1 min-h-0 m-0 p-0 overflow-y-auto overflow-x-hidden">
          <div className="p-1.5">
            {safePages.map((page) => (
              <div
                key={page}
                className={`flex items-center justify-between p-1.5 rounded cursor-pointer hover:bg-accent ${
                  currentPage === page ? 'bg-accent' : ''
                }`}
                onClick={() => handlePageClick(page)}
              >
                <div className="flex items-center gap-2">
                  {homePage === page ? (
                    <Home className="w-4 h-4 text-primary" />
                  ) : (
                    <FileText className="w-4 h-4" />
                  )}
                  <span className="text-xs">{pageNames[page] || page}</span>
                </div>
                <ChevronRight 
                  className="w-4 h-4 text-muted-foreground hover:text-foreground"
                />
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="actions" className="flex-1 min-h-0 m-0 p-4 overflow-y-auto overflow-x-hidden">
          <div className="text-sm text-muted-foreground text-center">
            Actions panel coming soon
          </div>
        </TabsContent>

        <TabsContent value="data" className="flex-1 min-h-0 m-0 p-4 overflow-y-auto overflow-x-hidden">
          <div className="text-sm text-muted-foreground text-center">
            Data binding coming soon
          </div>
        </TabsContent>
      </Tabs>

      {/* Page Settings Drawer */}
      <Sheet open={pageSettingsOpen} onOpenChange={setPageSettingsOpen}>
        <SheetContent side="right" className="w-[340px] overflow-y-auto p-4">
          <SheetHeader className="pb-3 space-y-1">
            <SheetTitle className="text-sm">Page Settings</SheetTitle>
            <SheetDescription className="text-xs">Configure settings for this page</SheetDescription>
          </SheetHeader>
          <div className="mt-3 space-y-3">
            {/* Page Name */}
            <div className="space-y-1.5">
              <Label htmlFor="page-name" className="text-xs">Page Name</Label>
              <Input
                id="page-name"
                value={pageNames[selectedPageForSettings] || ''}
                onChange={(e) => onPageNameChange(selectedPageForSettings, e.target.value)}
                className="h-7 text-xs"
              />
              <div className="flex items-center gap-2 mt-1.5">
                <Checkbox 
                  id="home-page"
                  checked={homePage === selectedPageForSettings}
                  onCheckedChange={(checked) => {
                    if (checked) onSetHomePage(selectedPageForSettings);
                  }}
                  className="h-3 w-3"
                />
                <Label htmlFor="home-page" className="text-xs font-normal">
                  Make "{pageNames[selectedPageForSettings]}" the home page
                </Label>
              </div>
            </div>

            {/* Path */}
            <div className="space-y-1.5">
              <Label htmlFor="page-path" className="text-xs">Path</Label>
              <Input
                id="page-path"
                value={`/${pageNames[selectedPageForSettings]?.toLowerCase().replace(/\s+/g, '-') || ''}`}
                disabled
                className="bg-muted h-7 text-xs"
              />
            </div>

            {/* Status Code */}
            <div className="space-y-1.5">
              <Label htmlFor="status-code" className="text-xs">Status Code</Label>
              <Input
                id="status-code"
                value={statusCode}
                onChange={(e) => setStatusCode(e.target.value)}
                placeholder="200"
                className="h-7 text-xs"
              />
            </div>

            {/* Redirect */}
            <div className="space-y-1.5">
              <Label htmlFor="redirect" className="text-xs">Redirect</Label>
              <Input
                id="redirect"
                value={redirect}
                onChange={(e) => setRedirect(e.target.value)}
                placeholder="/another-path"
                className="h-7 text-xs"
              />
            </div>

            <Separator className="my-3" />

            {/* Search Section */}
            <div className="space-y-2.5">
              <div>
                <h3 className="text-xs font-semibold mb-0.5">Search</h3>
                <p className="text-[10px] text-muted-foreground">Optimize the way this page appears in search results.</p>
              </div>

              {/* Title */}
              <div className="space-y-1.5">
                <Label htmlFor="meta-title" className="text-xs">Title</Label>
                <Input
                  id="meta-title"
                  value={pageMetaTitle}
                  onChange={(e) => setPageMetaTitle(e.target.value)}
                  placeholder="Untitled"
                  className="h-7 text-xs"
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <Label htmlFor="meta-description" className="text-xs">Description</Label>
                <Textarea
                  id="meta-description"
                  value={pageMetaDescription}
                  onChange={(e) => setPageMetaDescription(e.target.value)}
                  placeholder="Enter page description"
                  rows={3}
                  className="text-xs resize-none"
                />
              </div>

              {/* Language */}
              <div className="space-y-1.5">
                <Label htmlFor="language" className="text-xs">Language</Label>
                <Input
                  id="language"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  placeholder="en-US"
                  className="h-7 text-xs"
                />
              </div>
            </div>

            <Separator className="my-3" />

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                className="flex items-center gap-1.5 h-7 text-xs"
                onClick={() => {
                  onDuplicatePage(selectedPageForSettings);
                  setPageSettingsOpen(false);
                }}
              >
                <Copy className="w-3 h-3" />
                Duplicate
              </Button>
              <Button
                variant="destructive"
                className="flex items-center gap-1.5 h-7 text-xs"
                onClick={() => {
                  onDeletePage(selectedPageForSettings);
                  setPageSettingsOpen(false);
                }}
                disabled={safePages.length === 1}
              >
                <Trash2 className="w-3 h-3" />
                Delete
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};
