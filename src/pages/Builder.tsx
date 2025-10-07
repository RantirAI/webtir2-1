import React from 'react';
import { Canvas } from '@/builder/components/Canvas';
import { ComponentsPanel } from '@/builder/components/ComponentsPanel';
import { Inspector } from '@/builder/components/Inspector';
import { Navigator } from '@/builder/components/Navigator';
import { Button } from '@/components/ui/button';
import { Download, Save, Eye } from 'lucide-react';

const Builder: React.FC = () => {
  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Topbar */}
      <header className="h-14 border-b border-border bg-card flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">W</span>
          </div>
          <span className="font-semibold text-foreground">Builder</span>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm">
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
          <Button variant="ghost" size="sm">
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
          <Button variant="default" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left sidebar - Components */}
        <ComponentsPanel />

        {/* Left sidebar - Navigator */}
        <Navigator />

        {/* Canvas */}
        <Canvas />

        {/* Right sidebar - Inspector */}
        <Inspector />
      </div>
    </div>
  );
};

export default Builder;
