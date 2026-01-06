import React from 'react';
import { useBuilderStore } from '../store/useBuilderStore';
import { useComponentInstanceStore } from '../store/useComponentInstanceStore';
import { Button } from '@/components/ui/button';
import { X, Component, Save } from 'lucide-react';

export const IsolationModeBar: React.FC = () => {
  const isolatedInstanceId = useBuilderStore((state) => state.isolatedInstanceId);
  const exitIsolationMode = useBuilderStore((state) => state.exitIsolationMode);
  const getIsolatedInstance = useBuilderStore((state) => state.getIsolatedInstance);
  const { isLinkedInstance, getInstanceLink, getPrebuilt, syncMasterToPrebuilt } = useComponentInstanceStore();
  
  if (!isolatedInstanceId) return null;
  
  const isolatedInstance = getIsolatedInstance();
  if (!isolatedInstance) return null;
  
  // Get the component name
  const isLinked = isLinkedInstance(isolatedInstanceId);
  const link = isLinked ? getInstanceLink(isolatedInstanceId) : null;
  const prebuilt = link ? getPrebuilt(link.prebuiltId) : null;
  const componentName = prebuilt?.name || isolatedInstance.label || isolatedInstance.type;
  
  const handleSave = () => {
    // If this is a linked component, sync changes to the prebuilt
    if (isLinked && link) {
      syncMasterToPrebuilt(isolatedInstanceId);
    }
    exitIsolationMode();
  };

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-4 py-2 bg-emerald-500 text-white rounded-lg shadow-lg">
      <div className="flex items-center gap-2">
        <Component className="w-4 h-4" />
        <span className="text-sm font-medium">Editing: {componentName}</span>
      </div>
      
      <div className="w-px h-5 bg-white/30" />
      
      <Button
        variant="ghost"
        size="sm"
        className="h-7 px-3 gap-1.5 text-white hover:bg-white/20 hover:text-white"
        onClick={handleSave}
      >
        <Save className="w-3.5 h-3.5" />
        Save & Exit
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        className="h-7 w-7 p-0 text-white hover:bg-white/20 hover:text-white"
        onClick={exitIsolationMode}
      >
        <X className="w-4 h-4" />
      </Button>
    </div>
  );
};
