import React, { useState } from 'react';
import { Canvas } from '@/builder/components/Canvas';
import { LeftSidebar } from '@/builder/components/LeftSidebar';
import { StylePanel } from '@/builder/components/StylePanel';
import { PageNavigation } from '@/builder/components/PageNavigation';
import { StyleSheetInjector } from '@/builder/components/StyleSheetInjector';
import { ProjectSettingsModal } from '@/builder/components/ProjectSettingsModal';

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
    </div>
  );
};

export default Builder;
