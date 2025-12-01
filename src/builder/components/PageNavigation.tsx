import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, ChevronDown, Monitor, Tablet, Smartphone, Download, Save, Eye, ZoomIn, ZoomOut, Sun, Moon, Hand, FileCode, FileText, Palette, Zap, X, PanelLeftClose, Ruler } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { useTheme } from 'next-themes';
import { useBuilderStore } from '@/builder/store/useBuilderStore';
import { exportReactComponent, exportHTML, exportStylesheet, downloadFile, exportProject } from '@/builder/utils/export';
import { exportRantirProject } from '@/builder/utils/rantirExport';
import { useToast } from '@/hooks/use-toast';
import { RantirExportModal } from './RantirExportModal';

interface PageNavigationProps {
  currentPage: string;
  pages: string[];
  onPageChange: (page: string) => void;
  onAddPage: () => void;
  currentBreakpoint: string;
  onBreakpointChange: (breakpoint: string) => void;
  zoom: number;
  setZoom: (zoom: number) => void;
  isPanMode: boolean;
  onPanModeToggle: () => void;
  onPreviewToggle: () => void;
  projectName: string;
  onProjectNameChange: (name: string) => void;
  onProjectSettingsOpen: () => void;
  isCodeViewOpen?: boolean;
  onCodeViewToggle?: () => void;
  sidebarsHidden?: boolean;
  onToggleSidebars?: () => void;
  isRulersView?: boolean;
  onRulersViewToggle?: () => void;
}

export const breakpoints = [
  { id: 'desktop', label: 'Desktop', icon: Monitor, width: 960 },
  { id: 'tablet', label: 'Tablet', icon: Tablet, width: 768 },
  { id: 'mobile-landscape', label: 'Mobile L', icon: Smartphone, width: 640 },
  { id: 'mobile', label: 'Mobile', icon: Smartphone, width: 375 },
];

