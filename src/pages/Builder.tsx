import React, { useState } from 'react';
import { Canvas } from '@/builder/components/Canvas';
import { LeftSidebar } from '@/builder/components/LeftSidebar';
import { StylePanel } from '@/builder/components/StylePanel';
import { TopNavigation } from '@/builder/components/TopNavigation';
import { StyleSheetInjector } from '@/builder/components/StyleSheetInjector';
import { useTheme } from 'next-themes';

const Builder: React.FC = () => {
  const [zoom, setZoom] = useState(100);
  const { theme } = useTheme();

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-white">
      {/* Global stylesheet for builder classes */}
      <StyleSheetInjector />
      {/* Main content - Full screen canvas */}
      <div className="flex-1 relative overflow-hidden">
        {/* Canvas Background */}
        <Canvas zoom={zoom} />

        {/* Floating Left Sidebar */}
        <div className="absolute left-4 top-4 bottom-4 z-10">
          <LeftSidebar />
        </div>

        {/* Floating Top Navigation */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20">
          <TopNavigation zoom={zoom} setZoom={setZoom} />
        </div>

        {/* Floating Right Sidebar */}
        <div className="absolute right-4 top-4 bottom-4 z-10">
          <StylePanel />
        </div>
      </div>
    </div>
  );
};

export default Builder;
