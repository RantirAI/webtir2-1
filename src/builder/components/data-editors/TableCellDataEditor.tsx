import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ComponentInstance } from '../../store/types';
import { useBuilderStore } from '../../store/useBuilderStore';

interface TableCellDataEditorProps {
  instance: ComponentInstance;
}

export const TableCellDataEditor: React.FC<TableCellDataEditorProps> = ({ instance }) => {
  const updateInstance = useBuilderStore((state) => state.updateInstance);
  const isHeaderCell = instance.type === 'TableHeaderCell';
  const content = instance.props?.content || '';
  const hasChildren = instance.children.length > 0;

  const updateContent = (value: string) => {
    updateInstance(instance.id, {
      props: { ...instance.props, content: value },
      label: value || (isHeaderCell ? 'Header' : 'Cell'),
    });
  };

  return (
    <div className="space-y-4">
      {/* Cell Info */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-muted-foreground">
          {isHeaderCell ? 'Table Header Cell' : 'Table Cell'}
        </span>
        <Badge variant={isHeaderCell ? 'default' : 'secondary'} className="text-[9px] h-4">
          {isHeaderCell ? 'Header' : 'Data'}
        </Badge>
      </div>

      {/* Content */}
      <div className="space-y-1.5">
        <Label className="text-[10px] font-medium text-foreground">Cell Content</Label>
        <Input
          value={content}
          onChange={(e) => updateContent(e.target.value)}
          placeholder={isHeaderCell ? 'Header text...' : 'Cell content...'}
          className="h-7 text-[11px]"
        />
        <p className="text-[9px] text-muted-foreground">
          {hasChildren 
            ? 'This cell contains dropped elements. The text content is hidden when elements are present.'
            : 'Enter text content or drop elements into this cell for rich content.'}
        </p>
      </div>

      {/* Info about children */}
      {hasChildren && (
        <div className="p-2 rounded border border-border bg-muted/30">
          <span className="text-[9px] text-muted-foreground">
            {instance.children.length} element{instance.children.length !== 1 ? 's' : ''} inside this cell
          </span>
        </div>
      )}
    </div>
  );
};
