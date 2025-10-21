import React, { useState, useEffect } from 'react';
import { useBuilderStore } from '../store/useBuilderStore';
import { useStyleStore } from '../store/useStyleStore';
import { PseudoState } from '../store/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Paintbrush, Plus, Square, Type, Heading as HeadingIcon, MousePointerClick, Image as ImageIcon, Link as LinkIcon, X, ChevronDown, Settings, Zap, Database, RotateCcw } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { componentRegistry } from '../primitives/registry';
import { UnitInput } from './UnitInput';
import { ColorPicker } from './ColorPicker';
import { SpacingControl } from './SpacingControl';
import { FontPicker } from './FontPicker';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { ClassSelector } from './ClassSelector';
import { ImageUpload } from './ImageUpload';
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

export const StylePanel: React.FC<StylePanelProps> = ({}) => {
  const { getSelectedInstance, updateInstance } = useBuilderStore();
  const { setStyle, getComputedStyles, styleSources, createStyleSource, nextLocalClassName, renameStyleSource, deleteStyleSource, currentPseudoState, setCurrentPseudoState, resetStyles } = useStyleStore();
  const selectedInstance = getSelectedInstance();
  
  // ALL useState hooks MUST be at the top, before any conditional logic
  const [classNameInput, setClassNameInput] = useState('');
  const [isEditingLabel, setIsEditingLabel] = useState(false);
  const [labelInput, setLabelInput] = useState('');
  const [activeTab, setActiveTab] = useState('style');
  const [activeClassIndex, setActiveClassIndex] = useState<number | null>(null);
  const [isMarginLinked, setIsMarginLinked] = useState(false);
  const [isPaddingLinked, setIsPaddingLinked] = useState(false);
  
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

  // Get computed styles - always show the full cascade (all classes combined)
  // This shows both active (blue) and inherited (yellow) properties
  const computedStyles = selectedInstance 
    ? getComputedStyles(selectedInstance.styleSourceIds || [])
    : {};

  // Sync label input to selected instance (unconditional hook placement)
  useEffect(() => {
    if (selectedInstance) {
      setLabelInput(selectedInstance.label || selectedInstance.type);
    }
  }, [selectedInstance?.id, selectedInstance?.label, selectedInstance?.type]);

  if (!selectedInstance) {
    return (
      <div className="w-64 h-full bg-background border border-border rounded-lg shadow-xl flex flex-col overflow-hidden backdrop-blur-md bg-white/70 dark:bg-zinc-900/70">
        <Tabs defaultValue="styles" className="flex-1 flex flex-col">
          <TabsList className="w-full grid grid-cols-2 rounded-none border-b bg-transparent h-10 p-1 gap-1">
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
              <Settings className="w-3 h-3" />
              Settings
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
    
    return (
      <div className="Section">
        <div className="SectionHeader" onClick={() => toggleSection(section)}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <span className={`SectionTitle ${hasStyles ? (isPrimary ? 'text-blue-600 dark:text-blue-400' : 'text-yellow-600 dark:text-yellow-400') : ''}`}>
              {title}
            </span>
            {hasStyles && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span style={{ 
                      width: '8px', 
                      height: '8px', 
                      borderRadius: '50%', 
                      background: isPrimary ? 'hsl(217, 91%, 60%)' : 'hsl(45, 93%, 47%)'
                    }} />
                  </TooltipTrigger>
                  <TooltipContent side="right" className="bg-popover border border-border">
                    <div className="flex items-center gap-2">
                      <span className="text-xs">
                        {isPrimary ? 'Primary class styles' : 'Combo class overrides'}
                      </span>
                      {properties && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-5 px-2 text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            clearSectionStyles(properties);
                          }}
                        >
                          Clear
                        </Button>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
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
        <TabsList className="w-full grid grid-cols-2 rounded-none border-b bg-transparent h-10 p-1 gap-1 flex-shrink-0">
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
            <Settings className="w-3 h-3" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="style" className="flex-1 min-h-0 m-0 overflow-y-auto overflow-x-hidden">
          <div className="StylePanel" style={{ overflowX: 'hidden' }}>
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
                <div style={{ fontSize: '10px', fontWeight: 600, color: 'hsl(var(--muted-foreground))', letterSpacing: '0.5px' }}>
                  STYLE SOURCES
                </div>
                {classes.length > 0 && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-5 w-5 p-0 text-foreground hover:text-primary"
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

              {/* Integrated State dropdown + Class selector */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-1">
                  {/* Compact State dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className={`h-6 w-6 p-0 justify-center border border-border ${currentPseudoState !== 'default' ? 'bg-green-500/10 border-green-500/50' : ''}`}
                        title={`State: ${currentPseudoState}`}
                      >
                        <ChevronDown className="w-3 h-3 text-foreground" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" side="bottom" className="w-32 bg-popover border border-border z-[10000]">
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
                            className="flex items-center justify-between"
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

                  {/* Class selector taking remaining space */}
                  <div className="flex-1">
                    <ClassSelector
                      selectedClasses={classes}
                      onAddClass={handleAddClass}
                      onRemoveClass={handleRemoveClass}
                      onClassClick={handleClassClick}
                      activeClassIndex={activeClassIndex}
                    />
                  </div>
                </div>
              </div>

              {classes.length === 0 && (
                <div 
                  className="bg-muted/50 border border-dashed border-border rounded text-center mt-3"
                  style={{ padding: 'var(--space-3)' }}
                >
                  <div style={{ fontSize: '11px', color: 'hsl(var(--muted-foreground))', marginBottom: '4px' }}>
                    No classes assigned
                  </div>
                  <div style={{ fontSize: '10px', color: 'hsl(var(--muted-foreground))' }}>
                    Add a class or style to auto-create one
                  </div>
                </div>
              )}
            </div>

      {/* Layout */}
      <AccordionSection title="Layout" section="layout" properties={['display', 'flexDirection', 'justifyContent', 'alignItems', 'flexWrap', 'gap', 'gridTemplateColumns', 'gridTemplateRows', 'gridAutoFlow', 'placeItems', 'placeContent']}>
        <div className="Col">
          <div className="Row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <label className="Label" style={{ fontWeight: 600 }}>Display</label>
            <select
              className="Select"
              value={computedStyles.display || 'block'}
              onChange={(e) => updateStyle('display', e.target.value)}
              style={{ flex: 1, marginLeft: 'var(--space-2)' }}
            >
              <option value="block">Block</option>
              <option value="flex">Flex</option>
              <option value="grid">Grid</option>
              <option value="inline">Inline</option>
              <option value="inline-block">Inline Block</option>
              <option value="none">None</option>
            </select>
          </div>

          {isFlexDisplay && (
            <div className="FlexControls" style={{ marginTop: 'var(--space-3)' }}>
              <div className="AlignGrid">
                {Array.from({ length: 9 }).map((_, i) => {
                  const row = Math.floor(i / 3);
                  const col = i % 3;
                  const isActive = 
                    (computedStyles.justifyContent === 'flex-start' && col === 0) ||
                    (computedStyles.justifyContent === 'center' && col === 1) ||
                    (computedStyles.justifyContent === 'flex-end' && col === 2);
                  
                  return (
                    <button 
                      key={i} 
                      className="AlignBtn"
                      data-state={row === 1 && isActive ? "on" : "off"}
                      onClick={() => {
                        if (col === 0) updateStyle('justifyContent', 'flex-start');
                        if (col === 1) updateStyle('justifyContent', 'center');
                        if (col === 2) updateStyle('justifyContent', 'flex-end');
                      }}
                    />
                  );
                })}
              </div>

              <div className="FlexControlsColumn">
                <div className="Col">
                  <label className="Label">Direction</label>
                  <select
                    className="Select"
                    value={computedStyles.flexDirection || 'row'}
                    onChange={(e) => updateStyle('flexDirection', e.target.value)}
                  >
                    <option value="row">row</option>
                    <option value="column">column</option>
                  </select>
                </div>

                <div className="Col">
                  <label className="Label">Justify</label>
                  <select
                    className="Select"
                    value={computedStyles.justifyContent || 'flex-start'}
                    onChange={(e) => updateStyle('justifyContent', e.target.value)}
                  >
                    <option value="flex-start">start</option>
                    <option value="center">center</option>
                    <option value="flex-end">end</option>
                    <option value="space-between">space-between</option>
                  </select>
                </div>

                <div className="Col">
                  <label className="Label">Align</label>
                  <select
                    className="Select"
                    value={computedStyles.alignItems || 'stretch'}
                    onChange={(e) => updateStyle('alignItems', e.target.value)}
                  >
                    <option value="stretch">stretch</option>
                    <option value="flex-start">start</option>
                    <option value="center">center</option>
                    <option value="flex-end">end</option>
                  </select>
                </div>

                <div className="Row" style={{ gap: 'var(--space-2)' }}>
                  <input
                    className="Input SpaceInputSmall"
                    type="text"
                    value={computedStyles.gap?.replace(/[a-z%]/gi, '') || '0'}
                    onChange={(e) => updateStyle('gap', e.target.value + 'px')}
                  />
                  <span className="Label">PX</span>
                  <span style={{ fontSize: '18px', color: 'var(--subtle)' }}>🔗</span>
                  <input
                    className="Input SpaceInputSmall"
                    type="text"
                    value={computedStyles.gap?.replace(/[a-z%]/gi, '') || '0'}
                    onChange={(e) => updateStyle('gap', e.target.value + 'px')}
                  />
                  <span className="Label">PX</span>
                </div>
              </div>
            </div>
          )}

          {isGridDisplay && (
            <div style={{ marginTop: 'var(--space-3)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              {/* Grid Columns and Rows */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <label className="Label" style={{ fontSize: '10px', color: 'hsl(217, 91%, 60%)', minWidth: '28px' }}>Cols</label>
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
                    style={{ textAlign: 'center', flex: 1 }}
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <label className="Label" style={{ fontSize: '10px', color: 'hsl(217, 91%, 60%)', minWidth: '28px' }}>Rows</label>
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
                    style={{ textAlign: 'center', flex: 1 }}
                  />
                </div>
              </div>

              {/* Grid Template Columns */}
              <div className="Col">
                <label className="Label" style={{ fontSize: '10px' }}>Template Cols</label>
                <input
                  className="Input"
                  type="text"
                  placeholder="repeat(3, 1fr)"
                  value={computedStyles.gridTemplateColumns || ''}
                  onChange={(e) => updateStyle('gridTemplateColumns', e.target.value)}
                />
              </div>

              {/* Grid Template Rows */}
              <div className="Col">
                <label className="Label" style={{ fontSize: '10px' }}>Template Rows</label>
                <input
                  className="Input"
                  type="text"
                  placeholder="repeat(2, auto)"
                  value={computedStyles.gridTemplateRows || ''}
                  onChange={(e) => updateStyle('gridTemplateRows', e.target.value)}
                />
              </div>

              {/* Grid Auto Flow */}
              <div className="Col">
                <label className="Label" style={{ fontSize: '10px' }}>Direction</label>
                <select
                  className="Select"
                  value={computedStyles.gridAutoFlow || 'row'}
                  onChange={(e) => updateStyle('gridAutoFlow', e.target.value)}
                >
                  <option value="row">Row</option>
                  <option value="column">Column</option>
                  <option value="dense">Dense</option>
                  <option value="row dense">Row Dense</option>
                  <option value="column dense">Column Dense</option>
                </select>
              </div>

              {/* Place Items (align + justify items) */}
              <div style={{ display: 'grid', gridTemplateColumns: '32px 1fr', gap: '4px', alignItems: 'center' }}>
                <label className="Label" style={{ fontSize: '10px' }}>Align</label>
                <select
                  className="Select"
                  value={computedStyles.alignItems || 'stretch'}
                  onChange={(e) => updateStyle('alignItems', e.target.value)}
                >
                  <option value="stretch">Stretch</option>
                  <option value="start">Start</option>
                  <option value="center">Center</option>
                  <option value="end">End</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '32px 1fr', gap: '4px', alignItems: 'center' }}>
                <label className="Label" style={{ fontSize: '10px' }}>Justify</label>
                <select
                  className="Select"
                  value={computedStyles.justifyItems || 'stretch'}
                  onChange={(e) => updateStyle('justifyItems', e.target.value)}
                >
                  <option value="stretch">Stretch</option>
                  <option value="start">Start</option>
                  <option value="center">Center</option>
                  <option value="end">End</option>
                </select>
              </div>

              {/* Gap */}
              <div className="Col">
                <label className="Label" style={{ fontSize: '10px' }}>Gap</label>
                <UnitInput
                  value={computedStyles.gap || ''}
                  onChange={(val) => updateStyle('gap', val)}
                  placeholder="16px"
                />
              </div>

              {/* Place Content */}
              <div style={{ display: 'grid', gridTemplateColumns: '32px 1fr', gap: '4px', alignItems: 'center' }}>
                <label className="Label" style={{ fontSize: '10px' }}>Place</label>
                <select
                  className="Select"
                  value={computedStyles.placeContent || 'normal'}
                  onChange={(e) => updateStyle('placeContent', e.target.value)}
                >
                  <option value="normal">Normal</option>
                  <option value="start">Start</option>
                  <option value="center">Center</option>
                  <option value="end">End</option>
                  <option value="space-between">Space Between</option>
                  <option value="space-around">Space Around</option>
                  <option value="space-evenly">Space Evenly</option>
                  <option value="stretch">Stretch</option>
                </select>
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
          <div style={{ display: 'grid', gridTemplateColumns: '32px 1fr 32px 1fr', gap: '4px', alignItems: 'center' }}>
            <label className="Label" style={{ fontSize: '10px' }}>Width</label>
            <UnitInput
              value={computedStyles.width || ''}
              onChange={(val) => updateStyle('width', val)}
              placeholder="Auto"
            />
            <label className="Label" style={{ fontSize: '10px' }}>Height</label>
            <UnitInput
              value={computedStyles.height || ''}
              onChange={(val) => updateStyle('height', val)}
              placeholder="Auto"
            />
          </div>

          {/* Min Width and Min Height */}
          <div style={{ display: 'grid', gridTemplateColumns: '32px 1fr 32px 1fr', gap: '4px', alignItems: 'center' }}>
            <label className="Label" style={{ fontSize: '10px' }}>Min W</label>
            <UnitInput
              value={computedStyles.minWidth || ''}
              onChange={(val) => updateStyle('minWidth', val)}
              placeholder="auto"
            />
            <label className="Label" style={{ fontSize: '10px' }}>Min H</label>
            <UnitInput
              value={computedStyles.minHeight || ''}
              onChange={(val) => updateStyle('minHeight', val)}
              placeholder="auto"
            />
          </div>

          {/* Max Width and Max Height */}
          <div style={{ display: 'grid', gridTemplateColumns: '32px 1fr 32px 1fr', gap: '4px', alignItems: 'center' }}>
            <label className="Label" style={{ fontSize: '10px' }}>Max W</label>
            <UnitInput
              value={computedStyles.maxWidth || ''}
              onChange={(val) => updateStyle('maxWidth', val)}
              placeholder="none"
            />
            <label className="Label" style={{ fontSize: '10px' }}>Max H</label>
            <UnitInput
              value={computedStyles.maxHeight || ''}
              onChange={(val) => updateStyle('maxHeight', val)}
              placeholder="none"
            />
          </div>

          {/* Overflow */}
          <div style={{ display: 'grid', gridTemplateColumns: '32px 1fr', gap: '4px', alignItems: 'center' }}>
            <label className="Label" style={{ fontSize: '10px' }}>Overflow</label>
            <select
              className="Select"
              value={computedStyles.overflow || 'visible'}
              onChange={(e) => updateStyle('overflow', e.target.value)}
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
          <div style={{ display: 'grid', gridTemplateColumns: '32px 1fr', gap: '4px', alignItems: 'center' }}>
            <label className="Label" style={{ fontSize: '10px' }}>Position</label>
            <select
              className="Select"
              value={computedStyles.position || 'static'}
              onChange={(e) => updateStyle('position', e.target.value)}
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
              <div style={{ display: 'grid', gridTemplateColumns: '32px 1fr', gap: '4px', alignItems: 'center' }}>
                <label className="Label" style={{ fontSize: '10px' }}>Z-Index</label>
                <input
                  className="Input"
                  type="number"
                  value={computedStyles.zIndex?.toString() || ''}
                  onChange={(e) => updateStyle('zIndex', e.target.value)}
                  placeholder="Auto"
                />
              </div>
            </>
          )}
        </div>
      </AccordionSection>

      {/* Typography */}
      <AccordionSection title="Typography" section="typography" properties={['fontFamily', 'fontSize', 'fontWeight', 'lineHeight', 'letterSpacing', 'textAlign', 'textDecoration', 'textTransform', 'color']}>
        <div className="Col" style={{ gap: '8px' }}>
          <div>
            <label className="Label" style={{ fontSize: '10px', marginBottom: '4px', display: 'block' }}>Font Family</label>
            <FontPicker
              value={computedStyles.fontFamily || ''}
              weight={computedStyles.fontWeight || '400'}
              onChange={(val) => updateStyle('fontFamily', val)}
              onWeightChange={(val) => updateStyle('fontWeight', val)}
            />
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '32px 1fr', gap: '4px', alignItems: 'center' }}>
            <label className="Label" style={{ fontSize: '10px' }}>Size</label>
            <UnitInput
              value={computedStyles.fontSize || ''}
              onChange={(val) => updateStyle('fontSize', val)}
              placeholder="16px"
            />
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '32px 1fr', gap: '4px', alignItems: 'center' }}>
            <label className="Label" style={{ fontSize: '10px' }}>Color</label>
            <ColorPicker
              value={computedStyles.color || 'hsl(var(--foreground))'}
              onChange={(val) => updateStyle('color', val)}
            />
          </div>
        </div>
      </AccordionSection>

      {/* Backgrounds */}
      <AccordionSection title="Backgrounds" section="backgrounds" properties={['backgroundColor', 'backgroundImage', 'backgroundSize', 'backgroundPosition', 'backgroundRepeat', 'backgroundClip']}>
        <div className="Col" style={{ gap: '4px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '32px 1fr', gap: '4px', alignItems: 'center' }}>
            <label className="Label" style={{ fontSize: '10px' }}>Color</label>
            <ColorPicker
              value={computedStyles.backgroundColor || 'transparent'}
              onChange={(val) => updateStyle('backgroundColor', val)}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '32px 1fr', gap: '4px', alignItems: 'center' }}>
            <label className="Label" style={{ fontSize: '10px' }}>Clip</label>
            <select
              className="Select"
              value={computedStyles.backgroundClip || 'border-box'}
              onChange={(e) => updateStyle('backgroundClip', e.target.value)}
            >
              <option value="border-box">Border Box</option>
              <option value="padding-box">Padding Box</option>
              <option value="content-box">Content Box</option>
              <option value="text">Text</option>
            </select>
          </div>
        </div>
      </AccordionSection>

      {/* Borders */}
      <AccordionSection title="Borders" section="borders" properties={['borderWidth', 'borderStyle', 'borderColor', 'borderRadius', 'borderTopLeftRadius', 'borderTopRightRadius', 'borderBottomRightRadius', 'borderBottomLeftRadius']}>
        <div className="Col" style={{ gap: '4px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '32px 1fr', gap: '4px', alignItems: 'center' }}>
            <label className="Label" style={{ fontSize: '10px' }}>Radius</label>
            <UnitInput
              value={computedStyles.borderRadius || ''}
              onChange={(val) => updateStyle('borderRadius', val)}
              placeholder="0"
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '32px 1fr 32px 1fr', gap: '4px', alignItems: 'center' }}>
            <label className="Label" style={{ fontSize: '10px' }}>Style</label>
            <select
              className="Select"
              value={computedStyles.borderStyle || 'none'}
              onChange={(e) => updateStyle('borderStyle', e.target.value)}
            >
              <option value="none">None</option>
              <option value="solid">Solid</option>
              <option value="dashed">Dashed</option>
              <option value="dotted">Dotted</option>
              <option value="double">Double</option>
              <option value="groove">Groove</option>
              <option value="ridge">Ridge</option>
            </select>
            <label className="Label" style={{ fontSize: '10px' }}>Width</label>
            <UnitInput
              value={computedStyles.borderWidth || ''}
              onChange={(val) => updateStyle('borderWidth', val)}
              placeholder="0"
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '32px 1fr', gap: '4px', alignItems: 'center' }}>
            <label className="Label" style={{ fontSize: '10px' }}>Color</label>
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
          <div style={{ display: 'grid', gridTemplateColumns: '32px 1fr', gap: '4px', alignItems: 'center' }}>
            <label className="Label" style={{ fontSize: '10px' }}>Blend</label>
            <select
              className="Select"
              value={computedStyles.mixBlendMode || 'normal'}
              onChange={(e) => updateStyle('mixBlendMode', e.target.value)}
            >
              <option value="normal">Normal</option>
              <option value="multiply">Multiply</option>
              <option value="screen">Screen</option>
              <option value="overlay">Overlay</option>
              <option value="darken">Darken</option>
              <option value="lighten">Lighten</option>
              <option value="color-dodge">Color Dodge</option>
              <option value="color-burn">Color Burn</option>
              <option value="difference">Difference</option>
              <option value="exclusion">Exclusion</option>
            </select>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '32px 1fr', gap: '4px', alignItems: 'center' }}>
            <label className="Label" style={{ fontSize: '10px' }}>Opacity</label>
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
          <div style={{ display: 'grid', gridTemplateColumns: '32px 1fr', gap: '4px', alignItems: 'center' }}>
            <label className="Label" style={{ fontSize: '10px' }}>Shadow</label>
            <input
              className="Input"
              type="text"
              placeholder="0 4px 6px rgba(0,0,0,0.1)"
              value={computedStyles.boxShadow || ''}
              onChange={(e) => updateStyle('boxShadow', e.target.value)}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '32px 1fr', gap: '4px', alignItems: 'center' }}>
            <label className="Label" style={{ fontSize: '10px' }}>Filter</label>
            <input
              className="Input"
              type="text"
              placeholder="blur(4px)"
              value={computedStyles.filter || ''}
              onChange={(e) => updateStyle('filter', e.target.value)}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '32px 1fr', gap: '4px', alignItems: 'center' }}>
            <label className="Label" style={{ fontSize: '10px' }}>Transform</label>
            <input
              className="Input"
              type="text"
              placeholder="rotate(10deg)"
              value={computedStyles.transform || ''}
              onChange={(e) => updateStyle('transform', e.target.value)}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '32px 1fr', gap: '4px', alignItems: 'center' }}>
            <label className="Label" style={{ fontSize: '10px' }}>Cursor</label>
            <select
              className="Select"
              value={computedStyles.cursor || 'auto'}
              onChange={(e) => updateStyle('cursor', e.target.value)}
            >
              <option value="auto">Auto</option>
              <option value="pointer">Pointer</option>
              <option value="text">Text</option>
              <option value="move">Move</option>
              <option value="grab">Grab</option>
              <option value="not-allowed">Not Allowed</option>
            </select>
          </div>
        </div>
      </AccordionSection>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="flex-1 min-h-0 m-0 p-4 overflow-y-auto overflow-x-hidden">
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
                <label className="text-xs font-semibold text-foreground">Alt Text</label>
                <Input
                  type="text"
                  placeholder="Image description"
                  value={selectedInstance.props.alt || ''}
                  onChange={(e) => {
                    updateInstance(selectedInstance.id, {
                      props: { ...selectedInstance.props, alt: e.target.value }
                    });
                  }}
                  className="h-8 text-xs"
                />
                <p className="text-xs text-muted-foreground">
                  Describe the image for accessibility and SEO
                </p>
              </div>
            </div>
          )}

          {(selectedInstance.type === 'Container' || selectedInstance.type === 'Box' || selectedInstance.type === 'Section') && (
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

          {selectedInstance.type !== 'Image' && 
           selectedInstance.type !== 'Container' && 
           selectedInstance.type !== 'Box' && 
           selectedInstance.type !== 'Section' && (
            <div className="text-sm text-muted-foreground text-center">
              No settings available for this component
            </div>
          )}
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
    </div>
  );
};
