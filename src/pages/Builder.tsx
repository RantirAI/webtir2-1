import React, { useState, useEffect, useMemo } from 'react';
import { Canvas } from '@/builder/components/Canvas';
import { LeftSidebar } from '@/builder/components/LeftSidebar';
import { StylePanel } from '@/builder/components/StylePanel';
import { PageNavigation } from '@/builder/components/PageNavigation';
import { PageFooter } from '@/builder/components/PageFooter';
import { StyleSheetInjector } from '@/builder/components/StyleSheetInjector';
import { ProjectSettingsModal } from '@/builder/components/ProjectSettingsModal';
import { CodeView } from '@/builder/components/CodeView';
import { Toaster } from '@/components/ui/toaster';
import { Button } from '@/components/ui/button';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, DragOverEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useBuilderStore } from '@/builder/store/useBuilderStore';
import { usePageStore } from '@/builder/store/usePageStore';
import { componentRegistry } from '@/builder/primitives/registry';
import { ComponentInstance, ComponentType } from '@/builder/store/types';
import { generateId } from '@/builder/utils/instance';
import { useStyleStore } from '@/builder/store/useStyleStore';
import { useKeyboardShortcuts } from '@/builder/hooks/useKeyboardShortcuts';
import { DropIndicator } from '@/builder/components/DropIndicator';
import { deepestContainerCollision } from '@/builder/utils/collisionDetection';
import * as Icons from 'lucide-react';