export const PageNavigation: React.FC<PageNavigationProps> = ({
  currentPage,
  pages,
  onPageChange,
  onAddPage,
  currentBreakpoint,
  onBreakpointChange,
  zoom,
  setZoom,
  isPanMode,
  onPanModeToggle,
  onPreviewToggle,
  projectName,
  onProjectNameChange,
  onProjectSettingsOpen,
  isCodeViewOpen = false,
  onCodeViewToggle,
  sidebarsHidden = false,
  onToggleSidebars,
  isRulersView = false,
  onRulersViewToggle,
}) => {
  // Ensure pages is always an array
  const safePages = Array.isArray(pages) ? pages : [];
  
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const { rootInstance } = useBuilderStore();
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(projectName);
  const [showRantirModal, setShowRantirModal] = useState(false);

  const handleExportReact = () => {
    if (!rootInstance) return;
    const code = exportReactComponent(rootInstance, 'App');
    downloadFile('App.jsx', code);
    toast({
      title: 'React Component Exported',
      description: 'Downloaded App.jsx successfully',
    });
  };

  const handleExportHTML = () => {
    if (!rootInstance) return;
    const code = exportHTML(rootInstance, projectName);
    downloadFile('index.html', code);
    toast({
      title: 'HTML Exported',
      description: 'Downloaded index.html successfully',
    });
  };

  const handleExportCSS = () => {
    const css = exportStylesheet();
    downloadFile('styles.css', css);
    toast({
      title: 'CSS Exported',
      description: 'Downloaded styles.css successfully',
    });
  };

  const handleExportAll = async () => {
    if (!rootInstance) return;
    
    await exportProject(rootInstance, projectName || 'my-project');
    
    toast({
      title: 'Project Exported',
      description: 'Downloaded project.zip with all files successfully',
    });
  };

  const handleExportRantir = async () => {
    if (!rootInstance) return;
    setShowRantirModal(false);
    
    await exportRantirProject(rootInstance, projectName || 'my-project');
    
    toast({
      title: 'Rantir Framework Exported',
      description: 'Downloaded Rantir/Astro project successfully',
    });
  };

  const handleZoomIn = () => {
    setZoom(Math.min(zoom + 10, 200));
  };

  const handleZoomOut = () => {
    setZoom(Math.max(zoom - 10, 10));
  };

  const truncatedName = projectName.length > 16 ? projectName.slice(0, 16) + '...' : projectName;

  return (
    <div 
      className="backdrop-blur-md border border-border rounded-lg shadow-lg px-3 py-2 flex items-center gap-2 bg-white/70 dark:bg-zinc-900/70"
    >
      {/* App Icon and Project Name */}
      <div className="flex items-center gap-2">
        <button 
          onClick={onProjectSettingsOpen}
          className="w-8 h-8 bg-primary rounded flex items-center justify-center text-primary-foreground font-bold text-xs hover:opacity-80"
        >
          {projectName.charAt(0).toUpperCase()}
        </button>
        {isEditingName ? (
          <input
            type="text"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            onBlur={() => {
              onProjectNameChange(nameInput);
              setIsEditingName(false);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                onProjectNameChange(nameInput);
                setIsEditingName(false);
              }
            }}
            autoFocus
            className="text-sm font-medium px-2 py-1 border border-border rounded w-32"
          />
        ) : (
          <span
            onDoubleClick={() => {
              setNameInput(projectName);
              setIsEditingName(true);
            }}
            className="text-sm font-medium cursor-pointer hover:text-primary whitespace-nowrap"
            title={projectName}
          >
            {truncatedName}
          </span>
        )}
      </div>

      {!isCodeViewOpen && (
        <>
          <Separator orientation="vertical" className="h-6" />

          {/* Zoom Controls */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2"
              onClick={handleZoomOut}
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            <span className="text-xs font-medium min-w-[2.5rem] text-center">{zoom}%</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2"
              onClick={handleZoomIn}
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
          </div>

          <Separator orientation="vertical" className="h-6" />
        </>
      )}

      {/* Pan Tool */}
      <Button
        variant="ghost"
        size="sm"
        className={`h-8 px-2 ${isPanMode ? 'bg-[#F5F5F5] dark:bg-zinc-800' : ''}`}
        onClick={onPanModeToggle}
      >
        <Hand className="w-4 h-4" />
      </Button>

      {/* Theme Toggle */}
      <Button
        variant="ghost"
        size="sm"
        className="h-8 px-2"
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      >
        {theme === 'dark' ? (
          <Sun className="w-4 h-4" />
        ) : (
          <Moon className="w-4 h-4" />
        )}
      </Button>

      {/* Code View Toggle */}
      <Button
        variant="ghost"
        size="sm"
        className={`h-8 px-2 ${isCodeViewOpen ? 'bg-[#F5F5F5] dark:bg-zinc-800' : ''}`}
        onClick={onCodeViewToggle}
        title={isCodeViewOpen ? "Close Code View" : "Open Code View"}
      >
        {isCodeViewOpen ? <X className="w-4 h-4" /> : <FileCode className="w-4 h-4" />}
      </Button>

      {/* Rulers View Toggle */}
      {!isCodeViewOpen && onRulersViewToggle && (
        <Button
          variant="ghost"
          size="sm"
          className={`h-8 px-2 ${isRulersView ? 'bg-[#F5F5F5] dark:bg-zinc-800' : ''}`}
          onClick={onRulersViewToggle}
          title={isRulersView ? "Exit Rulers View" : "Rulers View"}
        >
          <Ruler className="w-4 h-4" />
        </Button>
      )}

      {/* Sidebar Toggle */}
      {!isCodeViewOpen && onToggleSidebars && (
        <Button
          variant="ghost"
          size="sm"
          className={`h-8 px-2 ${sidebarsHidden ? 'bg-[#F5F5F5] dark:bg-zinc-800' : ''}`}
          onClick={onToggleSidebars}
          title={sidebarsHidden ? "Show Sidebars" : "Hide Sidebars"}
        >
          <PanelLeftClose className={`w-4 h-4 transition-transform ${sidebarsHidden ? 'rotate-180' : ''}`} />
        </Button>
      )}

      <Separator orientation="vertical" className="h-6" />

      {/* Pages Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 px-3 gap-2">
            {currentPage}
            <ChevronDown className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          {safePages.map((page) => (
            <DropdownMenuItem key={page} onClick={() => onPageChange(page)}>
              {page}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Add Page Button */}
      <Button variant="ghost" size="sm" className="h-8 px-2" onClick={onAddPage}>
        <Plus className="w-4 h-4" />
      </Button>

      {!isCodeViewOpen && (
        <>
          <Separator orientation="vertical" className="h-6" />

          {/* Breakpoint Selector */}
          <div className="flex gap-1">
            {breakpoints.map((bp) => {
              const Icon = bp.icon;
              return (
                <Button
                  key={bp.id}
                  variant="ghost"
                  size="sm"
                  className={`h-8 px-2 ${
                    currentBreakpoint === bp.id ? 'bg-[#F5F5F5] dark:bg-zinc-800' : ''
                  }`}
                  onClick={() => onBreakpointChange(bp.id)}
                >
                  <Icon className="w-3.5 h-3.5" />
                </Button>
              );
            })}
          </div>

          <Separator orientation="vertical" className="h-6" />
        </>
      )}

      {/* Action Buttons */}
      <Button variant="ghost" size="sm" className="h-8 px-2" onClick={onPreviewToggle}>
        <Eye className="w-4 h-4" />
      </Button>

      <Button variant="ghost" size="sm" className="h-8 px-2">
        <Save className="w-4 h-4" />
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="default" size="sm" className="h-8 px-3 gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={handleExportReact} className="gap-2">
            <FileCode className="w-4 h-4" />
            Export React (.jsx)
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleExportHTML} className="gap-2">
            <FileText className="w-4 h-4" />
            Export HTML
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleExportCSS} className="gap-2">
            <Palette className="w-4 h-4" />
            Export CSS
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleExportAll} className="gap-2 font-semibold">
            <Download className="w-4 h-4" />
            Export All Files (Legacy)
          </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowRantirModal(true)} className="gap-2 font-semibold">
                <Zap className="w-4 h-4" />
                Export Rantir Framework
              </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <RantirExportModal
        open={showRantirModal}
        onOpenChange={setShowRantirModal}
        onExport={handleExportRantir}
        projectName={projectName}
      />
    </div>
  );
};
