import React, { useState, useEffect, useRef } from 'react';
import { useBuilderStore } from '../store/useBuilderStore';
import { useStyleStore } from '../store/useStyleStore';
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
import { NavigationPrimitive } from '../primitives/NavigationPrimitive';
import { CellPrimitive } from '../primitives/CellPrimitive';
import { breakpoints } from './PageNavigation';
import { ContextMenu } from './ContextMenu';
import { SelectionOverlay } from './SelectionOverlay';
import { HoverOverlay } from './HoverOverlay';
import { HeadingSettingsPopover } from './HeadingSettingsPopover';
import { useDroppable } from '@dnd-kit/core';
import { componentRegistry } from '../primitives/registry';
import { generateId } from '../utils/instance';
import { DroppableContainer } from './DroppableContainer';
import { DraggableInstance } from './DraggableInstance';

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
}

export const Canvas: React.FC<CanvasProps> = ({ zoom, onZoomChange, currentBreakpoint, pages, currentPage, pageNames, onPageNameChange, isPanMode, isPreviewMode, onCanvasRef, onPageChange, allPages = [] }) => {
  // Ensure pages is always an array
  const safePages = Array.isArray(pages) ? pages : [];
  
  const rootInstance = useBuilderStore((state) => state.rootInstance);
  const selectedInstanceId = useBuilderStore((state) => state.selectedInstanceId);
  const hoveredInstanceId = useBuilderStore((state) => state.hoveredInstanceId);
  const setSelectedInstanceId = useBuilderStore((state) => state.setSelectedInstanceId);
  const setHoveredInstanceId = useBuilderStore((state) => state.setHoveredInstanceId);
  const addInstance = useBuilderStore((state) => state.addInstance);
  const updateInstance = useBuilderStore((state) => state.updateInstance);
  const { findInstance } = useBuilderStore();
  const { getComputedStyles } = useStyleStore();
  const [editingPageId, setEditingPageId] = useState<string | null>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; instance: ComponentInstance } | null>(null);
  const [headingSettings, setHeadingSettings] = useState<{ isOpen: boolean; position: { x: number; y: number } } | null>(null);
  const [richTextAddMenu, setRichTextAddMenu] = useState<{ isOpen: boolean; position: { x: number; y: number }; instanceId: string } | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [customWidth, setCustomWidth] = useState<number | null>(null);
  const [isResizing, setIsResizing] = useState<'left' | 'right' | null>(null);
  const [resizeStart, setResizeStart] = useState({ x: 0, width: 0 });
  const [touchStart, setTouchStart] = useState<{ x: number; y: number; distance: number } | null>(null);
  const [initialZoom, setInitialZoom] = useState<number>(100);

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

  const renderInstance = (instance: ComponentInstance): React.ReactNode => {
    const isSelected = instance.id === selectedInstanceId;
    const isHovered = instance.id === hoveredInstanceId;
    const isContainer = ['Div', 'Container', 'Section', 'Navigation'].includes(instance.type);

    const commonProps = {
      instance,
      isSelected,
      isHovered,
      onSelect: isPreviewMode ? undefined : () => setSelectedInstanceId(instance.id),
      onHover: isPreviewMode ? undefined : () => setHoveredInstanceId(instance.id),
      onHoverEnd: isPreviewMode ? undefined : () => setHoveredInstanceId(null),
      onContextMenu: isPreviewMode ? undefined : (e: React.MouseEvent) => handleContextMenu(e, instance),
      isPreviewMode,
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
        const content = (
          <Div {...commonProps}>
            {instance.children.map((child) => renderInstance(child))}
          </Div>
        );
        return isPreviewMode ? content : (
          <DroppableContainer key={instance.id} instance={instance} {...commonProps}>
            {content}
          </DroppableContainer>
        );
      }
      case 'Container': {
        const content = (
          <Container {...commonProps}>
            {instance.children.map((child) => renderInstance(child))}
          </Container>
        );
        return isPreviewMode ? content : (
          <DroppableContainer key={instance.id} instance={instance} {...commonProps}>
            {content}
          </DroppableContainer>
        );
      }
      case 'Section': {
        const content = (
          <Section {...commonProps}>
            {instance.children.map((child) => renderInstance(child))}
          </Section>
        );
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
            {instance.children.map((child) => renderInstance(child))}
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
      case 'Link':
        return wrapWithDraggable(<LinkPrimitive key={instance.id} {...commonProps} />);
      case 'Table':
        return wrapWithDraggable(
          <TablePrimitive 
            key={instance.id} 
            instance={instance}
            isSelected={isSelected}
            onUpdateProp={(key, value) => {
              const { updateInstance } = useBuilderStore.getState();
              updateInstance(instance.id, {
                props: { ...instance.props, [key]: value }
              });
            }}
          />
        );
      case 'Form': {
        // If Form has children (new composite structure), render as Div container
        if (instance.children && instance.children.length > 0) {
          const content = (
            <Div {...commonProps}>
              {instance.children.map((child) => renderInstance(child))}
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
      case 'Navigation': {
        // If Navigation has children (new composite structure), render as Div container
        if (instance.children && instance.children.length > 0) {
          const content = (
            <Div {...commonProps}>
              {instance.children.map((child) => renderInstance(child))}
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
            logo={instance.props.logo}
            menuItems={instance.props.menuItems}
            alignment={instance.props.alignment}
            mobileAnimation={instance.props.mobileAnimation}
            animationDuration={instance.props.animationDuration}
            hamburgerStyle={instance.props.hamburgerStyle}
            animateIcon={instance.props.animateIcon}
            isSelected={isSelected}
            className=""
            style={getComputedStyles(instance.styleSourceIds || []) as React.CSSProperties}
          >
            {instance.children.map((child) => renderInstance(child))}
          </NavigationPrimitive>
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
  
  return (
    <div 
      ref={(node) => {
        canvasRef.current = node;
        setNodeRef(node);
        onCanvasRef?.(node);
      }}
      className={`absolute inset-0 ${isPreviewMode ? 'overflow-auto' : 'overflow-auto'} bg-[#e5e7eb] dark:bg-zinc-800 builder-canvas flex items-center justify-center`}
      style={{
        backgroundImage: isPreviewMode ? 'none' : `radial-gradient(circle, #9ca3af 1px, transparent 1px)`,
        backgroundSize: '20px 20px',
        backgroundPosition: 'center',
        cursor: isPanMode ? (isPanning ? 'grabbing' : 'grab') : 'default',
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
      <div 
        className="transition-transform origin-top-left inline-flex items-start justify-start gap-8"
        style={{
          transform: isPreviewMode ? 'none' : `scale(${zoom / 100})`,
          transformOrigin: 'top left',
          padding: isPreviewMode ? '0' : '4rem', // Reduced padding for better visibility
          minHeight: isPreviewMode ? 'auto' : '100vh',
          minWidth: isPreviewMode ? 'auto' : '100%',
        }}
      >
        {safePages.map((pageId, index) => {
          const pageData = allPages?.find(p => p.id === pageId);
          const pageRootInstance = pageData?.rootInstance;
          const pageStyles = rootStyles as React.CSSProperties;
          // All pages stay at 1440px - only current page respects breakpoint
          const isCurrentPage = pageId === currentPage;
          const frameWidth = isPreviewMode 
            ? '100%' 
            : (isCurrentPage ? (typeof currentBreakpointWidth === 'number' ? currentBreakpointWidth : 1440) : 1440);
          
          return (
          <div 
            key={pageId}
            className={`builder-page ${!isPreviewMode ? 'scrollbar-thin' : ''} ${isCurrentPage ? 'ring-2 ring-blue-500' : ''}`}
            style={{ 
              ...pageStyles,
              width: isPreviewMode ? '100%' : `${frameWidth}px`,
              minHeight: isPreviewMode ? '100vh' : '1200px',
              maxHeight: isPreviewMode ? 'none' : 'calc(100vh - 8rem)',
              boxShadow: isPreviewMode ? 'none' : '0 2px 8px rgba(0,0,0,0.1)',
              transition: isResizing ? 'none' : 'width 0.3s ease',
              position: 'relative',
              overflow: isPreviewMode ? 'visible' : 'auto',
              flexShrink: 0,
              cursor: isCurrentPage ? 'default' : 'pointer',
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
              <div
                className="absolute left-0 top-0 bottom-0 w-1 cursor-ew-resize hover:bg-blue-500 transition-colors z-20"
                style={{
                  backgroundColor: isResizing === 'left' ? '#3b82f6' : 'transparent',
                }}
                onMouseDown={(e) => handleResizeStart(e, 'left')}
              />
            )}

            {/* Right Resize Handle */}
            {!isPreviewMode && (
              <div
                className="absolute right-0 top-0 bottom-0 w-1 cursor-ew-resize hover:bg-blue-500 transition-colors z-20"
                style={{
                  backgroundColor: isResizing === 'right' ? '#3b82f6' : 'transparent',
                }}
                onMouseDown={(e) => handleResizeStart(e, 'right')}
              />
            )}

            {pageRootInstance && renderInstance(pageRootInstance)}
          </div>
          );
        })}
      </div>
      
      {/* Hover/Selection Overlays and Context Menu disabled in Preview */}
      {!isPreviewMode && hoveredElement && (
        <HoverOverlay element={hoveredElement} />
      )}
      {!isPreviewMode && selectedElement && selectedInstance && (
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
    </div>
  );
};