const Builder: React.FC = () => {
  const [zoom, setZoom] = useState(80); // Default zoom set to 80%
  const [currentBreakpoint, setCurrentBreakpoint] = useState('desktop');
  const [isPanMode, setIsPanMode] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [homePage, setHomePage] = useState('Page 1');
  const [projectName, setProjectName] = useState('My Project');
  const [projectSettingsOpen, setProjectSettingsOpen] = useState(false);
  const [faviconUrl, setFaviconUrl] = useState('/favicon.ico');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [draggedComponent, setDraggedComponent] = useState<{ type: string; label: string; icon: string } | null>(null);
  const [dragOverEvent, setDragOverEvent] = useState<any>(null);
  const [canvasElement, setCanvasElement] = useState<HTMLElement | null>(null);
  const [isCodeViewOpen, setIsCodeViewOpen] = useState(false);
  const [sidebarsHidden, setSidebarsHidden] = useState(false);
  
  // Page store - use direct selectors to avoid reference issues
  const pages = usePageStore((state) => state.pages);
  const currentPageId = usePageStore((state) => state.currentPageId);
  const addPage = usePageStore((state) => state.addPage);
  const setCurrentPage = usePageStore((state) => state.setCurrentPage);
  const updatePage = usePageStore((state) => state.updatePage);
  const deletePage = usePageStore((state) => state.deletePage);
  
  // Memoize derived values
  const allPages = useMemo(() => Object.values(pages), [pages]);
  const currentPageData = useMemo(() => pages[currentPageId] || null, [pages, currentPageId]);
  const pageIds = useMemo(() => Object.keys(pages), [pages]);
  
  // Builder store - now synced with current page
  const setRootInstance = useBuilderStore((state) => state.setRootInstance);
  const addInstance = useBuilderStore((state) => state.addInstance);
  const moveInstance = useBuilderStore((state) => state.moveInstance);
  const findInstance = useBuilderStore((state) => state.findInstance);
  const rootInstance = useBuilderStore((state) => state.rootInstance);
  const selectedInstanceId = useBuilderStore((state) => state.selectedInstanceId);
  const setSelectedInstanceId = useBuilderStore((state) => state.setSelectedInstanceId);
  
  // Initialize counters from existing classes on mount
  useEffect(() => {
    const { initCountersFromRegistry } = useStyleStore.getState();
    initCountersFromRegistry();
  }, []);
  
  // Initialize first page if none exists
  useEffect(() => {
    if (allPages.length === 0) {
      // Create initial root instance
      const initialRoot: ComponentInstance = {
        id: 'root',
        type: 'Div',
        label: 'Body',
        props: {},
        styleSourceIds: ['root-style'],
        children: [],
      };
      const pageId = addPage('Page 1', initialRoot);
      setCurrentPage(pageId);
    }
  }, []);
  
  // Sync rootInstance when page changes
  useEffect(() => {
    if (currentPageData && currentPageData.rootInstance) {
      setRootInstance(currentPageData.rootInstance);
      setSelectedInstanceId(null); // Clear selection when switching pages
    }
  }, [currentPageId]);
  
  // Save current page's rootInstance whenever it changes
  useEffect(() => {
    if (currentPageData && rootInstance && currentPageId) {
      updatePage(currentPageId, { rootInstance });
    }
  }, [rootInstance, currentPageId, currentPageData, updatePage]);
  
  // Compute page names and current page
  const pageNames: Record<string, string> = useMemo(() => {
    const names: Record<string, string> = {};
    allPages.forEach(page => {
      names[page.id] = page.name;
    });
    return names;
  }, [allPages]);
  const currentPage = currentPageData?.name || 'Page 1';
  
  // Configure sensors with activation constraint to prevent accidental drags
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px movement before drag starts
      },
    })
  );
  
  // Enable keyboard shortcuts
  useKeyboardShortcuts();

  const handleDragStart = (event: DragStartEvent) => {
    const componentType = event.active.data.current?.type;
    const componentLabel = event.active.data.current?.label;
    const meta = componentRegistry[componentType];
    
    if (meta) {
      setDraggedComponent({ type: componentType, label: componentLabel, icon: meta.icon });
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    setDragOverEvent(event);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    setDraggedComponent(null);
    setDragOverEvent(null);
    
    if (!over) return;
    
    const activeId = active.id.toString();
    const overId = over.id.toString();
    
    // Check if we're dragging an existing instance (reordering)
    const existingInstance = findInstance(activeId);
    
    if (existingInstance) {
      // Reordering existing instance
      if (activeId !== overId) {
        // Find parent of the over instance
        const findParent = (tree: ComponentInstance, childId: string): ComponentInstance | null => {
          if (tree.children.some(c => c.id === childId)) return tree;
          for (const child of tree.children) {
            const result = findParent(child, childId);
            if (result) return result;
          }
          return null;
        };
        
        const overInstance = findInstance(overId);
        if (!overInstance) return;
        
        // Determine target parent and position
        let targetParentId = 'root';
        let targetIndex = 0;
        
        // Sections can only be moved to root level
        if (existingInstance.type === 'Section') {
          targetParentId = 'root';
          targetIndex = rootInstance.children.findIndex(c => c.id === overId);
          if (targetIndex === -1) targetIndex = rootInstance.children.length;
        } else {
          // If dropping on a container, add to it
          if (overInstance.type === 'Div' || overInstance.type === 'Container' || overInstance.type === 'Section') {
            targetParentId = overId;
            targetIndex = overInstance.children.length;
          } else {
            // Otherwise, insert before the over element
            const parent = findParent(rootInstance, overId);
            if (parent) {
              targetParentId = parent.id;
              targetIndex = parent.children.findIndex(c => c.id === overId);
            }
          }
        }
        
        moveInstance(activeId, targetParentId, targetIndex);
      }
    } else {
      // Creating new instance from component panel
      const componentType = active.data.current?.type;
      if (!componentType) return;
      
      const meta = componentRegistry[componentType];
      if (!meta) return;

      const newId = generateId();

      // Helper to compute the parentId based on current drop target, mirroring existing logic
      const computeParentId = (): string => {
        let parentId = 'root';
        if (componentType === 'Section') {
          return 'root';
        }
        if (over.id.toString().startsWith('droppable-')) {
          const targetInstanceId = (over as any).data.current?.instanceId || 'root';
          parentId = targetInstanceId;
        } else if (over.id === 'canvas-drop-zone') {
          const selectedType = useBuilderStore.getState().getSelectedInstance()?.type;
          if (selectedInstanceId && (selectedType === 'Div' || selectedType === 'Container' || selectedType === 'Section')) {
            parentId = selectedInstanceId;
          }
        } else {
          const overInstance = findInstance(overId);
          if (overInstance) {
            if (overInstance.type === 'Div' || overInstance.type === 'Container' || overInstance.type === 'Section') {
              parentId = overId;
            } else {
              const findParent = (tree: ComponentInstance, childId: string): ComponentInstance | null => {
                if (tree.children.some(c => c.id === childId)) return tree;
                for (const child of tree.children) {
                  const result = findParent(child, childId);
                  if (result) return result;
                }
                return null;
              };
              const parent = findParent(rootInstance, overId);
              if (parent) parentId = parent.id;
            }
          }
        }
        return parentId;
      };

      // Composite components inserted via drag-and-drop
      // 1) Navigation - use existing Image, Link, Button components
      if (componentType === 'Navigation') {
        const navId = generateId();
        const logoBoxId = generateId();
        const logoId = generateId();
        const linksBoxId = generateId();
        const link1Id = generateId();
        const link2Id = generateId();
        const link3Id = generateId();
        const buttonBoxId = generateId();
        const buttonId = generateId();

        const { createStyleSource, setStyle } = useStyleStore.getState();
        const navStyleId = createStyleSource('local', `nav-${navId}`);
        setStyle(navStyleId, 'display', 'flex');
        setStyle(navStyleId, 'flexDirection', 'row');
        setStyle(navStyleId, 'alignItems', 'center');
        setStyle(navStyleId, 'justifyContent', 'space-between');
        setStyle(navStyleId, 'padding', '16px 32px');
        setStyle(navStyleId, 'backgroundColor', 'hsl(var(--background))');
        setStyle(navStyleId, 'borderBottom', '1px solid hsl(var(--border))');
        setStyle(navStyleId, 'width', '100%');

        const logoBoxStyleId = createStyleSource('local', `logo-box-${logoBoxId}`);
        setStyle(logoBoxStyleId, 'display', 'flex');
        setStyle(logoBoxStyleId, 'alignItems', 'center');
        setStyle(logoBoxStyleId, 'gap', '8px');

        const linksBoxStyleId = createStyleSource('local', `links-box-${linksBoxId}`);
        setStyle(linksBoxStyleId, 'display', 'flex');
        setStyle(linksBoxStyleId, 'gap', '24px');
        setStyle(linksBoxStyleId, 'alignItems', 'center');

        const navInstance: ComponentInstance = {
          id: navId,
          type: 'Box' as ComponentType,
          label: 'Navigation',
          props: {},
          styleSourceIds: [navStyleId],
          children: [
            { id: logoBoxId, type: 'Box' as ComponentType, label: 'Logo Container', props: {}, styleSourceIds: [logoBoxStyleId], children: [
              { id: logoId, type: 'Image' as ComponentType, label: 'Image', props: { src: '/placeholder.svg', alt: 'Image' }, styleSourceIds: [], children: [] },
            ]},
            { id: linksBoxId, type: 'Box' as ComponentType, label: 'Navigation Links', props: {}, styleSourceIds: [linksBoxStyleId], children: [
              { id: link1Id, type: 'Link' as ComponentType, label: 'Link', props: { href: '#', children: 'Link' }, styleSourceIds: [], children: [] },
              { id: link2Id, type: 'Link' as ComponentType, label: 'Link', props: { href: '#', children: 'Link' }, styleSourceIds: [], children: [] },
              { id: link3Id, type: 'Link' as ComponentType, label: 'Link', props: { href: '#', children: 'Link' }, styleSourceIds: [], children: [] },
            ]},
            { id: buttonBoxId, type: 'Box' as ComponentType, label: 'Button Container', props: {}, styleSourceIds: [], children: [
              { id: buttonId, type: 'Button' as ComponentType, label: 'Button', props: { children: 'Button' }, styleSourceIds: [], children: [] },
            ]},
          ],
        };
        addInstance(navInstance, computeParentId());
        return;
      }

      // 2) Dropdown - use existing Button and Link components
      if (componentType === 'Dropdown') {
        const dropdownId = generateId();
        const triggerId = generateId();
        const menuId = generateId();
        const item1Id = generateId();
        const item2Id = generateId();
        const item3Id = generateId();

        const { createStyleSource, setStyle } = useStyleStore.getState();
        const dropdownStyleId = createStyleSource('local', `dropdown-${dropdownId}`);
        setStyle(dropdownStyleId, 'display', 'flex');
        setStyle(dropdownStyleId, 'flexDirection', 'column');
        setStyle(dropdownStyleId, 'position', 'relative');
        setStyle(dropdownStyleId, 'width', 'fit-content');

        const menuStyleId = createStyleSource('local', `dropdown-menu-${menuId}`);
        setStyle(menuStyleId, 'display', 'flex');
        setStyle(menuStyleId, 'flexDirection', 'column');
        setStyle(menuStyleId, 'position', 'absolute');
        setStyle(menuStyleId, 'top', '100%');
        setStyle(menuStyleId, 'left', '0');
        setStyle(menuStyleId, 'marginTop', '4px');
        setStyle(menuStyleId, 'backgroundColor', 'hsl(var(--popover))');
        setStyle(menuStyleId, 'border', '1px solid hsl(var(--border))');
        setStyle(menuStyleId, 'borderRadius', '8px');
        setStyle(menuStyleId, 'padding', '8px');
        setStyle(menuStyleId, 'minWidth', '200px');
        setStyle(menuStyleId, 'boxShadow', '0 10px 15px -3px rgba(0, 0, 0, 0.1)');
        setStyle(menuStyleId, 'zIndex', '50');
        setStyle(menuStyleId, 'gap', '4px');

        const dropdownInstance: ComponentInstance = {
          id: dropdownId,
          type: 'Box' as ComponentType,
          label: 'Dropdown',
          props: {},
          styleSourceIds: [dropdownStyleId],
          children: [
            { id: triggerId, type: 'Button' as ComponentType, label: 'Button', props: { children: 'Button' }, styleSourceIds: [], children: [] },
            { id: menuId, type: 'Box' as ComponentType, label: 'Box', props: {}, styleSourceIds: [menuStyleId], children: [
              { id: item1Id, type: 'Link' as ComponentType, label: 'Link', props: { href: '#', children: 'Link' }, styleSourceIds: [], children: [] },
              { id: item2Id, type: 'Link' as ComponentType, label: 'Link', props: { href: '#', children: 'Link' }, styleSourceIds: [], children: [] },
              { id: item3Id, type: 'Button' as ComponentType, label: 'Button', props: { children: 'Button' }, styleSourceIds: [], children: [] },
            ]},
          ],
        };
        addInstance(dropdownInstance, computeParentId());
        return;
      }

      // 3) Form
      if (componentType === 'Form') {
        const formId = generateId();
        const headingId = generateId();
        const nameBoxId = generateId();
        const nameLabelId = generateId();
        const nameInputId = generateId();
        const emailBoxId = generateId();
        const emailLabelId = generateId();
        const emailInputId = generateId();
        const messageBoxId = generateId();
        const messageLabelId = generateId();
        const messageTextareaId = generateId();
        const categoryBoxId = generateId();
        const categoryLabelId = generateId();
        const categorySelectId = generateId();
        const buttonId = generateId();

        const { createStyleSource, setStyle } = useStyleStore.getState();
        const formStyleId = createStyleSource('local', `form-${formId}`);
        setStyle(formStyleId, 'display', 'flex');
        setStyle(formStyleId, 'flexDirection', 'column');
        setStyle(formStyleId, 'gap', '20px');
        setStyle(formStyleId, 'padding', '24px');
        setStyle(formStyleId, 'backgroundColor', 'hsl(var(--card))');
        setStyle(formStyleId, 'border', '1px solid hsl(var(--border))');
        setStyle(formStyleId, 'borderRadius', '8px');
        setStyle(formStyleId, 'maxWidth', '500px');

        const fieldBoxStyleId = createStyleSource('local', `field-box-${nameBoxId}`);
        setStyle(fieldBoxStyleId, 'display', 'flex');
        setStyle(fieldBoxStyleId, 'flexDirection', 'column');
        setStyle(fieldBoxStyleId, 'gap', '8px');

        const formInstance: ComponentInstance = {
          id: formId,
          type: 'Box' as ComponentType,
          label: 'Form',
          props: {},
          styleSourceIds: [formStyleId],
          children: [
            { id: headingId, type: 'Heading' as ComponentType, label: 'Heading', props: { level: 'h2', children: 'Heading' }, styleSourceIds: [], children: [] },
            { id: nameBoxId, type: 'Box' as ComponentType, label: 'Box', props: {}, styleSourceIds: [fieldBoxStyleId], children: [
              { id: nameLabelId, type: 'Text' as ComponentType, label: 'Text', props: { children: 'Label' }, styleSourceIds: [], children: [] },
              { id: nameInputId, type: 'TextInput' as ComponentType, label: 'TextInput', props: { placeholder: 'Input', type: 'text' }, styleSourceIds: [], children: [] },
            ] },
            { id: emailBoxId, type: 'Box' as ComponentType, label: 'Box', props: {}, styleSourceIds: [fieldBoxStyleId], children: [
              { id: emailLabelId, type: 'Text' as ComponentType, label: 'Text', props: { children: 'Label' }, styleSourceIds: [], children: [] },
              { id: emailInputId, type: 'TextInput' as ComponentType, label: 'TextInput', props: { placeholder: 'Input', type: 'email' }, styleSourceIds: [], children: [] },
            ] },
            { id: messageBoxId, type: 'Box' as ComponentType, label: 'Box', props: {}, styleSourceIds: [fieldBoxStyleId], children: [
              { id: messageLabelId, type: 'Text' as ComponentType, label: 'Text', props: { children: 'Label' }, styleSourceIds: [], children: [] },
              { id: messageTextareaId, type: 'TextArea' as ComponentType, label: 'TextArea', props: { placeholder: 'Input', rows: 4 }, styleSourceIds: [], children: [] },
            ] },
            { id: categoryBoxId, type: 'Box' as ComponentType, label: 'Box', props: {}, styleSourceIds: [fieldBoxStyleId], children: [
              { id: categoryLabelId, type: 'Text' as ComponentType, label: 'Text', props: { children: 'Label' }, styleSourceIds: [], children: [] },
              { id: categorySelectId, type: 'Select' as ComponentType, label: 'Select', props: { placeholder: 'Select', options: [
                { id: '1', label: 'Option 1', value: 'option1' }, { id: '2', label: 'Option 2', value: 'option2' }, { id: '3', label: 'Option 3', value: 'option3' } ] }, styleSourceIds: [], children: [] },
            ] },
            { id: buttonId, type: 'FormButton' as ComponentType, label: 'FormButton', props: { text: 'Button', type: 'submit' }, styleSourceIds: [], children: [] },
          ],
        };
        addInstance(formInstance, computeParentId());
        return;
      }

      // 4) RadioGroup wrapper
      if (componentType === 'RadioGroup') {
        const boxId = generateId();
        const labelId = generateId();
        const radioId = generateId();
        const { createStyleSource, setStyle } = useStyleStore.getState();
        const boxStyleId = createStyleSource('local', `radio-group-${boxId}`);
        setStyle(boxStyleId, 'display', 'flex');
        setStyle(boxStyleId, 'flexDirection', 'column');
        setStyle(boxStyleId, 'gap', '8px');
        const container: ComponentInstance = {
          id: boxId,
          type: 'Box' as ComponentType,
          label: 'Radio Group',
          props: {},
          styleSourceIds: [boxStyleId],
          children: [
            { id: labelId, type: 'Text' as ComponentType, label: 'Group Label', props: { children: 'Choose an option:' }, styleSourceIds: [], children: [] },
            { id: radioId, type: 'RadioGroup' as ComponentType, label: 'Radio Options', props: { name: 'radio-group', options: [
              { id: '1', label: 'Option 1', value: 'option1' }, { id: '2', label: 'Option 2', value: 'option2' }, { id: '3', label: 'Option 3', value: 'option3' } ] }, styleSourceIds: [], children: [] },
          ],
        };
        addInstance(container, computeParentId());
        return;
      }

      // 5) Table composite - use existing Cell components
      if (componentType === 'Table') {
        const containerId = generateId();
        const tableId = generateId();
        const theadId = generateId();
        const headerRowId = generateId();
        const th1Id = generateId();
        const th2Id = generateId();
        const th3Id = generateId();
        const tbodyId = generateId();
        const row1Id = generateId();
        const cell1Id = generateId();
        const cell2Id = generateId();
        const cell3Id = generateId();
        const row2Id = generateId();
        const cell4Id = generateId();
        const cell5Id = generateId();
        const cell6Id = generateId();
        
        const { createStyleSource, setStyle } = useStyleStore.getState();
        const tableStyleId = createStyleSource('local', `table-${tableId}`);
        setStyle(tableStyleId, 'width', '100%');
        setStyle(tableStyleId, 'display', 'flex');
        setStyle(tableStyleId, 'flexDirection', 'column');
        setStyle(tableStyleId, 'border', '1px solid hsl(var(--border))');
        setStyle(tableStyleId, 'borderRadius', '8px');
        setStyle(tableStyleId, 'overflow', 'hidden');
        
        const headerRowStyleId = createStyleSource('local', `header-row-${headerRowId}`);
        setStyle(headerRowStyleId, 'display', 'flex');
        setStyle(headerRowStyleId, 'gap', '0');
        setStyle(headerRowStyleId, 'padding', '0');
        setStyle(headerRowStyleId, 'backgroundColor', 'hsl(var(--muted))');
        setStyle(headerRowStyleId, 'fontWeight', '600');
        setStyle(headerRowStyleId, 'borderBottom', '2px solid hsl(var(--border))');
        
        const rowStyleId = createStyleSource('local', `row-${row1Id}`);
        setStyle(rowStyleId, 'display', 'flex');
        setStyle(rowStyleId, 'gap', '0');
        setStyle(rowStyleId, 'padding', '0');
        setStyle(rowStyleId, 'borderBottom', '1px solid hsl(var(--border))');

        const cellStyleId = createStyleSource('local', `cell-${cell1Id}`);
        setStyle(cellStyleId, 'flex', '1');
        setStyle(cellStyleId, 'padding', '12px');
        setStyle(cellStyleId, 'borderRight', '1px solid hsl(var(--border))');
        
        const containerInstance: ComponentInstance = {
          id: containerId,
          type: 'Container' as ComponentType,
          label: 'Table',
          props: {},
          styleSourceIds: [],
          children: [
            { id: tableId, type: 'Box' as ComponentType, label: 'Table', props: {}, styleSourceIds: [tableStyleId], children: [
              { id: theadId, type: 'Box' as ComponentType, label: 'Table Head', props: {}, styleSourceIds: [], children: [
                { id: headerRowId, type: 'Box' as ComponentType, label: 'Header Row', props: {}, styleSourceIds: [headerRowStyleId], children: [
                  { id: th1Id, type: 'Cell' as ComponentType, label: 'Header Cell 1', props: { children: 'Column 1' }, styleSourceIds: [cellStyleId], children: [] },
                  { id: th2Id, type: 'Cell' as ComponentType, label: 'Header Cell 2', props: { children: 'Column 2' }, styleSourceIds: [cellStyleId], children: [] },
                  { id: th3Id, type: 'Cell' as ComponentType, label: 'Header Cell 3', props: { children: 'Column 3' }, styleSourceIds: [cellStyleId], children: [] },
                ] },
              ] },
              { id: tbodyId, type: 'Box' as ComponentType, label: 'Table Body', props: {}, styleSourceIds: [], children: [
                { id: row1Id, type: 'Box' as ComponentType, label: 'Row 1', props: {}, styleSourceIds: [rowStyleId], children: [
                  { id: cell1Id, type: 'Cell' as ComponentType, label: 'Cell', props: { children: 'Data 1' }, styleSourceIds: [cellStyleId], children: [] },
                  { id: cell2Id, type: 'Cell' as ComponentType, label: 'Cell', props: { children: 'Data 2' }, styleSourceIds: [cellStyleId], children: [] },
                  { id: cell3Id, type: 'Cell' as ComponentType, label: 'Cell', props: { children: 'Data 3' }, styleSourceIds: [cellStyleId], children: [] },
                ] },
                { id: row2Id, type: 'Box' as ComponentType, label: 'Row 2', props: {}, styleSourceIds: [rowStyleId], children: [
                  { id: cell4Id, type: 'Cell' as ComponentType, label: 'Cell', props: { children: 'Data 4' }, styleSourceIds: [cellStyleId], children: [] },
                  { id: cell5Id, type: 'Cell' as ComponentType, label: 'Cell', props: { children: 'Data 5' }, styleSourceIds: [cellStyleId], children: [] },
                  { id: cell6Id, type: 'Cell' as ComponentType, label: 'Cell', props: { children: 'Data 6' }, styleSourceIds: [cellStyleId], children: [] },
                ] },
              ] },
            ] },
          ],
        };
        addInstance(containerInstance, computeParentId());
        return;
      }

      // Create default children for RichText component
      const defaultChildren: ComponentInstance[] = [];
      if (componentType === 'RichText') {
        const headingId = generateId();
        const textId = generateId();
        const blockquoteId = generateId();
        const orderedListId = generateId();
        const unorderedListId = generateId();
        
        defaultChildren.push(
          {
            id: headingId,
            type: 'Heading',
            label: 'Heading',
            props: { level: 'h1', children: 'Heading 1' },
            styleSourceIds: [],
            children: [],
          },
          {
            id: `${headingId}-1`,
            type: 'Heading',
            label: 'Heading',
            props: { level: 'h2', children: 'Heading 2' },
            styleSourceIds: [],
            children: [],
          },
          {
            id: `${headingId}-2`,
            type: 'Heading',
            label: 'Heading',
            props: { level: 'h3', children: 'Heading 3' },
            styleSourceIds: [],
            children: [],
          },
          {
            id: `${headingId}-3`,
            type: 'Heading',
            label: 'Heading',
            props: { level: 'h4', children: 'Heading 4' },
            styleSourceIds: [],
            children: [],
          },
          {
            id: `${headingId}-4`,
            type: 'Heading',
            label: 'Heading',
            props: { level: 'h5', children: 'Heading 5' },
            styleSourceIds: [],
            children: [],
          },
          {
            id: `${headingId}-5`,
            type: 'Heading',
            label: 'Heading',
            props: { level: 'h6', children: 'Heading 6' },
            styleSourceIds: [],
            children: [],
          },
          {
            id: textId,
            type: 'Text',
            label: 'Text',
            props: { children: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.' },
            styleSourceIds: [],
            children: [],
          },
          {
            id: blockquoteId,
            type: 'Blockquote',
            label: 'Blockquote',
            props: { children: 'Block quote' },
            styleSourceIds: [],
            children: [],
          },
          {
            id: orderedListId,
            type: 'OrderedList',
            label: 'Numbered List',
            props: { items: ['Item 1', 'Item 2', 'Item 3'] },
            styleSourceIds: [],
            children: [],
          },
          {
            id: unorderedListId,
            type: 'UnorderedList',
            label: 'Bulleted List',
            props: { items: ['Item A', 'Item B', 'Item C'] },
            styleSourceIds: [],
            children: [],
          }
        );
      }

      // Only create style source with default styles for Button component
      let styleSourceId: string | undefined;
      if (componentType === 'Button' && meta.defaultStyles && Object.keys(meta.defaultStyles).length > 0) {
        const { createStyleSource, setStyle } = useStyleStore.getState();
        // Use "button" as the class name for Button components
        styleSourceId = createStyleSource('local', 'button');
        
        // Apply default styles
        Object.entries(meta.defaultStyles).forEach(([property, value]) => {
          setStyle(styleSourceId!, property, value);
        });
      }

      const newInstance: ComponentInstance = {
        id: newId,
        type: meta.type,
        label: meta.label,
        props: { ...meta.defaultProps },
        styleSourceIds: styleSourceId ? [styleSourceId] : [],
        children: defaultChildren,
      };

      // Determine parent - Sections always go to root
      let parentId = 'root';
      
      // Force sections to root level
      if (componentType === 'Section') {
        parentId = 'root';
      } else {
        if (over.id.toString().startsWith('droppable-')) {
          const targetInstanceId = over.data.current?.instanceId || 'root';
          parentId = targetInstanceId;
        } else if (over.id === 'canvas-drop-zone') {
          const selectedType = useBuilderStore.getState().getSelectedInstance()?.type;
          if (selectedInstanceId && (selectedType === 'Div' || selectedType === 'Container' || selectedType === 'Section')) {
            parentId = selectedInstanceId;
          }
        } else {
          // Dropping on an existing instance
          const overInstance = findInstance(overId);
          if (overInstance) {
            if (overInstance.type === 'Div' || overInstance.type === 'Container' || overInstance.type === 'Section') {
              parentId = overId;
            } else {
              // Find parent and insert after the over element
              const findParent = (tree: ComponentInstance, childId: string): ComponentInstance | null => {
                if (tree.children.some(c => c.id === childId)) return tree;
                for (const child of tree.children) {
                  const result = findParent(child, childId);
                  if (result) return result;
                }
                return null;
              };
              const parent = findParent(rootInstance, overId);
              if (parent) {
                parentId = parent.id;
              }
            }
          }
        }
      }
      
      addInstance(newInstance, parentId);
    }
  };

  const handleAddPage = () => {
    const newPageName = `Page ${allPages.length + 1}`;
    // Create a new empty root instance for the new page
    const newRootInstance: ComponentInstance = {
      id: 'root',
      type: 'Div',
      label: 'Body',
      props: {},
      styleSourceIds: ['root-style'],
      children: [],
    };
    const pageId = addPage(newPageName, newRootInstance);
    setCurrentPage(pageId);
  };

  const handlePageNameChange = (pageId: string, newName: string) => {
    updatePage(pageId, { name: newName });
  };

  const handleDeletePage = (pageId: string) => {
    if (allPages.length === 1) return;
    deletePage(pageId);
    if (currentPageId === pageId) {
      const remainingPages = allPages.filter(p => p.id !== pageId);
      if (remainingPages.length > 0) {
        setCurrentPage(remainingPages[0].id);
      }
    }
    if (homePage === pageId) {
      const remainingPages = allPages.filter(p => p.id !== pageId);
      if (remainingPages.length > 0) {
        setHomePage(remainingPages[0].id);
      }
    }
  };

  const handleDuplicatePage = (pageId: string) => {
    const page = allPages.find(p => p.id === pageId);
    if (!page) return;
    const newPageName = `${page.name} Copy`;
    // Deep copy the root instance
    const duplicatedRootInstance = JSON.parse(JSON.stringify(page.rootInstance));
    const newPageId = addPage(newPageName, duplicatedRootInstance);
    setCurrentPage(newPageId);
  };

  return (
    <DndContext 
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      collisionDetection={deepestContainerCollision}
    >
      <div className="h-screen flex flex-col overflow-hidden bg-white">
        {/* Global stylesheet for builder classes */}
        <StyleSheetInjector />
        {/* Main content - Full screen canvas */}
        <div className={`flex-1 relative ${isPreviewMode ? 'overflow-auto' : 'overflow-hidden'}`}>
        {/* Canvas Background */}
        <Canvas 
          zoom={zoom}
          onZoomChange={setZoom}
          currentBreakpoint={currentBreakpoint} 
          pages={pageIds} 
          currentPage={currentPageId}
          pageNames={pageNames}
          onPageNameChange={handlePageNameChange}
          isPanMode={isPanMode}
          isPreviewMode={isPreviewMode}
          onCanvasRef={setCanvasElement}
          onPageChange={(pageId) => setCurrentPage(pageId)}
          allPages={allPages}
        />

        {/* Drop Indicator Overlay */}
        <DropIndicator
          dragOverEvent={dragOverEvent}
          canvasElement={canvasElement}
          zoom={zoom}
          panOffset={{ x: 0, y: 0 }}
          findInstance={findInstance}
        />

        {/* Preview Mode Exit Button */}
        {isPreviewMode && (
          <button
            onClick={() => setIsPreviewMode(false)}
            className="fixed top-0 left-0 z-[100] w-8 h-8 flex items-center justify-center bg-background/95 hover:bg-accent border border-border shadow-lg transition-colors rounded-br-lg"
            title="Exit Preview"
          >
            <Icons.EyeOff className="w-4 h-4 text-foreground" />
          </button>
        )}

        {/* Floating Left Sidebar */}
        {!isPreviewMode && !isCodeViewOpen && !sidebarsHidden && (
          <div className="absolute left-4 top-4 bottom-4 z-10 transition-all duration-300 animate-slide-in-left">
            <LeftSidebar />
          </div>
        )}

        {/* Floating Combined Navigation */}
        {!isPreviewMode && (
          <div 
            className={`absolute top-4 left-1/2 -translate-x-1/2 z-[60] transition-all duration-300 ${
              isCodeViewOpen ? 'scale-[0.85] -translate-y-2' : 'scale-100'
            }`}
          >
            <PageNavigation
              currentPage={currentPageId}
              pages={pageIds}
              onPageChange={(pageId) => setCurrentPage(pageId)}
              onAddPage={handleAddPage}
              currentBreakpoint={currentBreakpoint}
              onBreakpointChange={setCurrentBreakpoint}
              zoom={zoom}
              setZoom={setZoom}
              isPanMode={isPanMode}
              onPanModeToggle={() => setIsPanMode(!isPanMode)}
              onPreviewToggle={() => setIsPreviewMode(!isPreviewMode)}
              projectName={projectName}
              onProjectNameChange={setProjectName}
              onProjectSettingsOpen={() => setProjectSettingsOpen(true)}
              isCodeViewOpen={isCodeViewOpen}
              onCodeViewToggle={() => setIsCodeViewOpen(!isCodeViewOpen)}
              sidebarsHidden={sidebarsHidden}
              onToggleSidebars={() => setSidebarsHidden(!sidebarsHidden)}
            />
          </div>
        )}

        {/* Floating Right Sidebar */}
        {!isPreviewMode && !isCodeViewOpen && !sidebarsHidden && (
          <div className="absolute right-4 top-4 bottom-4 z-10 transition-all duration-300 animate-slide-in-right">
            <StylePanel
              pages={pageIds}
              currentPage={currentPageId}
              pageNames={pageNames}
              onPageChange={(pageId) => setCurrentPage(pageId)}
              onPageNameChange={handlePageNameChange}
              onDeletePage={handleDeletePage}
              onDuplicatePage={handleDuplicatePage}
              onSetHomePage={setHomePage}
              homePage={homePage}
            />
          </div>
        )}

        {/* Code View Sidebar */}
        {!isPreviewMode && isCodeViewOpen && (
          <CodeView 
            onClose={() => setIsCodeViewOpen(false)}
            pages={allPages.map(p => p.name)}
            pageNames={pageNames}
          />
        )}
      </div>

      <ProjectSettingsModal
        open={projectSettingsOpen}
        onOpenChange={setProjectSettingsOpen}
        projectName={projectName}
        onProjectNameChange={setProjectName}
        faviconUrl={faviconUrl}
        onFaviconChange={setFaviconUrl}
        metaTitle={metaTitle}
        onMetaTitleChange={setMetaTitle}
        metaDescription={metaDescription}
        onMetaDescriptionChange={setMetaDescription}
      />
      
      <DragOverlay dropAnimation={null}>
        {draggedComponent && (
          <div 
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 16px',
              backgroundColor: 'white',
              border: '2px solid #3b82f6',
              borderRadius: '8px',
              boxShadow: '0 8px 24px rgba(59, 130, 246, 0.3), 0 4px 12px rgba(0, 0, 0, 0.2)',
              cursor: 'grabbing',
              opacity: 0.95,
              transform: 'rotate(-2deg)',
            }}
          >
            {(() => {
              const IconComponent = Icons[draggedComponent.icon as keyof typeof Icons] as any;
              return IconComponent ? <IconComponent size={18} color="#3b82f6" strokeWidth={2.5} /> : null;
            })()}
            <span style={{ 
              fontSize: '14px', 
              fontWeight: '600',
              color: '#1e293b',
            }}>
              {draggedComponent.label}
            </span>
          </div>
        )}
      </DragOverlay>
      <Toaster />
      <PageFooter />
      </div>
    </DndContext>
  );
};

export default Builder;
