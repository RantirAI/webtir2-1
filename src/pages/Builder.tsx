import React, { useState } from 'react';
import { Canvas } from '@/builder/components/Canvas';
import { LeftSidebar } from '@/builder/components/LeftSidebar';
import { StylePanel } from '@/builder/components/StylePanel';
import { PageNavigation } from '@/builder/components/PageNavigation';
import { StyleSheetInjector } from '@/builder/components/StyleSheetInjector';
import { ProjectSettingsModal } from '@/builder/components/ProjectSettingsModal';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent } from '@dnd-kit/core';
import { useBuilderStore } from '@/builder/store/useBuilderStore';
import { componentRegistry } from '@/builder/primitives/registry';
import { ComponentInstance } from '@/builder/store/types';
import { generateId } from '@/builder/utils/instance';
import { useStyleStore } from '@/builder/store/useStyleStore';
import * as Icons from 'lucide-react';

const Builder: React.FC = () => {
  const [zoom, setZoom] = useState(100);
  const [currentPage, setCurrentPage] = useState('Page 1');
  const [pages, setPages] = useState(['Page 1']);
  const [currentBreakpoint, setCurrentBreakpoint] = useState('desktop');
  const [isPanMode, setIsPanMode] = useState(false);
  const [pageNames, setPageNames] = useState<Record<string, string>>({ 'Page 1': 'Page 1' });
  const [homePage, setHomePage] = useState('Page 1');
  const [projectName, setProjectName] = useState('My Project');
  const [projectSettingsOpen, setProjectSettingsOpen] = useState(false);
  const [faviconUrl, setFaviconUrl] = useState('/favicon.ico');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [draggedComponent, setDraggedComponent] = useState<{ type: string; label: string; icon: string } | null>(null);
  
  const addInstance = useBuilderStore((state) => state.addInstance);
  const moveInstance = useBuilderStore((state) => state.moveInstance);
  const selectedInstanceId = useBuilderStore((state) => state.selectedInstanceId);

  const handleDragStart = (event: DragStartEvent) => {
    const dragData = event.active.data.current;
    
    if (dragData?.type === 'existing-instance') {
      // Dragging an existing instance
      setDraggedComponent({ 
        type: dragData.instanceType, 
        label: dragData.label, 
        icon: componentRegistry[dragData.instanceType]?.icon || 'Box'
      });
    } else {
      // Dragging a new component from the registry
      const componentType = dragData?.type;
      const componentLabel = dragData?.label;
      const meta = componentRegistry[componentType];
      
      if (meta) {
        setDraggedComponent({ type: componentType, label: componentLabel, icon: meta.icon });
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    setDraggedComponent(null);
    
    if (!over) return;
    
    const dragData = active.data.current;
    
    // Check if we're moving an existing instance
    if (dragData?.type === 'existing-instance') {
      const instanceId = dragData.instanceId;
      
      // Determine target parent
      let targetParentId = 'root';
      let targetIndex: number | undefined;
      
      if (over.id.toString().startsWith('droppable-')) {
        targetParentId = over.data.current?.instanceId || 'root';
      } else if (over.id === 'canvas-drop-zone') {
        const selectedType = useBuilderStore.getState().getSelectedInstance()?.type;
        if (selectedInstanceId && (selectedType === 'Box' || selectedType === 'Container' || selectedType === 'Section')) {
          targetParentId = selectedInstanceId;
        }
      }
      
      // Don't allow dropping an instance into itself
      if (instanceId === targetParentId) return;
      
      // Move the instance
      moveInstance(instanceId, targetParentId, targetIndex ?? 0);
      return;
    }
    
    // Handle new component from registry
    const componentType = dragData?.type;
    if (!componentType) return;
    
    const meta = componentRegistry[componentType];
    if (!meta) return;

    const newId = generateId();
    
    // Create style source with default styles
    let styleSourceId: string | undefined;
    if (meta.defaultStyles && Object.keys(meta.defaultStyles).length > 0) {
      const { createStyleSource, setStyle } = useStyleStore.getState();
      styleSourceId = createStyleSource('local', `${newId}-style`);
      
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
      children: [],
    };

    // Determine parent: use the droppable container if available, otherwise selected instance or root
    let parentId = 'root';
    
    if (over.id.toString().startsWith('droppable-')) {
      // Dropped directly on a container
      parentId = over.data.current?.instanceId || 'root';
    } else if (over.id === 'canvas-drop-zone') {
      // Dropped on canvas - use selected instance if it's a container
      const selectedType = useBuilderStore.getState().getSelectedInstance()?.type;
      if (selectedInstanceId && (selectedType === 'Box' || selectedType === 'Container' || selectedType === 'Section')) {
        parentId = selectedInstanceId;
      }
    }
    
    addInstance(newInstance, parentId);
  };

  const handleAddPage = () => {
    const newPageNum = pages.length + 1;
    const newPage = `Page ${newPageNum}`;
    setPages([...pages, newPage]);
    setPageNames({ ...pageNames, [newPage]: newPage });
    setCurrentPage(newPage);
  };

  const handlePageNameChange = (pageId: string, newName: string) => {
    setPageNames({ ...pageNames, [pageId]: newName });
  };

  const handleDeletePage = (pageId: string) => {
    if (pages.length === 1) return;
    const newPages = pages.filter(p => p !== pageId);
    setPages(newPages);
    const newPageNames = { ...pageNames };
    delete newPageNames[pageId];
    setPageNames(newPageNames);
    if (currentPage === pageId) {
      setCurrentPage(newPages[0]);
    }
    if (homePage === pageId) {
      setHomePage(newPages[0]);
    }
  };

  const handleDuplicatePage = (pageId: string) => {
    const newPageNum = pages.length + 1;
    const newPage = `${pageNames[pageId]} Copy`;
    setPages([...pages, newPage]);
    setPageNames({ ...pageNames, [newPage]: newPage });
    setCurrentPage(newPage);
  };

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="h-screen flex flex-col overflow-hidden bg-white">
        {/* Global stylesheet for builder classes */}
        <StyleSheetInjector />
        {/* Main content - Full screen canvas */}
        <div className="flex-1 relative overflow-hidden">
        {/* Canvas Background */}
        <Canvas 
          zoom={zoom} 
          currentBreakpoint={currentBreakpoint} 
          pages={pages} 
          currentPage={currentPage}
          pageNames={pageNames}
          onPageNameChange={handlePageNameChange}
          isPanMode={isPanMode}
        />

        {/* Floating Left Sidebar */}
        <div className="absolute left-4 top-4 bottom-4 z-10">
          <LeftSidebar
            pages={pages}
            currentPage={currentPage}
            pageNames={pageNames}
            onPageChange={setCurrentPage}
            onPageNameChange={handlePageNameChange}
            onDeletePage={handleDeletePage}
            onDuplicatePage={handleDuplicatePage}
            onSetHomePage={setHomePage}
            homePage={homePage}
          />
        </div>

        {/* Floating Combined Navigation */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20">
          <PageNavigation
            currentPage={currentPage}
            pages={pages}
            onPageChange={setCurrentPage}
            onAddPage={handleAddPage}
            currentBreakpoint={currentBreakpoint}
            onBreakpointChange={setCurrentBreakpoint}
            zoom={zoom}
            setZoom={setZoom}
            isPanMode={isPanMode}
            onPanModeToggle={() => setIsPanMode(!isPanMode)}
            projectName={projectName}
            onProjectNameChange={setProjectName}
            onProjectSettingsOpen={() => setProjectSettingsOpen(true)}
          />
        </div>

        {/* Floating Right Sidebar */}
        <div className="absolute right-4 top-4 bottom-4 z-10">
          <StylePanel
            pages={[]}
            currentPage={currentPage}
            pageNames={{}}
            onPageChange={() => {}}
            onPageNameChange={() => {}}
            onDeletePage={() => {}}
            onDuplicatePage={() => {}}
            onSetHomePage={() => {}}
            homePage={homePage}
          />
        </div>
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
      
      <DragOverlay>
        {draggedComponent && (
          <div 
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 12px',
              backgroundColor: 'white',
              border: '2px solid #3b82f6',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              cursor: 'grabbing',
            }}
          >
            {(() => {
              const IconComponent = Icons[draggedComponent.icon as keyof typeof Icons] as any;
              return IconComponent ? <IconComponent size={16} color="#3b82f6" /> : null;
            })()}
            <span style={{ fontSize: '14px', fontWeight: '500' }}>{draggedComponent.label}</span>
          </div>
        )}
      </DragOverlay>
      </div>
    </DndContext>
  );
};

export default Builder;
