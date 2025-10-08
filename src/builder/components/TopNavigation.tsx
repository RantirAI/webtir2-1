import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, Save, Eye, ZoomIn, ZoomOut, Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Separator } from '@/components/ui/separator';

interface TopNavigationProps {
  zoom: number;
  setZoom: (zoom: number) => void;
}

export const TopNavigation: React.FC<TopNavigationProps> = ({ zoom, setZoom }) => {
  const { theme, setTheme } = useTheme();

  const handleZoomIn = () => {
    setZoom(Math.min(zoom + 10, 200));
  };

  const handleZoomOut = () => {
    setZoom(Math.max(zoom - 10, 10));
  };

  return (
    <div className="bg-card/95 backdrop-blur-sm border border-border rounded-full shadow-lg px-3 py-2 flex items-center gap-2">
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-3 rounded-full"
          onClick={handleZoomOut}
        >
          <ZoomOut className="w-4 h-4" />
        </Button>
        <span className="text-xs font-medium min-w-[3rem] text-center">{zoom}%</span>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-3 rounded-full"
          onClick={handleZoomIn}
        >
          <ZoomIn className="w-4 h-4" />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-6" />

      <Button
        variant="ghost"
        size="sm"
        className="h-8 px-3 rounded-full"
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      >
        {theme === 'dark' ? (
          <Sun className="w-4 h-4" />
        ) : (
          <Moon className="w-4 h-4" />
        )}
      </Button>

      <Separator orientation="vertical" className="h-6" />

      <Button variant="ghost" size="sm" className="h-8 px-3 rounded-full">
        <Eye className="w-4 h-4 mr-2" />
        Preview
      </Button>

      <Button variant="ghost" size="sm" className="h-8 px-3 rounded-full">
        <Save className="w-4 h-4 mr-2" />
        Save
      </Button>

      <Button variant="default" size="sm" className="h-8 px-3 rounded-full">
        <Download className="w-4 h-4 mr-2" />
        Export
      </Button>
    </div>
  );
};
