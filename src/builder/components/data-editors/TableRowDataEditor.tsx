import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ComponentInstance, ComponentType } from '../../store/types';
import { useBuilderStore } from '../../store/useBuilderStore';
import { generateId } from '../../utils/instance';

interface TableRowDataEditorProps {
  instance: ComponentInstance;
}

export const TableRowDataEditor: React.FC<TableRowDataEditorProps> = ({ instance }) => {
  const updateInstance = useBuilderStore((state) => state.updateInstance);
  const isHeader = instance.props?.isHeader || false;
  const cellCount = instance.children.length;

  const toggleHeaderRow = (checked: boolean) => {
    // When toggling, we need to convert all children to the appropriate cell type
    const newType: ComponentType = checked ? 'TableHeaderCell' : 'TableCell';
    const newChildren: ComponentInstance[] = instance.children.map(child => ({
      ...child,
      type: newType,
    }));
    
    updateInstance(instance.id, {
      props: { ...instance.props, isHeader: checked },
      label: checked ? 'Header Row' : `Row`,
      children: newChildren,
    });
  };

  const addCell = () => {
    const cellType: ComponentType = isHeader ? 'TableHeaderCell' : 'TableCell';
    const newCell: ComponentInstance = {
      id: generateId(),
      type: cellType,
      label: `Cell ${cellCount + 1}`,
      props: { content: `Cell ${cellCount + 1}` },
      children: [],
      styleSourceIds: [],
    };
    
    updateInstance(instance.id, {
      children: [...instance.children, newCell],
    });
  };

  return (
    <div className="space-y-4">
      {/* Row Info */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-muted-foreground">Table Row</span>
        <Badge variant="secondary" className="text-[9px] h-4">
          {cellCount} cell{cellCount !== 1 ? 's' : ''}
        </Badge>
      </div>

      {/* Settings */}
      <div className="space-y-2">
        <Label className="text-[10px] font-medium text-foreground">Row Settings</Label>
        <label className="flex items-center gap-2 text-[10px]">
          <Checkbox
            checked={isHeader}
            onCheckedChange={(checked) => toggleHeaderRow(!!checked)}
            className="h-3.5 w-3.5"
          />
          Header row
        </label>
        <p className="text-[9px] text-muted-foreground">
          Header rows appear in the table header section with distinct styling.
        </p>
      </div>

      {/* Add Cell */}
      <div className="space-y-2">
        <Label className="text-[10px] font-medium text-foreground">Structure</Label>
        <Button
          size="sm"
          variant="outline"
          onClick={addCell}
          className="h-6 text-[9px] px-2 w-full"
        >
          <Plus className="w-3 h-3 mr-1" /> Add Cell
        </Button>
        <p className="text-[9px] text-muted-foreground">
          Cells are shown in the Navigator tree. Select a cell to edit its content.
        </p>
      </div>
    </div>
  );
};
