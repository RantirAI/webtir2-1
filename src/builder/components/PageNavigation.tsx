import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, ChevronDown, Monitor, Tablet, Smartphone, Download, Eye, ZoomIn, ZoomOut, Sun, Moon, Hand, FileCode, FileText, Palette, Zap, X, PanelLeftClose, Ruler, MessageSquare, Code2, User, Rocket, Settings, ExternalLink, Check, Copy, Lock, Unlock, EyeOff } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { useTheme } from 'next-themes';
import { useBuilderStore } from '@/builder/store/useBuilderStore';
import { exportReactComponent, exportHTML, exportStylesheet, downloadFile, exportProject } from '@/builder/utils/export';
import { exportRantirProject } from '@/builder/utils/rantirExport';
import { useToast } from '@/hooks/use-toast';
import { RantirExportModal } from './RantirExportModal';
import { useRoleStore, UserRole } from '@/builder/store/useRoleStore';
import { useCommentStore } from '@/builder/store/useCommentStore';
import { useProjectSettingsStore } from '@/builder/store/useProjectSettingsStore';
import { Dialog } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { usePageStore } from '@/builder/store/usePageStore';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

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

// Page settings component for controlling global component visibility per page
const PagesDropdownWithSettings: React.FC<{
  currentPage: string;
  pages: string[];
  onPageChange: (page: string) => void;
  onAddPage: () => void;
}> = ({ currentPage, pages, onPageChange, onAddPage }) => {
  const { 
    getGlobalComponents, 
    getPageGlobalOverrides, 
    setPageGlobalOverride, 
    getAllPages 
  } = usePageStore();
  
  const globalComponents = getGlobalComponents();
  const hasGlobalHeader = !!globalComponents.header;
  const hasGlobalFooter = !!globalComponents.footer;
  
  // Get page IDs from store
  const allPages = getAllPages();
  
  const getPageIdByName = (pageName: string) => {
    const page = allPages.find(p => p.name === pageName);
    return page?.id || '';
  };
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-7 px-2 gap-1 text-xs">
          {currentPage}
          <ChevronDown className="w-3 h-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" side="top" className="z-[9999] w-56 bg-popover p-1">
        {pages.map((page) => {
          const pageId = getPageIdByName(page);
          const overrides = getPageGlobalOverrides(pageId);
          const hasOverrides = overrides.hideHeader || overrides.hideFooter;
          
          return (
            <div key={page} className="flex items-center group">
              <DropdownMenuItem 
                onClick={() => onPageChange(page)} 
                className="flex-1 text-[11px] py-1 px-2"
              >
                <span className="flex items-center gap-1.5">
                  {page}
                  {hasOverrides && (
                    <span title="Has hidden global components">
                      <EyeOff className="w-2.5 h-2.5 text-muted-foreground" />
                    </span>
                  )}
                </span>
              </DropdownMenuItem>
              
              {/* Page settings popover - only show if there are global components */}
              {(hasGlobalHeader || hasGlobalFooter) && (
                <Popover>
                  <PopoverTrigger asChild>
                    <button 
                      className="p-1 mr-1 rounded opacity-0 group-hover:opacity-100 hover:bg-muted transition-opacity"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Settings className="w-3 h-3 text-muted-foreground" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent 
                    side="right" 
                    align="start" 
                    className="w-48 p-2 z-[10000]"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="space-y-3">
                      <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                        Page Settings: {page}
                      </div>
                      
                      {hasGlobalHeader && (
                        <div className="flex items-center justify-between">
                          <Label className="text-[11px] cursor-pointer">Show Global Header</Label>
                          <Switch
                            checked={!overrides.hideHeader}
                            onCheckedChange={(checked) => setPageGlobalOverride(pageId, 'header', !checked)}
                            className="scale-75"
                          />
                        </div>
                      )}
                      
                      {hasGlobalFooter && (
                        <div className="flex items-center justify-between">
                          <Label className="text-[11px] cursor-pointer">Show Global Footer</Label>
                          <Switch
                            checked={!overrides.hideFooter}
                            onCheckedChange={(checked) => setPageGlobalOverride(pageId, 'footer', !checked)}
                            className="scale-75"
                          />
                        </div>
                      )}
                      
                      <p className="text-[9px] text-muted-foreground leading-tight">
                        Disable to hide global components on this page only.
                      </p>
                    </div>
                  </PopoverContent>
                </Popover>
              )}
            </div>
          );
        })}
        <DropdownMenuSeparator className="my-1" />
        <DropdownMenuItem onClick={onAddPage} className="gap-1.5 text-[11px] py-1 px-2">
          <Plus className="w-3 h-3" />
          Add Page
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

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
  const { currentRole, setRole, isClient } = useRoleStore();
  const { commentsVisible, toggleCommentsVisibility, isAddingComment, setIsAddingComment } = useCommentStore();
  const { faviconUrl } = useProjectSettingsStore();
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(projectName);
  const [showRantirModal, setShowRantirModal] = useState(false);
  const [showPublishDialog, setShowPublishDialog] = useState(false);
  const [publishTab, setPublishTab] = useState<'publish' | 'export'>('publish');
  
  // Publishing state
  const [stagingDomain, setStagingDomain] = useState(() => {
    const slug = projectName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'my-project';
    return `${slug}.webtir.com`;
  });
  const [isPasswordProtected, setIsPasswordProtected] = useState(false);
  const [stagingUsername, setStagingUsername] = useState('admin');
  const [stagingPassword, setStagingPassword] = useState('');
  const [isPublished, setIsPublished] = useState(false);
  const [customDomain, setCustomDomain] = useState('');
  
  const handlePublish = () => {
    setIsPublished(true);
    toast({
      title: 'Published!',
      description: `Your site is live at ${stagingDomain}`,
    });
  };
  
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
      className={`backdrop-blur-md border border-border flex items-center gap-1 ${
        isRulersView 
          ? 'rounded-none shadow-none bg-background w-full px-2 py-1.5' 
          : 'rounded-lg shadow-lg bg-white/70 dark:bg-zinc-900/70 px-2 py-1.5'
      }`}
    >
      {/* App Icon and Project Name */}
      <div className="flex items-center gap-1.5">
        <button 
          onClick={onProjectSettingsOpen}
          className={`w-7 h-7 rounded flex items-center justify-center font-bold text-xs hover:opacity-80 overflow-hidden ${
            faviconUrl ? 'bg-white' : 'bg-primary text-primary-foreground'
          }`}
        >
          {faviconUrl ? (
            <img src={faviconUrl} alt="Project icon" className="w-5 h-5 object-contain" />
          ) : (
            projectName.charAt(0).toUpperCase()
          )}
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
        
        {/* Role Badge Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium cursor-pointer transition-colors ${
                currentRole === 'developer' 
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90 dark:bg-white dark:text-black dark:hover:bg-white/90' 
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80 dark:bg-zinc-700 dark:text-white'
              }`}
            >
              {currentRole === 'developer' ? (
                <>
                  <Code2 className="w-2.5 h-2.5" />
                  Dev
                </>
              ) : (
                <>
                  <User className="w-2.5 h-2.5" />
                  Client
                </>
              )}
              <ChevronDown className="w-2 h-2" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" side="top" className="z-[9999] bg-background border border-border shadow-md min-w-[100px] p-1 rounded-md">
            <DropdownMenuItem 
              onClick={() => setRole('developer')} 
              className="gap-1.5 text-[11px] py-1 px-2 cursor-pointer"
            >
              <Code2 className="w-3 h-3" />
              Developer
              {currentRole === 'developer' && <span className="ml-auto text-primary text-[10px]">✓</span>}
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => setRole('client')} 
              className="gap-1.5 text-[11px] py-1 px-2 cursor-pointer"
            >
              <User className="w-3 h-3" />
              Client
              {currentRole === 'client' && <span className="ml-auto text-primary text-[10px]">✓</span>}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Separator orientation="vertical" className="h-5" />

      {/* Comments Toggle - Single Icon */}
      <Button
        variant="ghost"
        size="sm"
        className={`h-7 w-7 p-0 ${isAddingComment ? 'bg-primary text-primary-foreground' : commentsVisible ? 'bg-muted' : ''}`}
        onClick={() => {
          if (!commentsVisible) {
            toggleCommentsVisibility();
          }
          setIsAddingComment(!isAddingComment);
        }}
        title={isAddingComment ? "Cancel Adding Comment" : "Add Comment"}
      >
        <MessageSquare className="w-3.5 h-3.5" />
      </Button>

      {!isCodeViewOpen && (
        <>
          <Separator orientation="vertical" className="h-5" />

          {/* Zoom Controls */}
          <div className="flex items-center gap-0.5">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={handleZoomOut}
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </Button>
            <span className="text-xs font-medium min-w-[2rem] text-center">{zoom}%</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={handleZoomIn}
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </Button>
          </div>

          <Separator orientation="vertical" className="h-5" />
        </>
      )}

      {/* Pan Tool */}
      <Button
        variant="ghost"
        size="sm"
        className={`h-7 w-7 p-0 ${isPanMode ? 'bg-muted' : ''}`}
        onClick={onPanModeToggle}
      >
        <Hand className="w-3.5 h-3.5" />
      </Button>

      {/* Theme Toggle */}
      <Button
        variant="ghost"
        size="sm"
        className="h-7 w-7 p-0"
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      >
        {theme === 'dark' ? (
          <Sun className="w-3.5 h-3.5" />
        ) : (
          <Moon className="w-3.5 h-3.5" />
        )}
      </Button>

      {/* Code View Toggle - hidden for clients */}
      {!isClient() && (
        <Button
          variant="ghost"
          size="sm"
          className={`h-7 w-7 p-0 ${isCodeViewOpen ? 'bg-muted' : ''}`}
          onClick={onCodeViewToggle}
          title={isCodeViewOpen ? "Close Code View" : "Open Code View"}
        >
          {isCodeViewOpen ? <X className="w-3.5 h-3.5" /> : <FileCode className="w-3.5 h-3.5" />}
        </Button>
      )}

      {/* Rulers View Toggle */}
      {!isCodeViewOpen && onRulersViewToggle && (
        <Button
          variant="ghost"
          size="sm"
          className={`h-7 w-7 p-0 ${isRulersView ? 'bg-muted' : ''}`}
          onClick={onRulersViewToggle}
          title={isRulersView ? "Exit Rulers View" : "Rulers View"}
        >
          <Ruler className="w-3.5 h-3.5" />
        </Button>
      )}

      {/* Sidebar Toggle */}
      {!isCodeViewOpen && onToggleSidebars && (
        <Button
          variant="ghost"
          size="sm"
          className={`h-7 w-7 p-0 ${sidebarsHidden ? 'bg-muted' : ''}`}
          onClick={onToggleSidebars}
          title={sidebarsHidden ? "Show Sidebars" : "Hide Sidebars"}
        >
          <PanelLeftClose className={`w-3.5 h-3.5 transition-transform ${sidebarsHidden ? 'rotate-180' : ''}`} />
        </Button>
      )}

      <Separator orientation="vertical" className="h-5" />

      {/* Pages Dropdown */}
      <PagesDropdownWithSettings
        currentPage={currentPage}
        pages={safePages}
        onPageChange={onPageChange}
        onAddPage={onAddPage}
      />

      {!isCodeViewOpen && (
        <>
          <Separator orientation="vertical" className="h-5" />

          {/* Breakpoint Selector Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-7 px-1.5 gap-0.5">
                {(() => {
                  const current = breakpoints.find(bp => bp.id === currentBreakpoint);
                  const Icon = current?.icon || Monitor;
                  return <Icon className="w-3.5 h-3.5" />;
                })()}
                <ChevronDown className="w-2.5 h-2.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" side="top" className="z-[9999] bg-popover p-1">
              {breakpoints.map((bp) => {
                const Icon = bp.icon;
                return (
                  <DropdownMenuItem
                    key={bp.id}
                    onClick={() => onBreakpointChange(bp.id)}
                    className="gap-1.5 text-[11px] py-1 px-2"
                  >
                    <Icon className="w-3 h-3" />
                    {bp.label}
                    {currentBreakpoint === bp.id && <span className="ml-auto text-[10px]">✓</span>}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>

          <Separator orientation="vertical" className="h-5" />
        </>
      )}

      {/* Preview Button */}
      <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={onPreviewToggle}>
        <Eye className="w-3.5 h-3.5" />
      </Button>

      {/* Publish Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="default" 
            size="sm" 
            className="h-8 px-3 gap-1.5 dark:bg-white dark:text-black dark:hover:bg-white/90"
          >
            <Rocket className="w-3.5 h-3.5" />
            Publish
            <ChevronDown className="w-3 h-3 ml-0.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="end" 
          side="top" 
          className="z-[9999] bg-popover border border-border shadow-lg p-0 w-[280px]"
        >
          <Tabs value={publishTab} onValueChange={(v) => setPublishTab(v as 'publish' | 'export')} className="w-full">
            <div className="px-2 pt-2">
              <TabsList className="w-full flex rounded-md bg-muted h-8 p-0.5 gap-0.5">
                <TabsTrigger 
                  value="publish" 
                  className="text-[10px] h-7 flex-1 rounded px-2 data-[state=active]:bg-background data-[state=active]:shadow-sm flex items-center justify-center gap-1"
                >
                  <Rocket className="w-3 h-3" />
                  Publish
                </TabsTrigger>
                <TabsTrigger 
                  value="export" 
                  className="text-[10px] h-7 flex-1 rounded px-2 data-[state=active]:bg-background data-[state=active]:shadow-sm flex items-center justify-center gap-1"
                >
                  <Download className="w-3 h-3" />
                  Export
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="publish" className="p-2 pt-2 m-0 space-y-2">
              {/* Staging URL */}
              <div className="flex items-center justify-between gap-2 p-2 bg-muted/50 rounded border">
                <span className="text-[10px] font-medium truncate flex-1">{stagingDomain}</span>
                <div className="flex items-center gap-1">
                  {isPublished && <Check className="w-3 h-3 text-green-500" />}
                  <button
                    onClick={() => window.open(`https://${stagingDomain}`, '_blank')}
                    className="p-0.5 rounded hover:bg-background"
                    title="Open site"
                  >
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Domain */}
              <div className="space-y-1">
                <Label className="text-[9px] text-muted-foreground">Domain</Label>
                <Input
                  value={stagingDomain.replace('.webtir.com', '')}
                  onChange={(e) => setStagingDomain(`${e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')}.webtir.com`)}
                  className="h-7 text-[10px]"
                  placeholder="my-project"
                />
              </div>

              {/* Password Protection */}
              <div className="space-y-1.5 p-2 border rounded bg-muted/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {isPasswordProtected ? <Lock className="w-3 h-3 text-amber-500" /> : <Unlock className="w-3 h-3 text-muted-foreground" />}
                    <span className="text-[9px] font-medium">Password Protection</span>
                  </div>
                  <Switch
                    checked={isPasswordProtected}
                    onCheckedChange={setIsPasswordProtected}
                    className="scale-[0.65]"
                  />
                </div>
                
                {isPasswordProtected && (
                  <div className="space-y-1.5 pt-1">
                    <div className="grid grid-cols-2 gap-1.5">
                      <div className="space-y-0.5">
                        <Label className="text-[8px] text-muted-foreground">Username</Label>
                        <Input
                          value={stagingUsername}
                          onChange={(e) => setStagingUsername(e.target.value)}
                          className="h-5 text-[9px]"
                          placeholder="admin"
                        />
                      </div>
                      <div className="space-y-0.5">
                        <Label className="text-[8px] text-muted-foreground">Password</Label>
                        <Input
                          type="password"
                          value={stagingPassword}
                          onChange={(e) => setStagingPassword(e.target.value)}
                          className="h-5 text-[9px]"
                          placeholder="••••••••"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Custom Domain */}
              <button
                className="w-full flex items-center justify-between p-1.5 border rounded hover:bg-muted/50 transition-colors text-[10px]"
                onClick={() => toast({ title: 'Coming Soon', description: 'Custom domain support is coming soon!' })}
              >
                <span className="text-muted-foreground">Add a new domain</span>
                <Plus className="w-3 h-3" />
              </button>

              {/* Publish Button */}
              <Button 
                onClick={handlePublish} 
                className="w-full h-8 text-[10px] font-medium"
              >
                <Rocket className="w-3 h-3 mr-1" />
                {isPublished ? 'Update' : 'Publish'}
              </Button>
            </TabsContent>

            <TabsContent value="export" className="p-2 pt-2 m-0 space-y-0.5">
              <button
                onClick={handleExportReact}
                className="w-full flex items-center gap-2 p-1.5 rounded hover:bg-muted transition-colors text-[10px] text-left"
              >
                <FileCode className="w-3 h-3 text-muted-foreground" />
                <span>Export React (.jsx)</span>
              </button>
              <button
                onClick={handleExportHTML}
                className="w-full flex items-center gap-2 p-1.5 rounded hover:bg-muted transition-colors text-[10px] text-left"
              >
                <FileText className="w-3 h-3 text-muted-foreground" />
                <span>Export HTML</span>
              </button>
              <button
                onClick={handleExportCSS}
                className="w-full flex items-center gap-2 p-1.5 rounded hover:bg-muted transition-colors text-[10px] text-left"
              >
                <Palette className="w-3 h-3 text-muted-foreground" />
                <span>Export CSS</span>
              </button>
              <Separator className="my-1" />
              <button
                onClick={handleExportAll}
                className="w-full flex items-center gap-2 p-1.5 rounded hover:bg-muted transition-colors text-[10px] text-left font-medium"
              >
                <Download className="w-3 h-3 text-muted-foreground" />
                <span>Export All (Legacy)</span>
              </button>
              <button
                onClick={() => setShowRantirModal(true)}
                className="w-full flex items-center gap-2 p-1.5 rounded hover:bg-muted transition-colors text-[10px] text-left font-medium"
              >
                <Zap className="w-3 h-3 text-muted-foreground" />
                <span>Export Astro</span>
              </button>
            </TabsContent>
          </Tabs>
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
