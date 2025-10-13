import React, { useState } from 'react';
import { Canvas } from '@/builder/components/Canvas';
import { LeftSidebar } from '@/builder/components/LeftSidebar';
import { StylePanel } from '@/builder/components/StylePanel';
import { PageNavigation } from '@/builder/components/PageNavigation';
import { StyleSheetInjector } from '@/builder/components/StyleSheetInjector';
import { ProjectSettingsModal } from '@/builder/components/ProjectSettingsModal';
import { Toaster } from '@/components/ui/toaster';
import { Button } from '@/components/ui/button';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, DragOverEvent, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useBuilderStore } from '@/builder/store/useBuilderStore';
import { componentRegistry } from '@/builder/primitives/registry';
import { ComponentInstance } from '@/builder/store/types';
import { generateId } from '@/builder/utils/instance';
import { useStyleStore } from '@/builder/store/useStyleStore';
import { useKeyboardShortcuts } from '@/builder/hooks/useKeyboardShortcuts';
import { DropIndicator } from '@/builder/components/DropIndicator';
import * as Icons from 'lucide-react';

const Builder: React.FC = () => {
  const [zoom, setZoom] = useState(100);
  const [currentPage, setCurrentPage] = useState('Page 1');
  const [pages, setPages] = useState(['Page 1']);
  const [currentBreakpoint, setCurrentBreakpoint] = useState('desktop');
  const [isPanMode, setIsPanMode] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [pageNames, setPageNames] = useState<Record<string, string>>({ 'Page 1': 'Page 1' });
  const [homePage, setHomePage] = useState('Page 1');
  const [projectName, setProjectName] = useState('My Project');
  const [projectSettingsOpen, setProjectSettingsOpen] = useState(false);
  const [faviconUrl, setFaviconUrl] = useState('/favicon.ico');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [draggedComponent, setDraggedComponent] = useState<{ type: string; label: string; icon: string } | null>(null);
  const [dragOverEvent, setDragOverEvent] = useState<any>(null);
  const [canvasElement, setCanvasElement] = useState<HTMLElement | null>(null);
  
  const addInstance = useBuilderStore((state) => state.addInstance);
  const moveInstance = useBuilderStore((state) => state.moveInstance);
  const findInstance = useBuilderStore((state) => state.findInstance);
  const rootInstance = useBuilderStore((state) => state.rootInstance);
  const selectedInstanceId = useBuilderStore((state) => state.selectedInstanceId);
  
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
          if (overInstance.type === 'Box' || overInstance.type === 'Container' || overInstance.type === 'Section') {
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

      const newInstance: ComponentInstance = {
        id: newId,
        type: meta.type,
        label: meta.label,
        props: { ...meta.defaultProps },
        styleSourceIds: [],
        children: [],
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
          if (selectedInstanceId && (selectedType === 'Box' || selectedType === 'Container' || selectedType === 'Section')) {
            parentId = selectedInstanceId;
          }
        } else {
          // Dropping on an existing instance
          const overInstance = findInstance(overId);
          if (overInstance) {
            if (overInstance.type === 'Box' || overInstance.type === 'Container' || overInstance.type === 'Section') {
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
    <DndContext 
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      collisionDetection={closestCenter}
    >
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
          isPreviewMode={isPreviewMode}
          onCanvasRef={setCanvasElement}
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
          <div className="absolute left-4 top-4 z-20">
            <Button
              variant="default"
              size="sm"
              className="h-10 px-3 gap-2 shadow-lg"
              onClick={() => setIsPreviewMode(false)}
            >
              <Icons.Eye className="w-4 h-4" />
              Exit Preview
            </Button>
          </div>
        )}

        {/* Floating Left Sidebar */}
        {!isPreviewMode && (
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
        )}

        {/* Floating Combined Navigation */}
        {!isPreviewMode && (
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
              onPreviewToggle={() => setIsPreviewMode(!isPreviewMode)}
              projectName={projectName}
              onProjectNameChange={setProjectName}
              onProjectSettingsOpen={() => setProjectSettingsOpen(true)}
            />
          </div>
        )}

        {/* Floating Right Sidebar */}
        {!isPreviewMode && (
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
      </div>
    </DndContext>
  );
};

export default Builder;
