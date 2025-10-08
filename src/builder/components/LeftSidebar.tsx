import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Navigator } from './Navigator';
import { ComponentsPanel } from './ComponentsPanel';
import { Layers, Plus, FolderOpen } from 'lucide-react';

export const LeftSidebar: React.FC = () => {
  return (
    <div 
      className="w-64 h-full border border-border rounded-lg shadow-xl flex flex-col overflow-hidden backdrop-blur-md bg-white/70 dark:bg-zinc-900/70"
    >
      <Tabs defaultValue="components" className="flex-1 flex flex-col">
        <TabsList className="w-full grid grid-cols-3 rounded-none border-b bg-transparent h-10 p-1 gap-1">
          <TabsTrigger 
            value="components" 
            className="gap-1 text-xs h-full rounded-md data-[state=active]:bg-[#F5F5F5] dark:data-[state=active]:bg-zinc-800 data-[state=active]:shadow-none"
          >
            <Plus className="w-3 h-3" />
            Components
          </TabsTrigger>
          <TabsTrigger 
            value="navigator" 
            className="gap-1 text-xs h-full rounded-md data-[state=active]:bg-[#F5F5F5] dark:data-[state=active]:bg-zinc-800 data-[state=active]:shadow-none"
          >
            <Layers className="w-3 h-3" />
            Layers
          </TabsTrigger>
          <TabsTrigger 
            value="assets" 
            className="gap-1 text-xs h-full rounded-md data-[state=active]:bg-[#F5F5F5] dark:data-[state=active]:bg-zinc-800 data-[state=active]:shadow-none"
          >
            <FolderOpen className="w-3 h-3" />
            Assets
          </TabsTrigger>
        </TabsList>

        <TabsContent value="components" className="flex-1 m-0">
          <ComponentsPanel />
        </TabsContent>

        <TabsContent value="navigator" className="flex-1 m-0">
          <Navigator />
        </TabsContent>

        <TabsContent value="assets" className="flex-1 m-0 p-3">
          <div className="text-xs text-muted-foreground">Assets panel coming soon</div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
