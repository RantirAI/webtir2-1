import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Navigator } from './Navigator';
import { ComponentsPanel } from './ComponentsPanel';
import { Layers, Plus } from 'lucide-react';

export const LeftSidebar: React.FC = () => {
  return (
    <div className="w-64 h-full bg-card/95 backdrop-blur-sm border border-border rounded-xl shadow-xl flex flex-col overflow-hidden">
      <Tabs defaultValue="navigator" className="flex-1 flex flex-col">
        <TabsList className="w-full grid grid-cols-2 rounded-none border-b bg-transparent">
          <TabsTrigger value="navigator" className="gap-2">
            <Layers className="w-4 h-4" />
            Navigator
          </TabsTrigger>
          <TabsTrigger value="components" className="gap-2">
            <Plus className="w-4 h-4" />
            Add
          </TabsTrigger>
        </TabsList>

        <TabsContent value="navigator" className="flex-1 m-0">
          <Navigator />
        </TabsContent>

        <TabsContent value="components" className="flex-1 m-0">
          <ComponentsPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
};
