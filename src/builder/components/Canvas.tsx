import React, { useState, useEffect, useRef } from 'react';
import { GripVertical } from 'lucide-react';
import { useBuilderStore } from '../store/useBuilderStore';
import { useStyleStore } from '../store/useStyleStore';
import { useCommentStore } from '../store/useCommentStore';
import { usePageStore } from '../store/usePageStore';
import { ComponentInstance } from '../store/types';
import { Div } from '../primitives/Box';
import { Container } from '../primitives/Container';
import { Section } from '../primitives/Section';
import { Text } from '../primitives/Text';
import { Heading } from '../primitives/Heading';
import { RichText } from '../primitives/RichText';
import { Blockquote } from '../primitives/Blockquote';
import { OrderedList } from '../primitives/OrderedList';
import { UnorderedList } from '../primitives/UnorderedList';
import { CodeBlock } from '../primitives/CodeBlock';
import { ButtonPrimitive } from '../primitives/ButtonPrimitive';
import { ImagePrimitive } from '../primitives/ImagePrimitive';
import { VideoPrimitive } from '../primitives/VideoPrimitive';
import { YoutubePrimitive } from '../primitives/YoutubePrimitive';
import { LottiePrimitive } from '../primitives/LottiePrimitive';
import { IconPrimitive } from '../primitives/IconPrimitive';
import { LinkPrimitive } from '../primitives/LinkPrimitive';
import { TablePrimitive } from '../primitives/TablePrimitive';
import { FormPrimitive } from '../primitives/FormPrimitive';
import { FormButtonPrimitive } from '../primitives/FormButtonPrimitive';
import { InputLabelPrimitive } from '../primitives/InputLabelPrimitive';
import { TextInputPrimitive } from '../primitives/TextInputPrimitive';
import { TextAreaPrimitive } from '../primitives/TextAreaPrimitive';
import { SelectPrimitive } from '../primitives/SelectPrimitive';
import { RadioPrimitive } from '../primitives/RadioPrimitive';
import { CheckboxPrimitive } from '../primitives/CheckboxPrimitive';
import { NavigationPrimitive, generateLinkStyles as generateNavLinkStyles } from '../primitives/NavigationPrimitive';
import { ResponsiveNavWrapper } from './ResponsiveNavWrapper';
import { CellPrimitive } from '../primitives/CellPrimitive';
import { DropdownPrimitive } from '../primitives/DropdownPrimitive';
import { breakpoints } from './PageNavigation';
import { ContextMenu } from './ContextMenu';
import { SelectionOverlay } from './SelectionOverlay';
import { HoverOverlay } from './HoverOverlay';
import { HeadingSettingsPopover } from './HeadingSettingsPopover';
import { SavePrebuiltDialog } from './SavePrebuiltDialog';
import { AddCommentDialog } from './AddCommentDialog';
import { CommentMarker } from './CommentMarker';
import { useDroppable } from '@dnd-kit/core';
import { componentRegistry } from '../primitives/registry';
import { generateId } from '../utils/instance';
import { DroppableContainer } from './DroppableContainer';
import { DraggableInstance } from './DraggableInstance';
import { TableRowElement, TableHeaderCellElement, TableCellElement } from './TableElements';
import { Accordion as ShadcnAccordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { CarouselPreview } from './CarouselPreview';

// Canvas Resize Handle Component with improved UX
interface CanvasResizeHandleProps {
  side: 'left' | 'right';
  isActive: boolean;
  onMouseDown: (e: React.MouseEvent, side: 'left' | 'right') => void;
}

const CanvasResizeHandle: React.FC<CanvasResizeHandleProps> = ({ side, isActive, onMouseDown }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div
      className={`absolute ${side === 'left' ? 'left-0 -translate-x-1/2' : 'right-0 translate-x-1/2'} 
        top-0 bottom-0 w-4 cursor-ew-resize z-20 flex items-center justify-center group`}
      onMouseDown={(e) => onMouseDown(e, side)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Visible handle bar */}
      <div 
        className={`h-full transition-all duration-150 rounded-full
          ${isActive ? 'bg-blue-500 w-1.5' : isHovered ? 'bg-blue-400 w-1' : 'bg-gray-300/70 w-0.5'}
        `}
      />
      
      {/* Centered grip icon - appears on hover/active */}
      <div 
        className={`absolute top-1/2 -translate-y-1/2 
          flex items-center justify-center
          w-5 h-10 rounded-md border border-border bg-background shadow-md
          transition-all duration-150
          ${isActive || isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none'}
        `}
      >
        <GripVertical className="w-3.5 h-3.5 text-muted-foreground" />
      </div>
    </div>
  );
};

