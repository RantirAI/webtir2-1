import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, ChevronDown, Monitor, Tablet, Smartphone, Download, Save, Eye, ZoomIn, ZoomOut, Sun, Moon } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { useTheme } from 'next-themes';

interface PageNavigationProps {
  currentPage: string;
  pages: string[];
  onPageChange: (page: string) => void;
  onAddPage: () => void;
  currentBreakpoint: string;
  onBreakpointChange: (breakpoint: string) => void;
  zoom: number;
  setZoom: (zoom: number) => void;
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
}) => {
  const { theme, setTheme } = useTheme();

  const handleZoomIn = () => {
    setZoom(Math.min(zoom + 10, 200));
  };

  const handleZoomOut = () => {
    setZoom(Math.max(zoom - 10, 10));
  };

  return (
    <div 
      className="backdrop-blur-md border border-border rounded-lg shadow-lg px-3 py-2 flex items-center gap-2 bg-white/70 dark:bg-zinc-900/70"
    >
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
        <span className="text-xs font-medium min-w-[3rem] text-center">{zoom}%</span>
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
          {pages.map((page) => (
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

      {/* Action Buttons */}
      <Button variant="ghost" size="sm" className="h-8 px-2">
        <Eye className="w-4 h-4" />
      </Button>

      <Button variant="ghost" size="sm" className="h-8 px-2">
        <Save className="w-4 h-4" />
      </Button>

      <Button variant="default" size="sm" className="h-8 px-3 gap-2">
        <Download className="w-4 h-4" />
        Export
      </Button>
    </div>
  );
};
