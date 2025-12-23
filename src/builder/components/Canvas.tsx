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
import { DropdownPrimitive } from '../primitives/DropdownPrimitive';
import { breakpoints } from './PageNavigation';
import { ContextMenu } from './ContextMenu';
import { SelectionOverlay } from './SelectionOverlay';
import { HoverOverlay } from './HoverOverlay';
import { HeadingSettingsPopover } from './HeadingSettingsPopover';
import { SavePrebuiltDialog } from './SavePrebuiltDialog';
import { useDroppable } from '@dnd-kit/core';
import { componentRegistry } from '../primitives/registry';
import { generateId } from '../utils/instance';
import { DroppableContainer } from './DroppableContainer';
import { DraggableInstance } from './DraggableInstance';
import { Accordion as ShadcnAccordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { CarouselPreview } from './CarouselPreview';

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
  const [prebuiltDialog, setPrebuiltDialog] = useState<{ open: boolean; instance: ComponentInstance | null }>({ open: false, instance: null });

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
      onSelect: isPreviewMode ? undefined : () => setSelectedInstanceId(instance.id),
      onHover: isPreviewMode ? undefined : () => setHoveredInstanceId(instance.id),
      onHoverEnd: isPreviewMode ? undefined : () => setHoveredInstanceId(null),
      onContextMenu: isPreviewMode ? undefined : (e: React.MouseEvent) => handleContextMenu(e, instance),
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
      case 'Dropdown': {
        // DropdownPrimitive now handles isOpen state from dropdownConfig internally
        const content = (
          <DropdownPrimitive {...commonProps}>
            {instance.children.map((child) => renderInstance(child))}
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
            {instance.children.map((child) => renderInstance(child))}
          </NavigationPrimitive>
        );
        return isPreviewMode ? content : (
          <DroppableContainer key={instance.id} instance={instance} {...commonProps}>
            {content}
          </DroppableContainer>
        );
      }

      case 'Accordion': {
        const items = instance.props?.items || [];
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

        // Render the appropriate icon based on settings
        const renderIcon = (isOpen: boolean) => {
          if (iconPosition === 'none') return null;
          switch (iconStyle) {
            case 'plus-minus':
              return isOpen 
                ? <span className="h-4 w-4 shrink-0 flex items-center justify-center">−</span>
                : <span className="h-4 w-4 shrink-0 flex items-center justify-center">+</span>;
            case 'arrow':
              return <svg className={`h-4 w-4 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>;
            default:
              return <svg className={`h-4 w-4 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>;
          }
        };

        // In preview mode, render a fully interactive accordion using the shadcn/Radix component
        if (isPreviewMode) {
          const defaultOpenValues = items
            .filter((item: any) => item.defaultOpen)
            .map((item: any, index: number) => String(item.id ?? `item-${index}`));

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
              <ShadcnAccordion
                type={collapseMode === 'multiple' ? 'multiple' : 'single'}
                defaultValue={collapseMode === 'multiple' ? defaultOpenValues : defaultOpenValues[0]}
                className={`w-full accordion-items-container`}
                {...(collapseMode === 'single' ? { collapsible: true } : {})}
              >
                {items.map((item: any, index: number) => {
                  const value = String(item.id ?? `item-${index}`);
                  return (
                    <AccordionItem key={value} value={value} className="accordion-item">
                      <AccordionTrigger className={`accordion-trigger ${iconPosition === 'left' ? 'flex-row-reverse justify-end gap-2' : ''}`}>
                        {item.title || `Item ${index + 1}`}
                      </AccordionTrigger>
                      <AccordionContent className="accordion-content">
                        {item.content || 'Accordion content'}
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </ShadcnAccordion>
              {items.length === 0 && (
                <div className="py-4 text-sm text-muted-foreground italic">
                  No accordion items. Add items in the Data tab.
                </div>
              )}
            </div>
          );

          return wrapWithDraggable(content);
        }

        // In edit mode, render a static representation that reflects the orientation and styles
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
              {items.map((item: any, index: number) => (
                <div 
                  key={item.id || index} 
                  className="accordion-item"
                >
                  <button 
                    className={`accordion-trigger flex w-full items-center justify-between py-4 text-sm font-medium transition-all ${iconPosition === 'left' ? 'flex-row-reverse justify-end gap-2' : ''} ${item.defaultOpen ? 'active' : ''}`}
                  >
                    {item.title}
                    {renderIcon(item.defaultOpen)}
                  </button>
                  {item.defaultOpen && (
                    <div className="accordion-content text-sm text-muted-foreground">
                      {item.content}
                    </div>
                  )}
                </div>
              ))}
            </div>
            {items.length === 0 && (
              <div className="py-4 text-sm text-muted-foreground italic">
                No accordion items. Add items in the Data tab.
              </div>
            )}
          </div>
        );

        return wrapWithDraggable(content);
      }

      case 'Carousel': {
        const slides = instance.props?.slides || [];
        const styles = instance.props?.carouselStyles || {};
        const showArrows = instance.props?.showArrows ?? true;
        const showDots = instance.props?.showDots ?? true;
        const autoPlay = instance.props?.autoPlay ?? false;
        const autoPlayInterval = instance.props?.autoPlayInterval ?? 3000;
        const pauseOnHover = instance.props?.pauseOnHover ?? true;
        const loop = instance.props?.loop ?? true;
        
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
              slides={slides}
              styles={styles}
              autoPlay={autoPlay}
              autoPlayInterval={autoPlayInterval}
              pauseOnHover={pauseOnHover}
              showArrows={showArrows}
              showDots={showDots}
              loop={loop}
              isPreviewMode={isPreviewMode}
            />
          </div>
        );
        return wrapWithDraggable(content);
      }

      case 'Tabs': {
        const tabs = instance.props?.tabs || [];
        const defaultTab = instance.props?.defaultTab || tabs[0]?.id;
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
            <div className="flex gap-1 border-b border-border mb-4">
              {tabs.map((tab: any) => (
                <button
                  key={tab.id}
                  className={`px-4 py-2 text-sm font-medium ${tab.id === defaultTab ? 'border-b-2 border-primary text-foreground' : 'text-muted-foreground'}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="text-sm text-muted-foreground">
              {tabs.find((t: any) => t.id === defaultTab)?.content || 'Tab content'}
            </div>
            {tabs.length === 0 && (
              <div className="py-4 text-sm text-muted-foreground italic">
                No tabs. Add tabs in the Data tab.
              </div>
            )}
          </div>
        );
        return wrapWithDraggable(content);
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
            }}
            onClick={isPreviewMode ? undefined : () => setSelectedInstanceId(instance.id)}
            onMouseEnter={isPreviewMode ? undefined : () => setHoveredInstanceId(instance.id)}
            onMouseLeave={isPreviewMode ? undefined : () => setHoveredInstanceId(null)}
            onContextMenu={isPreviewMode ? undefined : (e) => handleContextMenu(e, instance)}
          >
            {items.map((item: any, index: number) => {
              const isActive = item.isCurrentPage;
              const isFirst = index === 0;
              
              return (
                <React.Fragment key={item.id || index}>
                  {index > 0 && <span className="flex items-center">{getSeparator()}</span>}
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
                </React.Fragment>
              );
            })}
            {items.length === 0 && (
              <span className="text-muted-foreground italic text-sm">No breadcrumb items</span>
            )}
          </div>
        );
        return wrapWithDraggable(content);
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

      default:
        return null;
    }
  };

  // Get root instance styles for page body
  const rootStyles = rootInstance ? getComputedStyles(rootInstance.styleSourceIds || []) : {};

  // In rulers view, only show the current page
  const pagesToRender = isRulersView ? safePages.filter(p => p === currentPage) : safePages;

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
          // Avoid applying transform when zoom is 100% to prevent "typing backwards".
          transform: isPreviewMode ? 'none' : (zoom === 100 ? 'none' : `scale(${zoom / 100})`),
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
        <HoverOverlay element={hoveredElement} instanceId={hoveredInstanceId || undefined} />
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
    </div>
  );
};
