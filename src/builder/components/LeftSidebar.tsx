import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Navigator } from './Navigator';
import { ComponentsPanel } from './ComponentsPanel';
import { Layers, Plus } from 'lucide-react';

export const LeftSidebar: React.FC = () => {
  return (
    <div 
      className="w-64 h-full border border-border rounded-lg shadow-xl flex flex-col overflow-hidden backdrop-blur-md bg-white/70 dark:bg-zinc-900/70"
    >
      <Tabs defaultValue="navigator" className="flex-1 flex flex-col">
        <TabsList className="w-full grid grid-cols-4 rounded-none border-b bg-transparent h-10 p-1 gap-1">
          <TabsTrigger 
            value="navigator" 
            className="gap-1 text-xs h-full rounded-md data-[state=active]:bg-[#F5F5F5] dark:data-[state=active]:bg-zinc-800 data-[state=active]:shadow-none"
          >
            <Layers className="w-3 h-3" />
            Navigator
          </TabsTrigger>
          <TabsTrigger 
            value="components" 
            className="gap-1 text-xs h-full rounded-md data-[state=active]:bg-[#F5F5F5] dark:data-[state=active]:bg-zinc-800 data-[state=active]:shadow-none"
          >
            <Plus className="w-3 h-3" />
            Add
          </TabsTrigger>
          <TabsTrigger 
            value="settings" 
            className="text-xs h-full rounded-md data-[state=active]:bg-[#F5F5F5] dark:data-[state=active]:bg-zinc-800 data-[state=active]:shadow-none"
          >
            Settings
          </TabsTrigger>
          <TabsTrigger 
            value="actions" 
            className="text-xs h-full rounded-md data-[state=active]:bg-[#F5F5F5] dark:data-[state=active]:bg-zinc-800 data-[state=active]:shadow-none"
          >
            Actions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="navigator" className="flex-1 m-0">
          <Navigator />
        </TabsContent>

        <TabsContent value="components" className="flex-1 m-0">
          <ComponentsPanel />
        </TabsContent>

        <TabsContent value="settings" className="flex-1 m-0 p-3">
          <div className="text-xs text-muted-foreground">Settings panel coming soon</div>
        </TabsContent>

        <TabsContent value="actions" className="flex-1 m-0 p-3">
          <div className="text-xs text-muted-foreground">Actions panel coming soon</div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
