import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Navigator } from './Navigator';
import { ComponentsPanel } from './ComponentsPanel';
import { AIChat } from './AIChat';
import { Layers, Plus, FileText, ChevronRight, Home, Box, Sparkles } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Copy, Trash2 } from 'lucide-react';

interface LeftSidebarProps {
  // Props removed - no longer managing pages here
}

export const LeftSidebar: React.FC<LeftSidebarProps> = () => {
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('builder-sidebar-tab') || 'components';
  });

  useEffect(() => {
    localStorage.setItem('builder-sidebar-tab', activeTab);
  }, [activeTab]);

  return (
    <div 
      className="w-64 h-full border border-border rounded-lg shadow-xl flex flex-col overflow-hidden backdrop-blur-md bg-white/70 dark:bg-zinc-900/70"
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="w-full flex rounded-none border-b bg-transparent h-10 p-1 overflow-x-auto overflow-y-hidden scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent justify-start flex-shrink-0">
          <TabsTrigger 
            value="components" 
            className="text-xs h-full rounded-md data-[state=active]:bg-[#F5F5F5] dark:data-[state=active]:bg-zinc-800 data-[state=active]:shadow-none flex items-center gap-1 whitespace-nowrap flex-shrink-0"
          >
            <Box className="w-3 h-3" />
            <span>Elements</span>
          </TabsTrigger>
          <TabsTrigger 
            value="navigator" 
            className="text-xs h-full rounded-md data-[state=active]:bg-[#F5F5F5] dark:data-[state=active]:bg-zinc-800 data-[state=active]:shadow-none flex items-center gap-1 whitespace-nowrap flex-shrink-0"
          >
            <Layers className="w-3 h-3" />
            <span>Layers</span>
          </TabsTrigger>
          <TabsTrigger 
            value="ai" 
            className="text-xs h-full rounded-md data-[state=active]:bg-[#F5F5F5] dark:data-[state=active]:bg-zinc-800 data-[state=active]:shadow-none flex items-center gap-1 whitespace-nowrap flex-shrink-0"
          >
            <Sparkles className="w-3 h-3" />
            <span>AI</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="components" className="flex-1 m-0">
          <ComponentsPanel />
        </TabsContent>

        <TabsContent value="navigator" className="flex-1 m-0">
          <Navigator />
        </TabsContent>

        <TabsContent value="ai" className="flex-1 m-0">
          <AIChat />
        </TabsContent>
      </Tabs>
    </div>
  );
};
