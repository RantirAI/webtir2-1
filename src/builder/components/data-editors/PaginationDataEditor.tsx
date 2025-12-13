import React from 'react';
import { Input } from '@/components/ui/input';
import { ComponentInstance } from '../../store/types';
import { useBuilderStore } from '../../store/useBuilderStore';

interface PaginationDataEditorProps {
  instance: ComponentInstance;
}

export const PaginationDataEditor: React.FC<PaginationDataEditorProps> = ({ instance }) => {
  const { updateInstance } = useBuilderStore();

  const updateProps = (updates: Record<string, any>) => {
    updateInstance(instance.id, {
      props: { ...instance.props, ...updates }
    });
  };

  return (
    <div className="space-y-3">
      <label className="text-[10px] font-medium text-foreground">Pagination Settings</label>
      
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <label className="text-[9px] text-muted-foreground">Total Pages</label>
          <Input
            type="number"
            value={instance.props?.totalPages ?? 10}
            onChange={(e) => updateProps({ totalPages: parseInt(e.target.value) || 1 })}
            className="h-5 text-[10px]"
            min={1}
          />
        </div>
        <div className="space-y-1">
          <label className="text-[9px] text-muted-foreground">Current Page</label>
          <Input
            type="number"
            value={instance.props?.currentPage ?? 1}
            onChange={(e) => updateProps({ currentPage: parseInt(e.target.value) || 1 })}
            className="h-5 text-[10px]"
            min={1}
            max={instance.props?.totalPages || 10}
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-[9px] text-muted-foreground">Siblings (pages shown each side)</label>
        <Input
          type="number"
          value={instance.props?.siblings ?? 1}
          onChange={(e) => updateProps({ siblings: parseInt(e.target.value) || 1 })}
          className="h-5 text-[10px] w-16"
          min={0}
          max={3}
        />
      </div>

      <div className="space-y-1">
        <label className="text-[9px] text-muted-foreground">Boundaries (pages at start/end)</label>
        <Input
          type="number"
          value={instance.props?.boundaries ?? 1}
          onChange={(e) => updateProps({ boundaries: parseInt(e.target.value) || 1 })}
          className="h-5 text-[10px] w-16"
          min={0}
          max={2}
        />
      </div>
    </div>
  );
};
