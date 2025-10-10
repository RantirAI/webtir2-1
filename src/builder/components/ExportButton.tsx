import React, { useState } from 'react';
import { Download, FileCode, FileText, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useBuilderStore } from '../store/useBuilderStore';
import { exportReactComponent, exportHTML, exportStylesheet, downloadFile } from '../utils/export';
import { useToast } from '@/hooks/use-toast';

export const ExportButton: React.FC = () => {
  const { rootInstance } = useBuilderStore();
  const { toast } = useToast();

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
    const code = exportHTML(rootInstance, 'My Page');
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

  const handleExportAll = () => {
    if (!rootInstance) return;
    
    const css = exportStylesheet();
    const react = exportReactComponent(rootInstance, 'App');
    const html = exportHTML(rootInstance, 'My Page');
    
    downloadFile('styles.css', css);
    downloadFile('App.jsx', react);
    downloadFile('index.html', html);
    
    toast({
      title: 'Project Exported',
      description: 'Downloaded all files successfully',
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 bg-background hover:bg-accent"
        >
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
          Export All Files
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