// TabsComponent for interactive tab switching in preview mode
const TabsComponent: React.FC<{
  instance: ComponentInstance;
  tabs: any[];
  defaultTab: string;
  isPreviewMode: boolean;
  getComputedStyles: (styleSourceIds: string[], breakpointId?: string, state?: any) => Record<string, any>;
  setSelectedInstanceId: (id: string | null) => void;
  setHoveredInstanceId: (id: string | null) => void;
  handleContextMenu: (e: React.MouseEvent, instance: ComponentInstance) => void;
  renderInstance?: (instance: ComponentInstance, parent?: ComponentInstance, index?: number) => React.ReactNode;
}> = ({ instance, tabs, defaultTab, isPreviewMode, getComputedStyles, setSelectedInstanceId, setHoveredInstanceId, handleContextMenu, renderInstance }) => {
  // Get TabPanel children only - no fallback to props.tabs
  const tabPanels = instance.children.filter(c => c.type === 'TabPanel');
  
  // Map TabPanel children to tab data - get label from TabTrigger child
  const allTabs = tabPanels.map((child, index) => {
    const trigger = child.children?.find(c => (c.type as string) === 'TabTrigger');
    return {
      id: child.id,
      label: trigger?.props?.text || child.props?.label || `Tab ${index + 1}`,
      content: child,
      disabled: trigger?.props?.disabled || child.props?.disabled || false,
    };
  });
  
  const [activeTab, setActiveTab] = useState(allTabs[0]?.id || '');

  // Reset active tab when defaultTab changes or tabs change
  useEffect(() => {
    const defaultTabId = instance.props?.defaultTab;
    if (defaultTabId && allTabs.some(t => t.id === defaultTabId)) {
      setActiveTab(defaultTabId);
    } else if (allTabs.length > 0 && !allTabs.some(t => t.id === activeTab)) {
      setActiveTab(allTabs[0].id);
    }
  }, [instance.props?.defaultTab, allTabs.length]);

  // Get tabsStyles from instance props
  const tabsStyles = instance.props?.tabsStyles || {
    listPosition: 'top',
    listBackground: 'transparent',
    listBorderRadius: '0',
    listPadding: '0',
    listGap: '4',
    triggerBackground: 'transparent',
    triggerHoverBackground: 'hsl(var(--muted))',
    triggerActiveBackground: 'transparent',
    triggerTextColor: 'hsl(var(--muted-foreground))',
    triggerActiveTextColor: 'hsl(var(--foreground))',
    triggerPadding: '8',
    triggerBorderRadius: '0',
    triggerFontSize: '14',
    triggerFontWeight: '500',
    indicatorStyle: 'underline',
    indicatorColor: 'hsl(var(--primary))',
    indicatorHeight: '2',
    contentBackground: 'transparent',
    contentPadding: '16',
    contentBorderRadius: '0',
  };

  const isVertical = tabsStyles.listPosition === 'left' || tabsStyles.listPosition === 'right';
  const isReversed = tabsStyles.listPosition === 'bottom' || tabsStyles.listPosition === 'right';

  // Build indicator styles based on indicator type
  const getIndicatorStyles = (isActive: boolean) => {
    if (!isActive || tabsStyles.indicatorStyle === 'none') return {};
    
    switch (tabsStyles.indicatorStyle) {
      case 'underline':
        return isVertical 
          ? { borderLeftWidth: `${tabsStyles.indicatorHeight}px`, borderLeftColor: tabsStyles.indicatorColor, borderLeftStyle: 'solid' as const }
          : { borderBottomWidth: `${tabsStyles.indicatorHeight}px`, borderBottomColor: tabsStyles.indicatorColor, borderBottomStyle: 'solid' as const };
      case 'pill':
        return { backgroundColor: tabsStyles.indicatorColor, color: 'white' };
      case 'boxed':
        return { backgroundColor: tabsStyles.triggerActiveBackground, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' };
      default:
        return {};
    }
  };

  // Find active tab content
  const activeTabData = allTabs.find((t: any) => t.id === activeTab);

  return (
    <div
      data-instance-id={instance.id}
      className={(instance.styleSourceIds || []).map((id) => useStyleStore.getState().styleSources[id]?.name).filter(Boolean).join(' ')}
      style={{
        ...getComputedStyles(instance.styleSourceIds || []) as React.CSSProperties,
        display: 'flex',
        flexDirection: isVertical 
          ? (isReversed ? 'row-reverse' : 'row') 
          : (isReversed ? 'column-reverse' : 'column'),
      }}
      onClick={isPreviewMode ? undefined : (e) => { e.stopPropagation(); setSelectedInstanceId(instance.id); }}
      onMouseEnter={isPreviewMode ? undefined : () => setHoveredInstanceId(instance.id)}
      onMouseLeave={isPreviewMode ? undefined : () => setHoveredInstanceId(null)}
      onContextMenu={isPreviewMode ? undefined : (e) => handleContextMenu(e, instance)}
    >
      {/* Tab List */}
      <div 
        style={{
          display: 'flex',
          flexDirection: isVertical ? 'column' : 'row',
          gap: `${tabsStyles.listGap}px`,
          padding: `${tabsStyles.listPadding}px`,
          backgroundColor: tabsStyles.listBackground,
          borderRadius: `${tabsStyles.listBorderRadius}px`,
          borderBottom: !isVertical && !isReversed ? '1px solid hsl(var(--border))' : undefined,
          borderTop: !isVertical && isReversed ? '1px solid hsl(var(--border))' : undefined,
          borderRight: isVertical && !isReversed ? '1px solid hsl(var(--border))' : undefined,
          borderLeft: isVertical && isReversed ? '1px solid hsl(var(--border))' : undefined,
          marginBottom: !isVertical && !isReversed ? '16px' : undefined,
          marginTop: !isVertical && isReversed ? '16px' : undefined,
          marginRight: isVertical && !isReversed ? '16px' : undefined,
          marginLeft: isVertical && isReversed ? '16px' : undefined,
        }}
      >
        {allTabs.map((tab: any) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              onClick={(e) => { e.stopPropagation(); setActiveTab(tab.id); }}
              style={{
                padding: `${tabsStyles.triggerPadding}px`,
                borderRadius: `${tabsStyles.triggerBorderRadius}px`,
                fontSize: `${tabsStyles.triggerFontSize}px`,
                fontWeight: tabsStyles.triggerFontWeight,
                backgroundColor: isActive ? tabsStyles.triggerActiveBackground : tabsStyles.triggerBackground,
                color: isActive ? tabsStyles.triggerActiveTextColor : tabsStyles.triggerTextColor,
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap',
                ...getIndicatorStyles(isActive),
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      
      {/* Content Panel */}
      <div 
        style={{
          flex: 1,
          padding: `${tabsStyles.contentPadding}px`,
          backgroundColor: tabsStyles.contentBackground,
          borderRadius: `${tabsStyles.contentBorderRadius}px`,
          fontSize: '14px',
          color: 'hsl(var(--muted-foreground))',
          minHeight: '60px',
        }}
      >
        {activeTabData && renderInstance
          ? renderInstance(activeTabData.content, instance, 0)
          : (activeTabData?.content?.props?.content || 'Tab content')}
      </div>
      
      {/* Render generic children (Text, Button, etc.) that were dropped directly into Tabs */}
      {(() => {
        const otherChildren = instance.children.filter(c => c.type !== 'TabPanel');
        return otherChildren.length > 0 && renderInstance ? (
          <div style={{ padding: `${tabsStyles.contentPadding}px`, borderTop: '1px dashed hsl(var(--border))' }}>
            {otherChildren.map((child, idx) => renderInstance(child, instance, idx))}
          </div>
        ) : null;
      })()}
      
      {allTabs.length === 0 && (
        <div className="py-4 text-sm text-muted-foreground italic">
          No tabs. Add tabs in the Data tab or drag TabPanel components.
        </div>
      )}
    </div>
  );
};

interface CanvasProps {
  zoom: number;
  onZoomChange?: (zoom: number) => void;
  currentBreakpoint: string;
  pages: string[];
  currentPage: string;
  pageNames: Record<string, string>;
  onPageNameChange: (pageId: string, newName: string) => void;
  isPanMode: boolean;
  isPreviewMode: boolean;
  onCanvasRef?: (element: HTMLElement | null) => void;
  onPageChange?: (pageId: string) => void;
  allPages?: Array<{ id: string; name: string; rootInstance: any }>;
  isRulersView?: boolean;
  isCodeViewOpen?: boolean;
}

export const Canvas: React.FC<CanvasProps> = ({ zoom, onZoomChange, currentBreakpoint, pages, currentPage, pageNames, onPageNameChange, isPanMode, isPreviewMode, onCanvasRef, onPageChange, allPages = [], isRulersView = false, isCodeViewOpen = false }) => {
  // Ensure pages is always an array
  const safePages = Array.isArray(pages) ? pages : [];
  
  const rootInstance = useBuilderStore((state) => state.rootInstance);
  const selectedInstanceId = useBuilderStore((state) => state.selectedInstanceId);
  const hoveredInstanceId = useBuilderStore((state) => state.hoveredInstanceId);
  const isolatedInstanceId = useBuilderStore((state) => state.isolatedInstanceId);
  const setSelectedInstanceId = useBuilderStore((state) => state.setSelectedInstanceId);
  const setHoveredInstanceId = useBuilderStore((state) => state.setHoveredInstanceId);
  const enterIsolationMode = useBuilderStore((state) => state.enterIsolationMode);
  const addInstance = useBuilderStore((state) => state.addInstance);
  const updateInstance = useBuilderStore((state) => state.updateInstance);
  const { findInstance } = useBuilderStore();
  const { getComputedStyles } = useStyleStore();
  
  // Global components from page store
  const { getGlobalComponents, shouldShowGlobalComponent, currentPageId } = usePageStore();
  const globalComponents = getGlobalComponents();
  const globalHeader = globalComponents.header;
  const globalFooter = globalComponents.footer;
  
  const [editingPageId, setEditingPageId] = useState<string | null>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; instance: ComponentInstance } | null>(null);
  const [headingSettings, setHeadingSettings] = useState<{ isOpen: boolean; position: { x: number; y: number } } | null>(null);
  const [richTextAddMenu, setRichTextAddMenu] = useState<{ isOpen: boolean; position: { x: number; y: number }; instanceId: string } | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [customWidth, setCustomWidth] = useState<number | null>(null);
  
  // Reset custom width when breakpoint changes so breakpoint widths take effect
  useEffect(() => {
    setCustomWidth(null);
  }, [currentBreakpoint]);
  
  const [isResizing, setIsResizing] = useState<'left' | 'right' | null>(null);
  const [resizeStart, setResizeStart] = useState({ x: 0, width: 0 });
  const [touchStart, setTouchStart] = useState<{ x: number; y: number; distance: number } | null>(null);
  const [initialZoom, setInitialZoom] = useState<number>(100);
  const [prebuiltDialog, setPrebuiltDialog] = useState<{ open: boolean; instance: ComponentInstance | null }>({ open: false, instance: null });
  const [addCommentPosition, setAddCommentPosition] = useState<{ x: number; y: number; screenX: number; screenY: number } | null>(null);
  
  // Comment store
  const { commentsVisible, isAddingComment, setIsAddingComment, getPageComments } = useCommentStore();
  const pageComments = getPageComments(currentPage);

  const { setNodeRef } = useDroppable({
    id: 'canvas-drop-zone',
  });

  const currentBreakpointWidth = isPreviewMode 
    ? '100%' 
    : (customWidth || breakpoints.find(bp => bp.id === currentBreakpoint)?.width || 960);
  
  const displayWidth = typeof currentBreakpointWidth === 'number' ? currentBreakpointWidth : 960;

  // Handle scroll - Shift for horizontal even without pan mode
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const handleWheel = (e: WheelEvent) => {
      // Shift key for horizontal scroll
      if (e.shiftKey) {
        e.preventDefault();
        const container = canvasRef.current;
        if (!container) return;
        container.scrollLeft += e.deltaY;
      } else if (isPanMode) {
        // Pan mode for vertical scroll
        e.preventDefault();
        const container = canvasRef.current;
        if (!container) return;
        container.scrollTop += e.deltaY;
      }
    };
    
    const container = canvasRef.current;
    container.addEventListener('wheel', handleWheel, { passive: false });
    
    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, [isPanMode]);

  // Reset scroll to top-left on mount
  useEffect(() => {
    const scrollTimer = setTimeout(() => {
      if (canvasRef.current && !isPreviewMode) {
        // Always start at top-left (0, 0) for immediate visibility
        canvasRef.current.scrollTo({
          top: 0,
          left: 0,
          behavior: 'instant'
        });
      }
    }, 100);
    
    return () => clearTimeout(scrollTimer);
  }, [isPreviewMode, currentPage]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isPanMode) {
      e.preventDefault();
      setIsPanning(true);
      setPanStart({ 
        x: e.clientX, 
        y: e.clientY 
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning && isPanMode && canvasRef.current) {
      const deltaX = e.clientX - panStart.x;
      const deltaY = e.clientY - panStart.y;
      
      canvasRef.current.scrollLeft -= deltaX;
      canvasRef.current.scrollTop -= deltaY;
      
      setPanStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    setIsResizing(null);
  };

  const handleResizeStart = (e: React.MouseEvent, side: 'left' | 'right') => {
    if (isPreviewMode) return;
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(side);
    const currentWidth = customWidth || (typeof currentBreakpointWidth === 'number' ? currentBreakpointWidth : 960);
    setResizeStart({ x: e.clientX, width: currentWidth });
  };

  const handleResizeMove = (e: React.MouseEvent) => {
    if (!isResizing) return;
    const delta = isResizing === 'right' ? (e.clientX - resizeStart.x) : (resizeStart.x - e.clientX);
    const newWidth = Math.max(320, Math.min(1920, resizeStart.width + delta * 2));
    setCustomWidth(newWidth);
  };

  // Touch event handlers
  const getTouchDistance = (touches: React.TouchList) => {
    if (touches.length < 2) return 0;
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      // Pinch zoom
      const distance = getTouchDistance(e.touches);
      setTouchStart({
        x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
        y: (e.touches[0].clientY + e.touches[1].clientY) / 2,
        distance,
      });
      setInitialZoom(zoom);
    } else if (e.touches.length === 1) {
      // Single touch pan - always enable for canvas
      const target = e.target as HTMLElement;
      const isCanvas = target.classList.contains('builder-canvas') || target.closest('.builder-canvas');
      if (isCanvas || isPanMode) {
        setIsPanning(true);
        setPanStart({
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
        });
      }
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && touchStart) {
      // Pinch zoom
      e.preventDefault();
      const distance = getTouchDistance(e.touches);
      const scale = distance / touchStart.distance;
      const newZoom = Math.max(10, Math.min(200, initialZoom * scale));
      if (onZoomChange) {
        onZoomChange(newZoom);
      }
    } else if (e.touches.length === 1 && isPanning && canvasRef.current) {
      // Single touch pan
      e.preventDefault();
      const deltaX = e.touches[0].clientX - panStart.x;
      const deltaY = e.touches[0].clientY - panStart.y;
      
      canvasRef.current.scrollLeft -= deltaX;
      canvasRef.current.scrollTop -= deltaY;
      
      setPanStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
    }
  };

  const handleTouchEnd = () => {
    setIsPanning(false);
    setTouchStart(null);
  };

  const handleContextMenu = (e: React.MouseEvent, instance: ComponentInstance) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY, instance });
  };

  // Get selected element for overlay - force update on selection changes
  const [selectedElement, setSelectedElement] = useState<HTMLElement | null>(null);
  const selectedInstance = selectedInstanceId ? findInstance(selectedInstanceId) : null;

  useEffect(() => {
    if (selectedInstanceId) {
      const element = document.querySelector(`[data-instance-id="${selectedInstanceId}"]`) as HTMLElement;
      setSelectedElement(element);
    } else {
      setSelectedElement(null);
    }
  }, [selectedInstanceId]);

  // Get hovered element for overlay
  const hoveredElement = hoveredInstanceId && hoveredInstanceId !== selectedInstanceId
    ? document.querySelector(`[data-instance-id="${hoveredInstanceId}"]`) as HTMLElement
    : null;

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (richTextAddMenu?.isOpen && !target.closest('.rich-text-add-menu')) {
        setRichTextAddMenu(null);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [richTextAddMenu]);

  const renderInstance = (instance: ComponentInstance, parentInstance?: ComponentInstance, childIndex?: number, isInsideNavigation: boolean = false): React.ReactNode => {
    const isSelected = instance.id === selectedInstanceId;
    const isHovered = instance.id === hoveredInstanceId;
    const isContainer = ['Div', 'Container', 'Section', 'Navigation'].includes(instance.type);

    // Check if this is the icon child of a Feature Card (first child of a Feature Card parent)
    const isFeatureCardIcon = parentInstance?.props?.icon !== undefined && childIndex === 0 && instance.type === 'Div';
    const featureCardIcon = isFeatureCardIcon ? (parentInstance?.props?.icon || 'Star') : undefined;

    // Build data binding props
    const dataBindingProps: Record<string, any> = {};
    
    // Apply idAttribute as HTML id
    if (instance.idAttribute) {
      dataBindingProps.id = instance.idAttribute;
    }
    
    // Apply visibility
    if (instance.visibility === 'hidden') {
      dataBindingProps.style = { ...dataBindingProps.style, display: 'none' };
    }
    
    // Apply custom attributes (spread them, but block reserved ones)
    if (instance.attributes) {
      Object.entries(instance.attributes).forEach(([key, value]) => {
        // Block reserved HTML attributes that might conflict
        if (!['id', 'class', 'className', 'style'].includes(key.toLowerCase())) {
          dataBindingProps[key] = value;
        }
      });
    }

    const commonProps = {
      instance,
      isSelected,
      isHovered,
      onSelect: isPreviewMode || isAddingComment ? undefined : () => setSelectedInstanceId(instance.id),
      onHover: isPreviewMode || isAddingComment ? undefined : () => setHoveredInstanceId(instance.id),
      onHoverEnd: isPreviewMode || isAddingComment ? undefined : () => setHoveredInstanceId(null),
      onContextMenu: isPreviewMode || isAddingComment ? undefined : (e: React.MouseEvent) => handleContextMenu(e, instance),
      isPreviewMode,
      dataBindingProps, // Pass data binding props to primitives
    } as any;

    const wrapWithDraggable = (content: React.ReactNode) => (
      isPreviewMode ? (
        <>{content}</>
      ) : (
        <DraggableInstance instance={instance} isContainer={isContainer}>
          {content}
        </DraggableInstance>
      )
    );

    switch (instance.type) {
      case 'Div':
      case 'Box': { // Backward compatibility for Box -> Div rename
        // Check if this Box is a Navigation container (composite navigation)
        const isNavBox = instance.label === 'Navigation';
        
        const content = (
          <Div 
            {...commonProps} 
            featureCardIcon={featureCardIcon}
            dataBindingProps={{
              ...commonProps.dataBindingProps,
              'data-nav-context': isNavBox ? 'true' : undefined,
              'data-component-label': instance.label || undefined,
            }}
          >
            {instance.children.map((child, idx) => renderInstance(child, instance, idx, isInsideNavigation || isNavBox))}
          </Div>
        );
        // Check if this is the root instance (id === 'root') - don't show empty placeholder for root
        const isRoot = instance.id === 'root';
        return isPreviewMode ? content : (
          <DroppableContainer key={instance.id} instance={instance} {...commonProps} isRootInstance={isRoot}>
            {content}
          </DroppableContainer>
        );
      }
      case 'Container': {
        // Check if parent is a Navigation Section (htmlTag='nav')
        const isInsideNavigation = parentInstance?.type === 'Section' && parentInstance?.props?.htmlTag === 'nav';
        
        const content = (
          <Container {...commonProps}>
            {instance.children.map((child, idx) => renderInstance(child, instance, idx, isInsideNavigation))}
          </Container>
        );
        return isPreviewMode ? content : (
          <DroppableContainer key={instance.id} instance={instance} {...commonProps} isInsideNavigation={isInsideNavigation}>
            {content}
          </DroppableContainer>
        );
      }
      case 'Section': {
        // Check if this is a navigation section (htmlTag='nav')
        const isNavSection = instance.props?.htmlTag === 'nav';
        
        // Generate dynamic styles for navigation links
        let navStyles = '';
        let navClassName = '';
        if (isNavSection) {
          navStyles = generateNavLinkStyles(
            instance.id,
            instance.props?.hoverPreset || 'underline-slide',
            instance.props?.activePreset || 'underline',
            instance.props?.hoverColor || '',
            instance.props?.hoverBgColor || '',
            instance.props?.activeColor || '',
            instance.props?.activeBgColor || '',
            instance.props?.animationDuration || 200
          );
          navClassName = `nav-${instance.id}`;
        }
        
        const sectionContent = (
          <>
            {isNavSection && navStyles && <style>{navStyles}</style>}
            <Section 
              {...commonProps}
              dataBindingProps={{
                ...commonProps.dataBindingProps,
                className: navClassName || undefined,
                'data-nav-context': isNavSection ? 'true' : undefined,
              }}
            >
              {instance.children.map((child, idx) => renderInstance(child, instance, idx, isNavSection))}
            </Section>
          </>
        );

        // Wrap navigation sections with ResponsiveNavWrapper for mobile support
        const content = isNavSection ? (
          <ResponsiveNavWrapper
            instance={instance}
            isPreviewMode={isPreviewMode}
            currentBreakpoint={currentBreakpoint}
            canvasWidth={displayWidth}
          >
            {sectionContent}
          </ResponsiveNavWrapper>
        ) : sectionContent;

        return isPreviewMode ? content : (
          <DroppableContainer key={instance.id} instance={instance} {...commonProps}>
            {content}
          </DroppableContainer>
        );
      }
      case 'Text':
        return wrapWithDraggable(<Text key={instance.id} {...commonProps} />);
      case 'Heading':
        return wrapWithDraggable(<Heading key={instance.id} {...commonProps} />);
      case 'RichText': {
        const content = (
          <RichText 
            {...commonProps}
            showAddMenu={richTextAddMenu?.isOpen && richTextAddMenu.instanceId === instance.id}
            addMenuPosition={richTextAddMenu?.position}
            onCloseAddMenu={() => setRichTextAddMenu(null)}
          >
            {instance.children.map((child, idx) => renderInstance(child, instance, idx))}
          </RichText>
        );
        return isPreviewMode ? content : (
          <DroppableContainer key={instance.id} instance={instance} {...commonProps}>
            {content}
          </DroppableContainer>
        );
      }
      case 'Blockquote':
        return wrapWithDraggable(<Blockquote key={instance.id} {...commonProps} />);
      case 'OrderedList':
        return wrapWithDraggable(<OrderedList key={instance.id} {...commonProps} />);
      case 'UnorderedList':
        return wrapWithDraggable(<UnorderedList key={instance.id} {...commonProps} />);
      case 'CodeBlock':
        return wrapWithDraggable(<CodeBlock key={instance.id} {...commonProps} />);
      case 'Button':
        return wrapWithDraggable(<ButtonPrimitive key={instance.id} {...commonProps} />);
      case 'Image':
        return wrapWithDraggable(<ImagePrimitive key={instance.id} {...commonProps} />);
      case 'Video':
        return wrapWithDraggable(
          <VideoPrimitive
            key={instance.id}
            instanceId={instance.id}
            src={instance.props.src}
            autoplay={instance.props.autoplay}
            loop={instance.props.loop}
            muted={instance.props.muted}
            controls={instance.props.controls}
            isSelected={isSelected}
            className=""
            style={getComputedStyles(instance.styleSourceIds || []) as React.CSSProperties}
          />
        );
      case 'Youtube':
        return wrapWithDraggable(
          <YoutubePrimitive
            key={instance.id}
            instanceId={instance.id}
            videoId={instance.props.videoId}
            autoplay={instance.props.autoplay}
            loop={instance.props.loop}
            muted={instance.props.muted}
            controls={instance.props.controls}
            isSelected={isSelected}
            className=""
            style={getComputedStyles(instance.styleSourceIds || []) as React.CSSProperties}
          />
        );
      case 'Lottie':
        return wrapWithDraggable(
          <LottiePrimitive
            key={instance.id}
            instanceId={instance.id}
            src={instance.props.src}
            autoplay={instance.props.autoplay}
            loop={instance.props.loop}
            isSelected={isSelected}
            className=""
            style={getComputedStyles(instance.styleSourceIds || []) as React.CSSProperties}
          />
        );
      case 'Icon':
        return wrapWithDraggable(
          <IconPrimitive
            key={instance.id}
            name={instance.props?.name || 'Circle'}
            size={instance.props?.size || 24}
            color={instance.props?.color}
            strokeWidth={instance.props?.strokeWidth}
            style={getComputedStyles(instance.styleSourceIds || []) as React.CSSProperties}
          />
        );
      case 'Link': {
        // Add nav-link class if inside a navigation section for hover/active styles
        if (isInsideNavigation) {
          const navLinkProps = {
            ...commonProps,
            dataBindingProps: {
              ...commonProps.dataBindingProps,
              className: 'nav-link relative'
            }
          };
          return wrapWithDraggable(<LinkPrimitive key={instance.id} {...navLinkProps} />);
        }
        return wrapWithDraggable(<LinkPrimitive key={instance.id} {...commonProps} />);
      }
      case 'Table': {
        // Children-based Table rendering
        const tableStyles = instance.props?.tableStyles || {};
        const headerRows = instance.children.filter(c => c.type === 'TableRow' && c.props?.isHeader);
        const bodyRows = instance.children.filter(c => c.type === 'TableRow' && !c.props?.isHeader);
        
        const getShadowClass = (shadow: string) => {
          switch(shadow) {
            case 'sm': return '0 1px 2px rgba(0,0,0,0.05)';
            case 'md': return '0 4px 6px -1px rgba(0,0,0,0.1)';
            case 'lg': return '0 10px 15px -3px rgba(0,0,0,0.1)';
            default: return 'none';
          }
        };

        const tableContent = (
          <div
            data-instance-id={instance.id}
            className={(instance.styleSourceIds || []).map((id) => useStyleStore.getState().styleSources[id]?.name).filter(Boolean).join(' ')}
            style={{
              ...getComputedStyles(instance.styleSourceIds || []) as React.CSSProperties,
              backgroundColor: tableStyles.tableBackground || 'transparent',
              borderRadius: `${tableStyles.outerBorderRadius || 8}px`,
              boxShadow: getShadowClass(tableStyles.tableShadow),
              overflow: 'hidden',
            }}
            onClick={isPreviewMode ? undefined : (e) => { e.stopPropagation(); setSelectedInstanceId(instance.id); }}
            onMouseEnter={isPreviewMode ? undefined : () => setHoveredInstanceId(instance.id)}
            onMouseLeave={isPreviewMode ? undefined : () => setHoveredInstanceId(null)}
            onContextMenu={isPreviewMode ? undefined : (e) => handleContextMenu(e, instance)}
          >
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              {headerRows.length > 0 && (
                <thead>
                  {headerRows.map((row, idx) => renderInstance(row, instance, idx))}
                </thead>
              )}
              <tbody>
                {bodyRows.length > 0 
                  ? bodyRows.map((row, idx) => renderInstance(row, instance, idx))
                  : !isPreviewMode ? (
                    <tr>
                      <td colSpan={100}>
                        <div className="flex items-center justify-center h-16 border-2 border-dashed border-blue-300 rounded-lg bg-blue-50/50 dark:bg-blue-950/20">
                          <span className="text-sm text-blue-500 font-medium">Drop rows here</span>
                        </div>
                      </td>
                    </tr>
                  ) : null}
              </tbody>
            </table>
          </div>
        );
        
        return isPreviewMode ? tableContent : (
          <DroppableContainer key={instance.id} instance={instance} {...commonProps}>
            {tableContent}
          </DroppableContainer>
        );
      }
      case 'Form': {
        // If Form has children (new composite structure), render as Div container
        if (instance.children && instance.children.length > 0) {
          const content = (
            <Div {...commonProps}>
              {instance.children.map((child, idx) => renderInstance(child, instance, idx))}
            </Div>
          );
          return isPreviewMode ? content : (
            <DroppableContainer key={instance.id} instance={instance} {...commonProps}>
              {content}
            </DroppableContainer>
          );
        }
        // Otherwise fallback to legacy FormPrimitive
        return wrapWithDraggable(
          <FormPrimitive
            key={instance.id}
            instanceId={instance.id}
            fields={instance.props.fields}
            buttonText={instance.props.buttonText}
            className=""
            style={getComputedStyles(instance.styleSourceIds || []) as React.CSSProperties}
          />
        );
      }
      case 'FormButton':
        return wrapWithDraggable(
          <FormButtonPrimitive
            key={instance.id}
            instanceId={instance.id}
            text={instance.props.text}
            type={instance.props.type}
            disabled={instance.props.disabled}
            className={(instance.styleSourceIds || []).map((id) => useStyleStore.getState().styleSources[id]?.name).filter(Boolean).join(' ')}
            style={getComputedStyles(instance.styleSourceIds || []) as React.CSSProperties}
          />
        );
      case 'InputLabel':
        return wrapWithDraggable(
          <InputLabelPrimitive
            key={instance.id}
            instanceId={instance.id}
            text={instance.props.text}
            htmlFor={instance.props.htmlFor}
            required={instance.props.required}
            className={(instance.styleSourceIds || []).map((id) => useStyleStore.getState().styleSources[id]?.name).filter(Boolean).join(' ')}
            style={getComputedStyles(instance.styleSourceIds || []) as React.CSSProperties}
          />
        );
      case 'TextInput':
        return wrapWithDraggable(
          <TextInputPrimitive
            key={instance.id}
            instanceId={instance.id}
            placeholder={instance.props.placeholder}
            type={instance.props.type}
            required={instance.props.required}
            disabled={instance.props.disabled}
            className={(instance.styleSourceIds || []).map((id) => useStyleStore.getState().styleSources[id]?.name).filter(Boolean).join(' ')}
            style={getComputedStyles(instance.styleSourceIds || []) as React.CSSProperties}
          />
        );
      case 'TextArea':
        return wrapWithDraggable(
          <TextAreaPrimitive
            key={instance.id}
            instanceId={instance.id}
            placeholder={instance.props.placeholder}
            rows={instance.props.rows}
            required={instance.props.required}
            disabled={instance.props.disabled}
            className={(instance.styleSourceIds || []).map((id) => useStyleStore.getState().styleSources[id]?.name).filter(Boolean).join(' ')}
            style={getComputedStyles(instance.styleSourceIds || []) as React.CSSProperties}
          />
        );
      case 'Select':
        return wrapWithDraggable(
          <SelectPrimitive
            key={instance.id}
            instanceId={instance.id}
            options={instance.props.options}
            placeholder={instance.props.placeholder}
            required={instance.props.required}
            disabled={instance.props.disabled}
            className={(instance.styleSourceIds || []).map((id) => useStyleStore.getState().styleSources[id]?.name).filter(Boolean).join(' ')}
            style={getComputedStyles(instance.styleSourceIds || []) as React.CSSProperties}
          />
        );
      case 'RadioGroup':
        return wrapWithDraggable(
          <RadioPrimitive
            key={instance.id}
            instanceId={instance.id}
            name={instance.props.name}
            options={instance.props.options}
            required={instance.props.required}
            disabled={instance.props.disabled}
            orientation={instance.props.orientation}
            className={(instance.styleSourceIds || []).map((id) => useStyleStore.getState().styleSources[id]?.name).filter(Boolean).join(' ')}
            style={getComputedStyles(instance.styleSourceIds || []) as React.CSSProperties}
          />
        );
      case 'CheckboxField':
        return wrapWithDraggable(
          <CheckboxPrimitive
            key={instance.id}
            instanceId={instance.id}
            label={instance.props.label}
            required={instance.props.required}
            disabled={instance.props.disabled}
            className={(instance.styleSourceIds || []).map((id) => useStyleStore.getState().styleSources[id]?.name).filter(Boolean).join(' ')}
            style={getComputedStyles(instance.styleSourceIds || []) as React.CSSProperties}
          />
        );
      case 'Cell':
        return wrapWithDraggable(<CellPrimitive key={instance.id} {...commonProps} />);
      case 'Dropdown': {
        // DropdownPrimitive now handles isOpen state from dropdownConfig internally
        const content = (
          <DropdownPrimitive {...commonProps}>
            {instance.children.map((child, idx) => renderInstance(child, instance, idx))}
          </DropdownPrimitive>
        );
        return isPreviewMode ? content : (
          <DroppableContainer key={instance.id} instance={instance} {...commonProps}>
            {content}
          </DroppableContainer>
        );
      }
      case 'Navigation': {
        // If Navigation has children (new composite structure), render as Div container
        if (instance.children && instance.children.length > 0) {
          const content = (
            <Div 
              {...commonProps}
              dataBindingProps={{
                ...commonProps.dataBindingProps,
                'data-nav-context': 'true',
                'data-component-label': 'Navigation',
              }}
            >
              {instance.children.map((child, idx) => renderInstance(child, instance, idx, true))}
            </Div>
          );
          return isPreviewMode ? content : (
            <DroppableContainer key={instance.id} instance={instance} {...commonProps}>
              {content}
            </DroppableContainer>
          );
        }
        // Otherwise fallback to legacy NavigationPrimitive
        const content = (
          <NavigationPrimitive
            key={instance.id}
            instanceId={instance.id}
            logo={instance.props?.logo}
            logoImage={instance.props?.logoImage}
            menuItems={instance.props?.menuItems}
            template={instance.props?.template}
            showCTA={instance.props?.showCTA}
            ctaText={instance.props?.ctaText}
            ctaUrl={instance.props?.ctaUrl}
            mobileBreakpoint={instance.props?.mobileBreakpoint}
            mobileAnimation={instance.props?.mobileAnimation}
            animationDuration={instance.props?.animationDuration}
            hamburgerStyle={instance.props?.hamburgerStyle}
            animateIcon={instance.props?.animateIcon}
            hoverPreset={instance.props?.hoverPreset}
            activePreset={instance.props?.activePreset}
            hoverColor={instance.props?.hoverColor}
            hoverBgColor={instance.props?.hoverBgColor}
            activeColor={instance.props?.activeColor}
            activeBgColor={instance.props?.activeBgColor}
            isSelected={isSelected}
            isPreviewMode={isPreviewMode}
            currentBreakpoint={currentBreakpoint}
            className=""
            style={getComputedStyles(instance.styleSourceIds || []) as React.CSSProperties}
          >
            {instance.children.map((child, idx) => renderInstance(child, instance, idx, true))}
          </NavigationPrimitive>
        );
        return isPreviewMode ? content : (
          <DroppableContainer key={instance.id} instance={instance} {...commonProps}>
            {content}
          </DroppableContainer>
        );
      }

      case 'Accordion': {
        // Children-based structure only (AccordionItem children)
        const childItems = instance.children.filter(c => c.type === 'AccordionItem');
        const hasChildItems = childItems.length > 0;
        
        const accordionStyles = instance.props?.accordionStyles || {};
        const collapseMode = accordionStyles.collapseMode || 'single';
        const orientation = accordionStyles.orientation || 'vertical';
        const iconPosition = accordionStyles.iconPosition || 'right';
        const iconStyle = accordionStyles.iconStyle || 'chevron';
        const triggerBackground = accordionStyles.triggerBackground || 'transparent';
        const triggerHoverBackground = accordionStyles.triggerHoverBackground || 'hsl(var(--muted))';
        const triggerActiveBackground = accordionStyles.triggerActiveBackground || 'hsl(var(--muted))';
        const triggerTextColor = accordionStyles.triggerTextColor || 'hsl(var(--foreground))';
        const contentBackground = accordionStyles.contentBackground || 'transparent';
        const contentPadding = accordionStyles.contentPadding || '16';
        const animationDuration = accordionStyles.animationDuration || '200';
        const dividerStyle = accordionStyles.dividerStyle || 'solid';
        const dividerColor = accordionStyles.dividerColor || 'hsl(var(--border))';
        const outerBorderRadius = accordionStyles.outerBorderRadius || '8';
        const isHorizontal = orientation === 'horizontal';

        // Generate CSS for accordion styling
        const accordionCss = `
          .accordion-${instance.id} {
            border-radius: ${outerBorderRadius}px;
            overflow: hidden;
          }
          .accordion-${instance.id} .accordion-items-container {
            display: flex;
            flex-direction: ${isHorizontal ? 'row' : 'column'};
          }
          .accordion-${instance.id} .accordion-item {
            ${isHorizontal ? 'flex: 1;' : ''}
            border-${isHorizontal ? 'right' : 'bottom'}: ${dividerStyle === 'none' ? 'none' : `1px ${dividerStyle} ${dividerColor}`};
          }
          .accordion-${instance.id} .accordion-item:last-child {
            border-${isHorizontal ? 'right' : 'bottom'}: none;
          }
          .accordion-${instance.id} .accordion-trigger {
            background: ${triggerBackground};
            color: ${triggerTextColor};
            transition: background ${animationDuration}ms ease;
            flex-direction: ${iconPosition === 'left' ? 'row-reverse' : 'row'};
          }
          .accordion-${instance.id} .accordion-trigger:hover {
            background: ${triggerHoverBackground};
          }
          .accordion-${instance.id} .accordion-trigger.active {
            background: ${triggerActiveBackground};
          }
          .accordion-${instance.id} .accordion-content {
            background: ${contentBackground};
            padding: ${contentPadding}px;
          }
        `;

        // In preview mode, render a fully interactive accordion using the shadcn/Radix component
        if (isPreviewMode) {
          const allItems = childItems.map((child, index) => ({
            id: child.id,
            title: child.props?.title || `Item ${index + 1}`,
            content: child,
            defaultOpen: child.props?.defaultOpen || false,
          }));
            
          const defaultOpenValues = allItems
            .filter((item: any) => item.defaultOpen)
            .map((item: any) => String(item.id));

          const content = (
            <div
              data-instance-id={instance.id}
              className={`accordion-${instance.id} ${(instance.styleSourceIds || [])
                .map((id) => useStyleStore.getState().styleSources[id]?.name)
                .filter(Boolean)
                .join(' ')}`}
              style={getComputedStyles(instance.styleSourceIds || []) as React.CSSProperties}
            >
              <style>{accordionCss}</style>
              {collapseMode === 'multiple' ? (
                <ShadcnAccordion
                  type="multiple"
                  defaultValue={defaultOpenValues}
                  className={`w-full accordion-items-container`}
                >
                  {allItems.map((item: any) => {
                    const value = String(item.id);
                    return (
                      <AccordionItem key={value} value={value} className="accordion-item">
                        <AccordionTrigger className={`accordion-trigger ${iconPosition === 'left' ? 'flex-row-reverse justify-end gap-2' : ''}`}>
                          {item.title}
                        </AccordionTrigger>
                        <AccordionContent className="accordion-content">
                          {item.content?.children?.length > 0
                            ? item.content.children.map((child: ComponentInstance, idx: number) => renderInstance(child, item.content, idx))
                            : <span className="text-muted-foreground italic">No content</span>}
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
                </ShadcnAccordion>
              ) : (
                <ShadcnAccordion
                  type="single"
                  defaultValue={defaultOpenValues[0]}
                  collapsible
                  className={`w-full accordion-items-container`}
                >
                  {allItems.map((item: any) => {
                    const value = String(item.id);
                    return (
                      <AccordionItem key={value} value={value} className="accordion-item">
                        <AccordionTrigger className={`accordion-trigger ${iconPosition === 'left' ? 'flex-row-reverse justify-end gap-2' : ''}`}>
                          {item.title}
                        </AccordionTrigger>
                        <AccordionContent className="accordion-content">
                          {item.content?.children?.length > 0
                            ? item.content.children.map((child: ComponentInstance, idx: number) => renderInstance(child, item.content, idx))
                            : <span className="text-muted-foreground italic">No content</span>}
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
                </ShadcnAccordion>
              )}
              {!hasChildItems && (
                <div className="py-4 text-sm text-muted-foreground italic text-center">
                  No accordion sections
                </div>
              )}
            </div>
          );

          return wrapWithDraggable(content);
        }

        // In edit mode, render with droppable support for children
        const content = (
          <div
            data-instance-id={instance.id}
            className={`accordion-${instance.id} ${(instance.styleSourceIds || [])
              .map((id) => useStyleStore.getState().styleSources[id]?.name)
              .filter(Boolean)
              .join(' ')}`}
            style={{
              ...getComputedStyles(instance.styleSourceIds || []) as React.CSSProperties,
              borderRadius: `${outerBorderRadius}px`,
              overflow: 'hidden',
            }}
            onClick={() => setSelectedInstanceId(instance.id)}
            onMouseEnter={() => setHoveredInstanceId(instance.id)}
            onMouseLeave={() => setHoveredInstanceId(null)}
            onContextMenu={(e) => handleContextMenu(e, instance)}
          >
            <style>{accordionCss}</style>
            <div className="accordion-items-container">
              {/* Render child AccordionItems */}
              {hasChildItems && childItems.map((child, idx) => renderInstance(child, instance, idx))}
            </div>
            
            {/* Empty state */}
            {!hasChildItems && (
              <div className="py-8 text-center">
                <p className="text-sm text-muted-foreground">No accordion sections</p>
                <p className="text-xs text-muted-foreground mt-1">Drag AccordionItem here or use Add Section button</p>
              </div>
            )}
          </div>
        );

        return isPreviewMode ? content : (
          <DroppableContainer key={instance.id} instance={instance} {...commonProps}>
            {content}
          </DroppableContainer>
        );
      }

      case 'Carousel': {
        // Check for CarouselSlide children first
        const childSlides = instance.children.filter(c => c.type === 'CarouselSlide');
        const hasChildSlides = childSlides.length > 0;
        
        const slides = instance.props?.slides || [];
        const styles = instance.props?.carouselStyles || {};
        const showArrows = instance.props?.showArrows ?? true;
        const showDots = instance.props?.showDots ?? true;
        const autoPlay = instance.props?.autoPlay ?? false;
        const autoPlayInterval = instance.props?.autoPlayInterval ?? 3000;
        const pauseOnHover = instance.props?.pauseOnHover ?? true;
        const loop = instance.props?.loop ?? true;
        
        // In edit mode with child slides, show them directly for editing
        if (!isPreviewMode && hasChildSlides) {
          const otherChildren = instance.children.filter(c => c.type !== 'CarouselSlide');
          const content = (
            <div
              data-instance-id={instance.id}
              className={(instance.styleSourceIds || []).map((id) => useStyleStore.getState().styleSources[id]?.name).filter(Boolean).join(' ')}
              style={{
                ...getComputedStyles(instance.styleSourceIds || []) as React.CSSProperties,
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                minHeight: '100px',
              }}
              onClick={() => setSelectedInstanceId(instance.id)}
              onMouseEnter={() => setHoveredInstanceId(instance.id)}
              onMouseLeave={() => setHoveredInstanceId(null)}
              onContextMenu={(e) => handleContextMenu(e, instance)}
            >
              {childSlides.map((child, idx) => renderInstance(child, instance, idx))}
              {/* Render generic children that were dropped directly */}
              {otherChildren.length > 0 && (
                <div className="p-4 border-t border-dashed border-border">
                  {otherChildren.map((child, idx) => renderInstance(child, instance, idx))}
                </div>
              )}
              {childSlides.length === 0 && otherChildren.length === 0 && (
                <div className="py-4 text-sm text-muted-foreground italic text-center">
                  Drop CarouselSlide components here
                </div>
              )}
            </div>
          );
          return (
            <DroppableContainer key={instance.id} instance={instance} {...commonProps}>
              {content}
            </DroppableContainer>
          );
        }
        
        // Also check for generic children when no child slides
        const otherChildren = instance.children.filter(c => c.type !== 'CarouselSlide');
        
        const content = (
          <div
            data-instance-id={instance.id}
            className={(instance.styleSourceIds || []).map((id) => useStyleStore.getState().styleSources[id]?.name).filter(Boolean).join(' ')}
            style={getComputedStyles(instance.styleSourceIds || []) as React.CSSProperties}
            onClick={isPreviewMode ? undefined : () => setSelectedInstanceId(instance.id)}
            onMouseEnter={isPreviewMode ? undefined : () => setHoveredInstanceId(instance.id)}
            onMouseLeave={isPreviewMode ? undefined : () => setHoveredInstanceId(null)}
            onContextMenu={isPreviewMode ? undefined : (e) => handleContextMenu(e, instance)}
          >
            <CarouselPreview
              slides={hasChildSlides ? childSlides.map((child, i) => ({
                id: child.id,
                imageUrl: child.props?.imageUrl || 'https://via.placeholder.com/800x400',
                alt: child.props?.alt || `Slide ${i + 1}`,
                title: child.props?.title || '',
                description: child.props?.description || '',
                hasChildren: child.children.length > 0,
                childContent: child.children,
              })) : slides}
              styles={styles}
              autoPlay={autoPlay}
              autoPlayInterval={autoPlayInterval}
              pauseOnHover={pauseOnHover}
              showArrows={showArrows}
              showDots={showDots}
              loop={loop}
              isPreviewMode={isPreviewMode}
              renderInstance={renderInstance}
              parentInstance={instance}
            />
            {/* Render generic children that were dropped directly */}
            {otherChildren.length > 0 && !isPreviewMode && (
              <div className="p-4 border-t border-dashed border-border">
                {otherChildren.map((child, idx) => renderInstance(child, instance, idx))}
              </div>
            )}
          </div>
        );
        // Wrap in DroppableContainer in edit mode so CarouselSlide children can be dropped
        return isPreviewMode ? wrapWithDraggable(content) : (
          <DroppableContainer key={instance.id} instance={instance} {...commonProps}>
            {content}
          </DroppableContainer>
        );
      }

      case 'Tabs': {
        const tabs = instance.props?.tabs || [];
        const defaultTab = instance.props?.defaultTab || tabs[0]?.id;
        const content = (
          <TabsComponent
            key={instance.id}
            instance={instance}
            tabs={tabs}
            defaultTab={defaultTab}
            isPreviewMode={isPreviewMode}
            getComputedStyles={getComputedStyles}
            setSelectedInstanceId={setSelectedInstanceId}
            setHoveredInstanceId={setHoveredInstanceId}
            handleContextMenu={handleContextMenu}
            renderInstance={renderInstance}
          />
        );
        // Wrap in DroppableContainer in edit mode so TabPanel children can be dropped
        return isPreviewMode ? wrapWithDraggable(content) : (
          <DroppableContainer key={instance.id} instance={instance} {...commonProps}>
            {content}
          </DroppableContainer>
        );
      }

      case 'AlertDialog': {
        const content = (
          <div
            data-instance-id={instance.id}
            className={(instance.styleSourceIds || []).map((id) => useStyleStore.getState().styleSources[id]?.name).filter(Boolean).join(' ')}
            style={getComputedStyles(instance.styleSourceIds || []) as React.CSSProperties}
            onClick={isPreviewMode ? undefined : () => setSelectedInstanceId(instance.id)}
            onMouseEnter={isPreviewMode ? undefined : () => setHoveredInstanceId(instance.id)}
            onMouseLeave={isPreviewMode ? undefined : () => setHoveredInstanceId(null)}
            onContextMenu={isPreviewMode ? undefined : (e) => handleContextMenu(e, instance)}
          >
            <button className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md text-sm">
              {instance.props?.triggerText || 'Open Dialog'}
            </button>
            <div className="mt-4 p-6 bg-background border border-border rounded-lg max-w-md">
              <h3 className="text-lg font-semibold mb-2">{instance.props?.title || 'Dialog Title'}</h3>
              <p className="text-sm text-muted-foreground mb-4">{instance.props?.description || 'Dialog description'}</p>
              <div className="flex justify-end gap-2">
                <button className="px-4 py-2 border border-border rounded-md text-sm">{instance.props?.cancelText || 'Cancel'}</button>
                <button className="px-4 py-2 bg-destructive text-destructive-foreground rounded-md text-sm">{instance.props?.actionText || 'Continue'}</button>
              </div>
            </div>
          </div>
        );
        return wrapWithDraggable(content);
      }

      case 'Avatar': {
        const size = instance.props?.size || 'md';
        const sizeMap: Record<string, string> = { sm: '32px', md: '40px', lg: '48px', xl: '64px' };
        const content = (
          <div
            data-instance-id={instance.id}
            className={(instance.styleSourceIds || []).map((id) => useStyleStore.getState().styleSources[id]?.name).filter(Boolean).join(' ')}
            style={{
              ...getComputedStyles(instance.styleSourceIds || []) as React.CSSProperties,
              width: sizeMap[size],
              height: sizeMap[size],
              borderRadius: '50%',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'hsl(var(--muted))',
            }}
            onClick={isPreviewMode ? undefined : () => setSelectedInstanceId(instance.id)}
            onMouseEnter={isPreviewMode ? undefined : () => setHoveredInstanceId(instance.id)}
            onMouseLeave={isPreviewMode ? undefined : () => setHoveredInstanceId(null)}
            onContextMenu={isPreviewMode ? undefined : (e) => handleContextMenu(e, instance)}
          >
            {instance.props?.src ? (
              <img src={instance.props.src} alt={instance.props?.alt || 'Avatar'} className="w-full h-full object-cover" />
            ) : (
              <span className="text-sm font-medium text-muted-foreground">{instance.props?.fallback || 'CN'}</span>
            )}
          </div>
        );
        return wrapWithDraggable(content);
      }

      case 'Badge': {
        const badgeStyles = instance.props?.badgeStyles || {};
        const badgeData = instance.props || {};
        
        // Map size to font size
        const sizeMap: Record<string, string> = { small: '10px', medium: '12px', large: '14px' };
        const fontSize = sizeMap[badgeStyles.size] || '12px';
        
        // Map border radius
        const radiusMap: Record<string, string> = { pill: '9999px', rounded: '6px', square: '2px' };
        const borderRadius = radiusMap[badgeStyles.borderRadius] || '9999px';
        
        // Get icon component
        const iconMap: Record<string, any> = {
          Tag: () => <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"/><circle cx="7.5" cy="7.5" r=".5" fill="currentColor"/></svg>,
          Star: () => <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
          Heart: () => <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>,
          Check: () => <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>,
          X: () => <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>,
          Info: () => <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>,
          AlertTriangle: () => <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>,
          Zap: () => <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/></svg>,
        };
        const IconComponent = badgeData.icon && iconMap[badgeData.icon] ? iconMap[badgeData.icon] : null;
        
        const badgeContent = (
          <span
            data-instance-id={instance.id}
            className={(instance.styleSourceIds || []).map((id) => useStyleStore.getState().styleSources[id]?.name).filter(Boolean).join(' ')}
            style={{
              ...getComputedStyles(instance.styleSourceIds || []) as React.CSSProperties,
              display: 'inline-flex',
              alignItems: 'center',
              gap: IconComponent ? '4px' : '0',
              padding: `${badgeStyles.paddingY || '2'}px ${badgeStyles.paddingX || '10'}px`,
              borderRadius,
              backgroundColor: badgeStyles.backgroundColor || 'hsl(var(--primary))',
              color: badgeStyles.textColor || 'hsl(var(--primary-foreground))',
              fontSize,
              fontWeight: badgeStyles.fontWeight || '500',
              letterSpacing: badgeStyles.letterSpacing ? `${badgeStyles.letterSpacing}px` : '0',
              borderStyle: badgeStyles.borderStyle || 'solid',
              borderWidth: badgeStyles.borderWidth ? `${badgeStyles.borderWidth}px` : '0',
              borderColor: badgeStyles.borderColor || 'transparent',
            }}
            onClick={isPreviewMode ? undefined : () => setSelectedInstanceId(instance.id)}
            onMouseEnter={isPreviewMode ? undefined : () => setHoveredInstanceId(instance.id)}
            onMouseLeave={isPreviewMode ? undefined : () => setHoveredInstanceId(null)}
            onContextMenu={isPreviewMode ? undefined : (e: any) => handleContextMenu(e, instance)}
          >
            {IconComponent && badgeData.iconPosition !== 'right' && <IconComponent />}
            {badgeData.text || 'Badge'}
            {IconComponent && badgeData.iconPosition === 'right' && <IconComponent />}
          </span>
        );
        return wrapWithDraggable(badgeContent);
      }

      case 'Progress': {
        const value = instance.props?.value || 60;
        const max = instance.props?.max || 100;
        const percentage = (value / max) * 100;
        const content = (
          <div
            data-instance-id={instance.id}
            className={(instance.styleSourceIds || []).map((id) => useStyleStore.getState().styleSources[id]?.name).filter(Boolean).join(' ')}
            style={getComputedStyles(instance.styleSourceIds || []) as React.CSSProperties}
            onClick={isPreviewMode ? undefined : () => setSelectedInstanceId(instance.id)}
            onMouseEnter={isPreviewMode ? undefined : () => setHoveredInstanceId(instance.id)}
            onMouseLeave={isPreviewMode ? undefined : () => setHoveredInstanceId(null)}
            onContextMenu={isPreviewMode ? undefined : (e) => handleContextMenu(e, instance)}
          >
            <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary rounded-full transition-all" 
                style={{ width: `${percentage}%` }}
              />
            </div>
            {instance.props?.showLabel && (
              <span className="text-xs text-muted-foreground mt-1">{value}%</span>
            )}
          </div>
        );
        return wrapWithDraggable(content);
      }

      case 'Slider': {
        const value = instance.props?.defaultValue || 50;
        const max = instance.props?.max || 100;
        const percentage = (value / max) * 100;
        const content = (
          <div
            data-instance-id={instance.id}
            className={(instance.styleSourceIds || []).map((id) => useStyleStore.getState().styleSources[id]?.name).filter(Boolean).join(' ')}
            style={{
              ...getComputedStyles(instance.styleSourceIds || []) as React.CSSProperties,
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              width: '200px',
              height: '20px',
            }}
            onClick={isPreviewMode ? undefined : () => setSelectedInstanceId(instance.id)}
            onMouseEnter={isPreviewMode ? undefined : () => setHoveredInstanceId(instance.id)}
            onMouseLeave={isPreviewMode ? undefined : () => setHoveredInstanceId(null)}
            onContextMenu={isPreviewMode ? undefined : (e) => handleContextMenu(e, instance)}
          >
            <div className="relative w-full h-1 bg-secondary rounded-full">
              <div className="absolute left-0 top-0 h-full bg-primary rounded-full" style={{ width: `${percentage}%` }} />
            </div>
            <div 
              className="absolute w-4 h-4 bg-background border-2 border-primary rounded-full cursor-pointer" 
              style={{ left: `${percentage}%`, transform: 'translateX(-50%)' }}
            />
          </div>
        );
        return wrapWithDraggable(content);
      }

      case 'Switch': {
        const checked = instance.props?.checked || false;
        const content = (
          <div
            data-instance-id={instance.id}
            className={(instance.styleSourceIds || []).map((id) => useStyleStore.getState().styleSources[id]?.name).filter(Boolean).join(' ')}
            style={{
              ...getComputedStyles(instance.styleSourceIds || []) as React.CSSProperties,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px',
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
            }}
            onClick={isPreviewMode ? undefined : () => setSelectedInstanceId(instance.id)}
            onMouseEnter={isPreviewMode ? undefined : () => setHoveredInstanceId(instance.id)}
            onMouseLeave={isPreviewMode ? undefined : () => setHoveredInstanceId(null)}
            onContextMenu={isPreviewMode ? undefined : (e) => handleContextMenu(e, instance)}
          >
            <span className="text-sm font-medium">{instance.props?.label || 'Toggle'}</span>
            <div 
              className={`w-11 h-6 rounded-full p-0.5 flex items-center ${checked ? 'bg-primary justify-end' : 'bg-input justify-start'}`}
            >
              <div className="w-5 h-5 bg-background rounded-full shadow" />
            </div>
          </div>
        );
        return wrapWithDraggable(content);
      }

      case 'Tooltip': {
        const content = (
          <div
            data-instance-id={instance.id}
            className={(instance.styleSourceIds || []).map((id) => useStyleStore.getState().styleSources[id]?.name).filter(Boolean).join(' ')}
            style={{
              ...getComputedStyles(instance.styleSourceIds || []) as React.CSSProperties,
              position: 'relative',
              display: 'inline-block',
            }}
            onClick={isPreviewMode ? undefined : () => setSelectedInstanceId(instance.id)}
            onMouseEnter={isPreviewMode ? undefined : () => setHoveredInstanceId(instance.id)}
            onMouseLeave={isPreviewMode ? undefined : () => setHoveredInstanceId(null)}
            onContextMenu={isPreviewMode ? undefined : (e) => handleContextMenu(e, instance)}
          >
            <button className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md text-sm">
              {instance.props?.triggerText || 'Hover me'}
            </button>
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-foreground text-background rounded text-xs whitespace-nowrap">
              {instance.props?.content || 'Tooltip'}
            </div>
          </div>
        );
        return wrapWithDraggable(content);
      }

      case 'Popover': {
        const content = (
          <div
            data-instance-id={instance.id}
            className={(instance.styleSourceIds || []).map((id) => useStyleStore.getState().styleSources[id]?.name).filter(Boolean).join(' ')}
            style={{
              ...getComputedStyles(instance.styleSourceIds || []) as React.CSSProperties,
              position: 'relative',
              display: 'inline-block',
            }}
            onClick={isPreviewMode ? undefined : () => setSelectedInstanceId(instance.id)}
            onMouseEnter={isPreviewMode ? undefined : () => setHoveredInstanceId(instance.id)}
            onMouseLeave={isPreviewMode ? undefined : () => setHoveredInstanceId(null)}
            onContextMenu={isPreviewMode ? undefined : (e) => handleContextMenu(e, instance)}
          >
            <button className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md text-sm">
              {instance.props?.triggerText || 'Open'}
            </button>
            <div className="absolute top-full left-0 mt-2 p-4 bg-popover border border-border rounded-lg shadow-lg min-w-[200px]">
              <div className="font-semibold text-sm">{instance.props?.title || 'Title'}</div>
              <div className="text-sm text-muted-foreground mt-1">{instance.props?.content || 'Content'}</div>
            </div>
          </div>
        );
        return wrapWithDraggable(content);
      }

      case 'Alert': {
        const content = (
          <div
            data-instance-id={instance.id}
            className={(instance.styleSourceIds || []).map((id) => useStyleStore.getState().styleSources[id]?.name).filter(Boolean).join(' ')}
            style={{
              ...getComputedStyles(instance.styleSourceIds || []) as React.CSSProperties,
              display: 'flex',
              gap: '12px',
              padding: '16px',
              backgroundColor: 'hsl(var(--muted))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
            }}
            onClick={isPreviewMode ? undefined : () => setSelectedInstanceId(instance.id)}
            onMouseEnter={isPreviewMode ? undefined : () => setHoveredInstanceId(instance.id)}
            onMouseLeave={isPreviewMode ? undefined : () => setHoveredInstanceId(null)}
            onContextMenu={isPreviewMode ? undefined : (e) => handleContextMenu(e, instance)}
          >
            <div className="w-5 h-5 bg-primary rounded-full flex-shrink-0" />
            <div>
              <div className="font-semibold text-sm">{instance.props?.title || 'Alert'}</div>
              <div className="text-sm text-muted-foreground">{instance.props?.description || 'Alert description'}</div>
            </div>
          </div>
        );
        return wrapWithDraggable(content);
      }

      case 'Breadcrumb': {
        // Check for BreadcrumbItem children first
        const childItems = instance.children.filter(c => c.type === 'BreadcrumbItem');
        const hasChildItems = childItems.length > 0;
        
        const items = instance.props?.items || [];
        const styles = instance.props?.breadcrumbStyles || {};
        const settings = instance.props?.breadcrumbSettings || {};
        
        // Get separator icon
        const separatorType = styles.separatorType || 'chevron';
        const separatorSize = parseInt(styles.separatorSize || '14');
        const separatorColor = styles.separatorColor || 'hsl(var(--muted-foreground))';
        
        const getSeparator = () => {
          switch (separatorType) {
            case 'slash': return <span style={{ color: separatorColor, fontSize: separatorSize }}>/</span>;
            case 'arrow': return <span style={{ color: separatorColor, fontSize: separatorSize }}>→</span>;
            case 'dot': return <span style={{ color: separatorColor, fontSize: separatorSize, lineHeight: 1 }}>•</span>;
            case 'dash': return <span style={{ color: separatorColor, fontSize: separatorSize }}>—</span>;
            case 'chevron':
            default: return <span style={{ color: separatorColor, fontSize: separatorSize }}>›</span>;
          }
        };

        // Parse padding
        const padding = styles.padding || '0';
        const paddingValue = padding.includes(' ') 
          ? padding.split(' ').map((p: string) => `${p}px`).join(' ')
          : `${padding}px`;

        // Item padding for pill style
        const itemPadding = styles.itemPadding || '';
        const itemPaddingValue = itemPadding 
          ? itemPadding.split(' ').map((p: string) => `${p}px`).join(' ')
          : undefined;

        // Check for generic children (non-BreadcrumbItem)
        const otherChildren = instance.children.filter(c => c.type !== 'BreadcrumbItem');

        // Combine data items with child items
        const allItems = hasChildItems 
          ? childItems.map((child, index) => ({
              id: child.id,
              label: child.props?.label || `Page ${index + 1}`,
              href: child.props?.href || '#',
              isCurrentPage: child.props?.isCurrentPage || false,
              isChildBased: true,
              instance: child,
            }))
          : items.map((item: any) => ({ ...item, isChildBased: false }));

        const content = (
          <div
            data-instance-id={instance.id}
            className={(instance.styleSourceIds || []).map((id) => useStyleStore.getState().styleSources[id]?.name).filter(Boolean).join(' ')}
            style={{
              ...getComputedStyles(instance.styleSourceIds || []) as React.CSSProperties,
              display: 'flex',
              flexDirection: styles.orientation === 'vertical' ? 'column' : 'row',
              alignItems: styles.orientation === 'vertical' ? 'flex-start' : 'center',
              gap: `${styles.gap || 8}px`,
              backgroundColor: styles.backgroundColor || 'transparent',
              padding: paddingValue,
              borderRadius: styles.borderRadius ? `${styles.borderRadius}px` : undefined,
              minHeight: '40px',
            }}
            onClick={isPreviewMode ? undefined : () => setSelectedInstanceId(instance.id)}
            onMouseEnter={isPreviewMode ? undefined : () => setHoveredInstanceId(instance.id)}
            onMouseLeave={isPreviewMode ? undefined : () => setHoveredInstanceId(null)}
            onContextMenu={isPreviewMode ? undefined : (e) => handleContextMenu(e, instance)}
          >
            {allItems.map((item: any, index: number) => {
              const isActive = item.isCurrentPage;
              const isFirst = index === 0;
              
              return (
                <React.Fragment key={item.id || index}>
                  {index > 0 && <span className="flex items-center">{getSeparator()}</span>}
                  {item.isChildBased ? (
                    renderInstance(item.instance, instance, index)
                  ) : (
                    <span
                      style={{
                        color: isActive 
                          ? (styles.activeTextColor || 'hsl(var(--foreground))') 
                          : (styles.textColor || 'hsl(var(--muted-foreground))'),
                        fontSize: `${styles.fontSize || 14}px`,
                        fontWeight: isActive ? (styles.fontWeight || '500') : (styles.fontWeight || '400'),
                        backgroundColor: isActive && styles.activeBackgroundColor
                          ? styles.activeBackgroundColor
                          : (styles.itemBackgroundColor || 'transparent'),
                        padding: itemPaddingValue,
                        borderRadius: styles.borderRadius ? `${styles.borderRadius}px` : undefined,
                        textDecoration: isActive && styles.activeUnderline ? 'underline' : 'none',
                        textUnderlineOffset: '4px',
                        cursor: isPreviewMode && item.href ? 'pointer' : 'default',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                      onClick={isPreviewMode && item.href ? () => window.location.href = item.href : undefined}
                    >
                      {isFirst && settings.showHomeIcon && (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                          <polyline points="9 22 9 12 15 12 15 22"/>
                        </svg>
                      )}
                      {item.label}
                    </span>
                  )}
                </React.Fragment>
              );
            })}
            {allItems.length === 0 && otherChildren.length === 0 && (
              <span className="text-muted-foreground italic text-sm">No breadcrumb items. Add in Data tab or drag BreadcrumbItem.</span>
            )}
            {/* Render generic children (Text, Button, etc.) that were dropped directly */}
            {otherChildren.length > 0 && (
              <div className="p-2 border-l border-dashed border-border ml-2">
                {otherChildren.map((child, idx) => renderInstance(child, instance, idx))}
              </div>
            )}
          </div>
        );
        // Wrap in DroppableContainer in edit mode so BreadcrumbItem children can be dropped
        return isPreviewMode ? wrapWithDraggable(content) : (
          <DroppableContainer key={instance.id} instance={instance} {...commonProps}>
            {content}
          </DroppableContainer>
        );
      }

      case 'Drawer': 
      case 'Sheet':
      case 'Toggle':
      case 'ToggleGroup':
      case 'Pagination':
      case 'OTPInput': {
        // Simple placeholder rendering for these components
        const content = (
          <div
            data-instance-id={instance.id}
            className={(instance.styleSourceIds || []).map((id) => useStyleStore.getState().styleSources[id]?.name).filter(Boolean).join(' ')}
            style={{
              ...getComputedStyles(instance.styleSourceIds || []) as React.CSSProperties,
              padding: '16px',
              border: '1px dashed hsl(var(--border))',
              borderRadius: '8px',
              backgroundColor: 'hsl(var(--muted) / 0.5)',
            }}
            onClick={isPreviewMode ? undefined : () => setSelectedInstanceId(instance.id)}
            onMouseEnter={isPreviewMode ? undefined : () => setHoveredInstanceId(instance.id)}
            onMouseLeave={isPreviewMode ? undefined : () => setHoveredInstanceId(null)}
            onContextMenu={isPreviewMode ? undefined : (e) => handleContextMenu(e, instance)}
          >
            <div className="text-sm font-medium text-muted-foreground">{instance.type}</div>
            <div className="text-xs text-muted-foreground">Configure in Data tab</div>
          </div>
        );
        return wrapWithDraggable(content);
      }

      case 'Separator':
      case 'Divider': {
        // Read from separatorSettings (matching SeparatorDataEditor)
        const settings = instance.props?.separatorSettings || {};
        const orientation = settings.orientation || 'horizontal';
        const isHorizontal = orientation === 'horizontal';
        const decorative = settings.decorative !== false;
        
        // Get computed styles from style system - this includes color, border-style, dimensions from style panel
        const computedStyles = getComputedStyles(instance.styleSourceIds || []) as React.CSSProperties;

        const content = (
          <div
            data-instance-id={instance.id}
            role={decorative ? 'presentation' : 'separator'}
            aria-hidden={decorative ? 'true' : undefined}
            className={(instance.styleSourceIds || []).map((id) => useStyleStore.getState().styleSources[id]?.name).filter(Boolean).join(' ')}
            style={{
              ...computedStyles,
              // Add minimum clickable area without overriding visual appearance
              minHeight: isHorizontal ? '8px' : (computedStyles.minHeight || '24px'),
              minWidth: !isHorizontal ? '8px' : undefined,
              cursor: isPreviewMode ? 'default' : 'pointer',
              // Ensure the separator is centered within its min-height hit area
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxSizing: 'border-box',
            }}
            onClick={isPreviewMode ? undefined : () => setSelectedInstanceId(instance.id)}
            onMouseEnter={isPreviewMode ? undefined : () => setHoveredInstanceId(instance.id)}
            onMouseLeave={isPreviewMode ? undefined : () => setHoveredInstanceId(null)}
            onContextMenu={isPreviewMode ? undefined : (e) => handleContextMenu(e, instance)}
          />
        );
        return wrapWithDraggable(content);
      }

      // Table child primitives - use dedicated components to attach droppable directly to table elements
      case 'TableRow':
        return (
          <TableRowElement
            key={instance.id}
            instance={instance}
            parentInstance={parentInstance}
            isPreviewMode={isPreviewMode}
            getComputedStyles={getComputedStyles}
            renderInstance={renderInstance}
            setSelectedInstanceId={setSelectedInstanceId}
            setHoveredInstanceId={setHoveredInstanceId}
            handleContextMenu={handleContextMenu}
          />
        );

      case 'TableHeaderCell':
        return (
          <TableHeaderCellElement
            key={instance.id}
            instance={instance}
            parentInstance={parentInstance}
            isPreviewMode={isPreviewMode}
            getComputedStyles={getComputedStyles}
            renderInstance={renderInstance}
            setSelectedInstanceId={setSelectedInstanceId}
            setHoveredInstanceId={setHoveredInstanceId}
            handleContextMenu={handleContextMenu}
          />
        );

      case 'TableCell':
        return (
          <TableCellElement
            key={instance.id}
            instance={instance}
            parentInstance={parentInstance}
            isPreviewMode={isPreviewMode}
            getComputedStyles={getComputedStyles}
            renderInstance={renderInstance}
            setSelectedInstanceId={setSelectedInstanceId}
            setHoveredInstanceId={setHoveredInstanceId}
            handleContextMenu={handleContextMenu}
          />
        );

      // Tab Panel child primitive
      case 'TabPanel': {
        const content = (
          <div
            data-instance-id={instance.id}
            className={(instance.styleSourceIds || []).map((id) => useStyleStore.getState().styleSources[id]?.name).filter(Boolean).join(' ')}
            style={{
              ...getComputedStyles(instance.styleSourceIds || []) as React.CSSProperties,
              width: '100%',
              minHeight: '100px',
              padding: '16px',
            }}
            onClick={isPreviewMode ? undefined : (e) => { e.stopPropagation(); setSelectedInstanceId(instance.id); }}
            onMouseEnter={isPreviewMode ? undefined : () => setHoveredInstanceId(instance.id)}
            onMouseLeave={isPreviewMode ? undefined : () => setHoveredInstanceId(null)}
            onContextMenu={isPreviewMode ? undefined : (e) => handleContextMenu(e, instance)}
          >
            {/* Filter out TabTrigger - only show content children */}
            {(() => {
              const contentChildren = instance.children.filter(c => (c.type as string) !== 'TabTrigger');
              return contentChildren.length > 0 
                ? contentChildren.map((child, idx) => renderInstance(child, instance, idx))
                : !isPreviewMode ? (
                  <div className="flex items-center justify-center h-16 border-2 border-dashed border-blue-300 rounded-lg bg-blue-50/50 dark:bg-blue-950/20">
                    <span className="text-sm text-blue-500 font-medium">Drop elements here</span>
                  </div>
                ) : null;
            })()}
          </div>
        );
        return isPreviewMode ? content : (
          <DroppableContainer key={instance.id} instance={instance} {...commonProps}>
            {content}
          </DroppableContainer>
        );
      }

      // Accordion Item child primitive - container-based with droppable content area
      case 'AccordionItem': {
        const isOpen = instance.props?.defaultOpen || false;
        
        // Find Heading child as the title, and separate content children
        const headingChild = instance.children.find(c => c.type === 'Heading');
        const contentChildren = instance.children.filter(c => c.type !== 'Heading');
        const hasContentChildren = contentChildren.length > 0;
        
        // Fallback title from props if no Heading child exists
        const fallbackTitle = instance.props?.title || 'Accordion Item';
        
        const content = (
          <div
            data-instance-id={instance.id}
            className={(instance.styleSourceIds || []).map((id) => useStyleStore.getState().styleSources[id]?.name).filter(Boolean).join(' ')}
            style={{
              ...getComputedStyles(instance.styleSourceIds || []) as React.CSSProperties,
              borderBottom: '1px solid hsl(var(--border))',
            }}
            onClick={isPreviewMode ? undefined : (e) => { e.stopPropagation(); setSelectedInstanceId(instance.id); }}
            onMouseEnter={isPreviewMode ? undefined : () => setHoveredInstanceId(instance.id)}
            onMouseLeave={isPreviewMode ? undefined : () => setHoveredInstanceId(null)}
            onContextMenu={isPreviewMode ? undefined : (e) => handleContextMenu(e, instance)}
          >
            {/* Trigger Header */}
            <div className="flex items-center justify-between py-4 px-2 text-sm cursor-pointer hover:bg-muted/30 transition-colors">
              {headingChild ? (
                renderInstance(headingChild, instance, 0)
              ) : (
                <span className="font-medium">{fallbackTitle}</span>
              )}
              <svg 
                className={`h-4 w-4 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2"
              >
                <path d="M6 9l6 6 6-6"/>
              </svg>
            </div>
            
            {/* Content Area - Always visible in edit mode for dropping */}
            {(isOpen || !isPreviewMode) && (
              <div 
                className="pb-4 px-2"
                style={{ minHeight: isPreviewMode ? 'auto' : '80px' }}
              >
                {hasContentChildren ? (
                  <div className="space-y-2">
                    {contentChildren.map((child, idx) => renderInstance(child, instance, idx))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-16 border-2 border-dashed border-blue-300 rounded-lg bg-blue-50/50 dark:bg-blue-950/20">
                    <span className="text-sm text-blue-500 font-medium">Drop elements here</span>
                  </div>
                )}
              </div>
            )}
          </div>
        );
        
        return isPreviewMode ? content : (
          <DroppableContainer key={instance.id} instance={instance} {...commonProps}>
            {content}
          </DroppableContainer>
        );
      }

      // Breadcrumb Item child primitive
      case 'BreadcrumbItem': {
        const label = instance.props?.label || 'Page';
        const href = instance.props?.href || '#';
        const isCurrentPage = instance.props?.isCurrentPage || false;
        const content = (
          <span
            data-instance-id={instance.id}
            style={{
              ...getComputedStyles(instance.styleSourceIds || []) as React.CSSProperties,
              color: isCurrentPage ? 'hsl(var(--foreground))' : 'hsl(var(--muted-foreground))',
              fontWeight: isCurrentPage ? '500' : '400',
              cursor: isPreviewMode && href && !isCurrentPage ? 'pointer' : 'default',
            }}
            onClick={isPreviewMode ? (href && !isCurrentPage ? () => window.location.href = href : undefined) : (e) => { e.stopPropagation(); setSelectedInstanceId(instance.id); }}
            onMouseEnter={isPreviewMode ? undefined : () => setHoveredInstanceId(instance.id)}
            onMouseLeave={isPreviewMode ? undefined : () => setHoveredInstanceId(null)}
            onContextMenu={isPreviewMode ? undefined : (e) => handleContextMenu(e, instance)}
          >
            {instance.children.length > 0 
              ? instance.children.map((child, idx) => renderInstance(child, instance, idx))
              : label}
          </span>
        );
        return wrapWithDraggable(content);
      }

      // Carousel Slide child primitive
      case 'CarouselSlide': {
        const imageUrl = instance.props?.imageUrl;
        const alt = instance.props?.alt || 'Slide';
        const title = instance.props?.title || '';
        const description = instance.props?.description || '';
        const hasChildren = instance.children.length > 0;
        
        const content = (
          <div
            data-instance-id={instance.id}
            className={(instance.styleSourceIds || []).map((id) => useStyleStore.getState().styleSources[id]?.name).filter(Boolean).join(' ')}
            style={{
              ...getComputedStyles(instance.styleSourceIds || []) as React.CSSProperties,
              width: '100%',
              minHeight: '200px',
              position: 'relative',
              backgroundColor: 'hsl(var(--muted))',
              borderRadius: '8px',
              marginBottom: isPreviewMode ? '0' : '8px',
            }}
            onClick={isPreviewMode ? undefined : (e) => { e.stopPropagation(); setSelectedInstanceId(instance.id); }}
            onMouseEnter={isPreviewMode ? undefined : () => setHoveredInstanceId(instance.id)}
            onMouseLeave={isPreviewMode ? undefined : () => setHoveredInstanceId(null)}
            onContextMenu={isPreviewMode ? undefined : (e) => handleContextMenu(e, instance)}
          >
            {/* Slide label header in edit mode */}
            {!isPreviewMode && (
              <div className="absolute top-2 left-2 z-10 px-2 py-1 bg-background/80 rounded text-[10px] font-medium text-muted-foreground border border-border">
                {instance.label || 'Slide'}
              </div>
            )}
            
            {hasChildren ? (
              <div className="p-4">
                {instance.children.map((child, idx) => renderInstance(child, instance, idx))}
              </div>
            ) : (
              <>
                {/* Show placeholder or fallback content */}
                {imageUrl ? (
                  <img src={imageUrl} alt={alt} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
                ) : !isPreviewMode ? (
                  <div className="flex items-center justify-center h-48 border-2 border-dashed border-blue-300 rounded-lg bg-blue-50/50 dark:bg-blue-950/20 m-4">
                    <span className="text-sm text-blue-500 font-medium">Drop elements here</span>
                  </div>
                ) : null}
                {(title || description) && (
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '16px', background: 'linear-gradient(transparent, rgba(0,0,0,0.7))', color: 'white', borderRadius: '0 0 8px 8px' }}>
                    {title && <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>{title}</h3>}
                    {description && <p style={{ margin: '4px 0 0', fontSize: '14px', opacity: 0.9 }}>{description}</p>}
                  </div>
                )}
              </>
            )}
          </div>
        );
        return isPreviewMode ? content : (
          <DroppableContainer key={instance.id} instance={instance} {...commonProps}>
            {content}
          </DroppableContainer>
        );
      }

      default:
        return null;
    }
  };

  // Get root instance styles for page body
  const rootStyles = rootInstance ? getComputedStyles(rootInstance.styleSourceIds || []) : {};

  // Always show only the current page for focused editing
  const pagesToRender = safePages.filter(p => p === currentPage);

  // Calculate left/top offsets for rulers view (sidebar widths + ruler size)
  const rulersOffset = isRulersView ? { left: 280, top: 72 } : { left: 0, top: 0 };
  
  return (
    <div 
      ref={(node) => {
        canvasRef.current = node;
        setNodeRef(node);
        onCanvasRef?.(node);
      }}
      className={`absolute inset-0 ${isPreviewMode ? 'overflow-auto' : 'overflow-auto'} bg-[#e5e7eb] dark:bg-zinc-800 builder-canvas flex items-start justify-center`}
      style={{
        backgroundImage: isPreviewMode || isRulersView ? 'none' : `radial-gradient(circle, #9ca3af 1px, transparent 1px)`,
        backgroundSize: '20px 20px',
        backgroundPosition: 'center',
        cursor: isPanMode ? (isPanning ? 'grabbing' : 'grab') : 'default',
        paddingTop: isPreviewMode ? 0 : (isRulersView ? 48 : 64),
        paddingLeft: isPreviewMode ? 0 : (isRulersView ? 280 : 0),
        paddingRight: isPreviewMode ? 0 : (isRulersView ? 280 : 0),
        backgroundColor: isPreviewMode ? undefined : (isRulersView ? 'hsl(var(--muted))' : undefined),
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={(e) => {
        handleMouseMove(e);
        handleResizeMove(e);
      }}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Rulers for rulers view - hidden when code view is open */}
      {isRulersView && !isPreviewMode && !isCodeViewOpen && (
        <>
          {/* Horizontal Ruler */}
          <div 
            className="fixed bg-background border-b border-border z-[45] flex items-end"
            style={{ 
              top: 52,
              left: 280,
              right: 256,
              height: 24,
            }}
          >
            <div className="relative w-full h-full overflow-hidden">
              {Array.from({ length: Math.ceil(1440 / 100) + 1 }).map((_, i) => (
                <React.Fragment key={i}>
                  <div
                    className="absolute bottom-0"
                    style={{
                      left: `calc(50% - 720px + ${i * 100}px)`,
                      width: '1px',
                      height: '12px',
                      backgroundColor: 'hsl(var(--foreground) / 0.5)',
                    }}
                  />
                  <span 
                    className="absolute text-[9px] font-mono text-muted-foreground"
                    style={{ 
                      left: `calc(50% - 720px + ${i * 100}px + 2px)`,
                      bottom: '12px',
                    }}
                  >
                    {i * 100}
                  </span>
                  {/* Minor ticks */}
                  {Array.from({ length: 9 }).map((_, j) => (
                    <div
                      key={`minor-${j}`}
                      className="absolute bottom-0"
                      style={{
                        left: `calc(50% - 720px + ${i * 100 + (j + 1) * 10}px)`,
                        width: '1px',
                        height: '6px',
                        backgroundColor: 'hsl(var(--foreground) / 0.2)',
                      }}
                    />
                  ))}
                </React.Fragment>
              ))}
            </div>
          </div>
          
          {/* Vertical Ruler */}
          <div 
            className="fixed bg-background border-r border-border z-[45] flex items-end justify-end"
            style={{ 
              top: 76,
              left: 256,
              width: 24,
              bottom: 0,
            }}
          >
            <div className="relative w-full h-full overflow-hidden">
              {Array.from({ length: Math.ceil(1200 / 100) + 1 }).map((_, i) => (
                <React.Fragment key={i}>
                  <div
                    className="absolute right-0"
                    style={{
                      top: `${i * 100}px`,
                      height: '1px',
                      width: '12px',
                      backgroundColor: 'hsl(var(--foreground) / 0.5)',
                    }}
                  />
                  <span 
                    className="absolute text-[9px] font-mono text-muted-foreground"
                    style={{ 
                      top: `${i * 100 + 2}px`,
                      right: '14px',
                    }}
                  >
                    {i * 100}
                  </span>
                  {/* Minor ticks */}
                  {Array.from({ length: 9 }).map((_, j) => (
                    <div
                      key={`minor-${j}`}
                      className="absolute right-0"
                      style={{
                        top: `${i * 100 + (j + 1) * 10}px`,
                        height: '1px',
                        width: '6px',
                        backgroundColor: 'hsl(var(--foreground) / 0.2)',
                      }}
                    />
                  ))}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Corner square */}
          <div 
            className="fixed bg-background border-r border-b border-border z-[46]"
            style={{ 
              top: 52,
              left: 256,
              width: 24,
              height: 28,
            }}
          />
        </>
      )}

      <div 
        className={`transition-transform origin-top ${isPreviewMode ? 'flex w-full' : 'inline-flex'} items-start justify-center ${isRulersView ? '' : 'gap-8'}`}
        style={{
          // NOTE: contentEditable has a known browser bug when inside ANY CSS transform.
          // Avoid applying transform when zoom is effectively 100% to prevent "typing backwards".
          transform:
            isPreviewMode || Math.abs(zoom - 100) < 0.01
              ? 'none'
              : `scale(${zoom / 100})`,
          padding: isPreviewMode ? '0' : (isRulersView ? '2rem' : '4rem'),
          minHeight: isPreviewMode ? '100vh' : '100vh',
          minWidth: isPreviewMode ? '100%' : '100%',
          width: isPreviewMode ? '100%' : 'auto',
        }}
      >
        {pagesToRender.map((pageId, index) => {
          const pageData = allPages?.find(p => p.id === pageId);
          const pageRootInstance = pageData?.rootInstance;
          const pageStyles = rootStyles as React.CSSProperties;
          const isCurrentPage = pageId === currentPage;
          // Current page respects breakpoint, other pages stay at 1440px
          const frameWidth = isPreviewMode ? '100%' : (isCurrentPage ? displayWidth : 1440);
          
          return (
          <div 
            key={pageId}
            className={`builder-page ${!isPreviewMode ? 'scrollbar-thin' : ''} ${isCurrentPage ? 'ring-2 ring-blue-500' : ''} ${isAddingComment && isCurrentPage ? 'cursor-crosshair' : ''}`}
            style={{ 
              // Fallback white background for imported content without explicit backgrounds
              backgroundColor: '#ffffff',
              ...pageStyles,
              width: isPreviewMode ? '100%' : `${frameWidth}px`,
              minHeight: isPreviewMode ? '100vh' : '1200px',
              maxHeight: isPreviewMode ? 'none' : 'calc(100vh - 8rem)',
              boxShadow: isPreviewMode ? 'none' : '0 2px 8px rgba(0,0,0,0.1)',
              transition: isResizing ? 'none' : 'width 0.3s ease',
              position: 'relative',
              overflow: isPreviewMode ? 'visible' : 'auto',
              flexShrink: 0,
              cursor: isAddingComment && isCurrentPage ? 'crosshair' : (isCurrentPage ? 'default' : 'pointer'),
              fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', // Reset to system font for canvas content
            }}
            onClickCapture={(e) => {
              // Handle adding comment on canvas click - use capture to intercept before children
              // But don't trigger if clicking inside the comment dialog
              const target = e.target as HTMLElement;
              if (target.closest('.add-comment-dialog')) {
                return; // Don't reposition if clicking inside dialog
              }
              
              if (isAddingComment && isCurrentPage && addCommentPosition === null) {
                e.stopPropagation();
                e.preventDefault();
                const rect = e.currentTarget.getBoundingClientRect();
                const scrollTop = e.currentTarget.scrollTop || 0;
                const x = ((e.clientX - rect.left) / rect.width) * 100;
                const y = (e.clientY - rect.top) + scrollTop;
                // Store both page-relative and screen positions
                setAddCommentPosition({ x, y, screenX: e.clientX, screenY: e.clientY });
                return;
              }
            }}
            onClick={(e) => {
              if (!isCurrentPage && e.target === e.currentTarget) {
                onPageChange?.(pageId);
              }
            }}
          >
            {/* Breakpoint Width Indicator */}
            {!isPreviewMode && (
              <div 
                className="absolute -top-10 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-blue-500 text-white px-3 py-1.5 rounded-md shadow-lg text-xs font-semibold z-10"
                style={{ pointerEvents: 'none' }}
              >
                <span>{pageNames[pageId] || pageId}</span>
                <span className="opacity-70">•</span>
                <span>{isCurrentPage ? displayWidth : frameWidth}px</span>
              </div>
            )}

            {/* Left Resize Handle */}
            {!isPreviewMode && (
              <CanvasResizeHandle
                side="left"
                isActive={isResizing === 'left'}
                onMouseDown={handleResizeStart}
              />
            )}

            {/* Right Resize Handle */}
            {!isPreviewMode && (
              <CanvasResizeHandle
                side="right"
                isActive={isResizing === 'right'}
                onMouseDown={handleResizeStart}
              />
            )}

            {/* Comment Markers - Only show when comment mode is active */}
            {isAddingComment && isCurrentPage && pageComments.map((comment, index) => (
              <CommentMarker
                key={comment.id}
                comment={comment}
                index={index}
              />
            ))}


            {/* Global Header */}
            {globalHeader && shouldShowGlobalComponent(pageData.id, 'header') && (
              <div className="global-component-wrapper relative" data-global-slot="header">
                {renderInstance(globalHeader)}
              </div>
            )}
            
            {pageRootInstance && renderInstance(pageRootInstance)}
            
            {/* Global Footer */}
            {globalFooter && shouldShowGlobalComponent(pageData.id, 'footer') && (
              <div className="global-component-wrapper relative" data-global-slot="footer">
                {renderInstance(globalFooter)}
              </div>
            )}
          </div>
          );
        })}
      </div>
      
      {/* Hover/Selection Overlays and Context Menu disabled in Preview and Code View */}
      {!isPreviewMode && !isCodeViewOpen && hoveredElement && (
        <HoverOverlay element={hoveredElement} instanceId={hoveredInstanceId || undefined} />
      )}
      {!isPreviewMode && !isCodeViewOpen && selectedElement && selectedInstance && (
        <SelectionOverlay 
          instance={selectedInstance} 
          element={selectedElement}
          onOpenHeadingSettings={(position) => setHeadingSettings({ isOpen: true, position })}
          onAddElement={(position) => setRichTextAddMenu({ 
            isOpen: true, 
            position,
            instanceId: selectedInstance.id 
          })}
        />
      )}
      {!isPreviewMode && contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          instance={contextMenu.instance}
          onClose={() => setContextMenu(null)}
          onSaveAsPrebuilt={(instance) => setPrebuiltDialog({ open: true, instance })}
        />
      )}
      {!isPreviewMode && headingSettings?.isOpen && selectedInstance?.type === 'Heading' && (
        <HeadingSettingsPopover
          isOpen={headingSettings.isOpen}
          onClose={() => setHeadingSettings(null)}
          position={headingSettings.position}
          currentTag={selectedInstance.props.level || 'h1'}
          currentText={selectedInstance.props.children || ''}
          onTagChange={(tag) => {
            updateInstance(selectedInstance.id, {
              props: { ...selectedInstance.props, level: tag },
            });
          }}
          onTextChange={(text) => {
            updateInstance(selectedInstance.id, {
              props: { ...selectedInstance.props, children: text },
            });
          }}
          onShowAllSettings={() => {
            setHeadingSettings(null);
            // Could trigger Settings tab switch here if needed
          }}
        />
      )}
      
      {/* Save as Prebuilt Dialog */}
      <SavePrebuiltDialog
        open={prebuiltDialog.open}
        onOpenChange={(open) => setPrebuiltDialog({ ...prebuiltDialog, open })}
        instance={prebuiltDialog.instance}
      />
      
      {/* Add Comment Dialog - Fixed position, rendered at root level */}
      <AddCommentDialog
        open={addCommentPosition !== null}
        onOpenChange={(open) => {
          if (!open) {
            setAddCommentPosition(null);
          }
        }}
        position={addCommentPosition}
        pageId={currentPage}
      />
    </div>
  );
};
