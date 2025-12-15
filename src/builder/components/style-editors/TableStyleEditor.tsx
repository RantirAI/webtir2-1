import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ColorPicker } from '../ColorPicker';
import { ComponentInstance } from '../../store/types';
import { useBuilderStore } from '../../store/useBuilderStore';

interface TableStyleEditorProps {
  instance: ComponentInstance;
}

export const TableStyleEditor: React.FC<TableStyleEditorProps> = ({ instance }) => {
  const { updateInstance } = useBuilderStore();
  const styles = instance.props?.tableStyles || {};

  const updateStyles = (key: string, value: string) => {
    updateInstance(instance.id, {
      props: {
        ...instance.props,
        tableStyles: { ...styles, [key]: value }
      }
    });
  };

  return (
    <div className="space-y-4">
      {/* Header Styling */}
      <div className="space-y-3">
        <Label className="text-[10px] font-medium text-foreground">Header Styling</Label>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="block text-[9px] text-muted-foreground">Background</Label>
            <ColorPicker
              value={styles.headerBackground || ''}
              onChange={(v) => updateStyles('headerBackground', v)}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="block text-[9px] text-muted-foreground">Text Color</Label>
            <ColorPicker
              value={styles.headerTextColor || ''}
              onChange={(v) => updateStyles('headerTextColor', v)}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[9px] text-muted-foreground">Font Weight</Label>
            <Select value={styles.headerFontWeight || '600'} onValueChange={(v) => updateStyles('headerFontWeight', v)}>
              <SelectTrigger className="h-6 text-[10px] bg-muted">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover z-50">
                <SelectItem value="400" className="text-[10px]">Normal</SelectItem>
                <SelectItem value="500" className="text-[10px]">Medium</SelectItem>
                <SelectItem value="600" className="text-[10px]">Semibold</SelectItem>
                <SelectItem value="700" className="text-[10px]">Bold</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-[9px] text-muted-foreground">Font Size (px)</Label>
            <Input
              type="number"
              value={styles.headerFontSize || '14'}
              onChange={(e) => updateStyles('headerFontSize', e.target.value)}
              className="h-6 text-[10px] bg-muted"
            />
          </div>
        </div>
      </div>

      {/* Body Styling */}
      <div className="space-y-3">
        <Label className="text-[10px] font-medium text-foreground">Body Styling</Label>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="block text-[9px] text-muted-foreground">Cell Background</Label>
            <ColorPicker
              value={styles.cellBackground || ''}
              onChange={(v) => updateStyles('cellBackground', v)}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="block text-[9px] text-muted-foreground">Text Color</Label>
            <ColorPicker
              value={styles.cellTextColor || ''}
              onChange={(v) => updateStyles('cellTextColor', v)}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[9px] text-muted-foreground">Font Size (px)</Label>
            <Input
              type="number"
              value={styles.cellFontSize || '14'}
              onChange={(e) => updateStyles('cellFontSize', e.target.value)}
              className="h-6 text-[10px] bg-muted"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[9px] text-muted-foreground">Cell Padding (px)</Label>
            <Input
              type="number"
              value={styles.cellPadding || '12'}
              onChange={(e) => updateStyles('cellPadding', e.target.value)}
              className="h-6 text-[10px] bg-muted"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[9px] text-muted-foreground">Row Height (px)</Label>
            <Input
              type="number"
              value={styles.rowHeight || ''}
              onChange={(e) => updateStyles('rowHeight', e.target.value)}
              className="h-6 text-[10px] bg-muted"
              placeholder="Auto"
            />
          </div>
        </div>
      </div>

      {/* Alternating & Hover */}
      <div className="space-y-3">
        <Label className="text-[10px] font-medium text-foreground">Alternating & Hover</Label>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="block text-[9px] text-muted-foreground">Striped Color</Label>
            <ColorPicker
              value={styles.stripedColor || ''}
              onChange={(v) => updateStyles('stripedColor', v)}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="block text-[9px] text-muted-foreground">Hover Color</Label>
            <ColorPicker
              value={styles.hoverColor || ''}
              onChange={(v) => updateStyles('hoverColor', v)}
            />
          </div>
        </div>
      </div>

      {/* Borders */}
      <div className="space-y-3">
        <Label className="text-[10px] font-medium text-foreground">Borders</Label>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-[9px] text-muted-foreground">Border Style</Label>
            <Select value={styles.borderStyle || 'horizontal'} onValueChange={(v) => updateStyles('borderStyle', v)}>
              <SelectTrigger className="h-6 text-[10px] bg-muted">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover z-50">
                <SelectItem value="none" className="text-[10px]">None</SelectItem>
                <SelectItem value="horizontal" className="text-[10px]">Horizontal</SelectItem>
                <SelectItem value="vertical" className="text-[10px]">Vertical</SelectItem>
                <SelectItem value="full" className="text-[10px]">Full Grid</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-[9px] text-muted-foreground">Border Width (px)</Label>
            <Input
              type="number"
              value={styles.borderWidth || '1'}
              onChange={(e) => updateStyles('borderWidth', e.target.value)}
              className="h-6 text-[10px] bg-muted"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="block text-[9px] text-muted-foreground">Border Color</Label>
            <ColorPicker
              value={styles.borderColor || ''}
              onChange={(v) => updateStyles('borderColor', v)}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[9px] text-muted-foreground">Border Radius (px)</Label>
            <Input
              type="number"
              value={styles.outerBorderRadius || '0'}
              onChange={(e) => updateStyles('outerBorderRadius', e.target.value)}
              className="h-6 text-[10px] bg-muted"
            />
          </div>
        </div>
      </div>

      {/* Container */}
      <div className="space-y-3">
        <Label className="text-[10px] font-medium text-foreground">Container</Label>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="block text-[9px] text-muted-foreground">Background</Label>
            <ColorPicker
              value={styles.tableBackground || ''}
              onChange={(v) => updateStyles('tableBackground', v)}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[9px] text-muted-foreground">Max Height (px)</Label>
            <Input
              type="number"
              value={styles.maxHeight || ''}
              onChange={(e) => updateStyles('maxHeight', e.target.value)}
              className="h-6 text-[10px] bg-muted"
              placeholder="None"
            />
          </div>
          <div className="col-span-2 space-y-1.5">
            <Label className="text-[9px] text-muted-foreground">Shadow</Label>
            <Select value={styles.tableShadow || 'none'} onValueChange={(v) => updateStyles('tableShadow', v)}>
              <SelectTrigger className="h-6 text-[10px] bg-muted">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover z-50">
                <SelectItem value="none" className="text-[10px]">None</SelectItem>
                <SelectItem value="sm" className="text-[10px]">Small</SelectItem>
                <SelectItem value="md" className="text-[10px]">Medium</SelectItem>
                <SelectItem value="lg" className="text-[10px]">Large</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
};
