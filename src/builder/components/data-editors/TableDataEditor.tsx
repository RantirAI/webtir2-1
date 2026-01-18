import React from 'react';
import { Plus, ArrowUp, ArrowDown, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ColorPicker } from '../ColorPicker';
import { ComponentInstance, ComponentType } from '../../store/types';
import { useBuilderStore } from '../../store/useBuilderStore';
import { generateId } from '../../utils/instance';

interface TableDataEditorProps {
  instance: ComponentInstance;
}

const prebuiltTemplates = [
  { value: 'simple', label: 'Simple' },
  { value: 'striped', label: 'Striped' },
  { value: 'bordered', label: 'Bordered' },
  { value: 'modern', label: 'Modern' },
  { value: 'compact', label: 'Compact' },
  { value: 'card', label: 'Card Style' },
];

const templateStyles: Record<string, any> = {
  'simple': {
    headerBackground: 'transparent',
    headerTextColor: 'hsl(var(--foreground))',
    headerFontWeight: '600',
    headerFontSize: '14',
    cellBackground: 'transparent',
    cellTextColor: 'hsl(var(--foreground))',
    cellFontSize: '14',
    cellPadding: '12',
    borderStyle: 'horizontal',
    borderColor: 'hsl(var(--border))',
    borderWidth: '1',
    outerBorderRadius: '0',
    tableBackground: 'transparent',
    tableShadow: 'none',
  },
  'striped': {
    headerBackground: 'hsl(var(--muted))',
    headerTextColor: 'hsl(var(--foreground))',
    headerFontWeight: '600',
    headerFontSize: '14',
    cellBackground: 'transparent',
    cellTextColor: 'hsl(var(--foreground))',
    cellFontSize: '14',
    cellPadding: '12',
    stripedColor: 'hsl(var(--muted) / 0.5)',
    borderStyle: 'horizontal',
    borderColor: 'hsl(var(--border))',
    borderWidth: '1',
    outerBorderRadius: '8',
    tableBackground: 'transparent',
    tableShadow: 'none',
    striped: true,
  },
  'bordered': {
    headerBackground: 'hsl(var(--muted))',
    headerTextColor: 'hsl(var(--foreground))',
    headerFontWeight: '600',
    headerFontSize: '14',
    cellBackground: 'transparent',
    cellTextColor: 'hsl(var(--foreground))',
    cellFontSize: '14',
    cellPadding: '12',
    borderStyle: 'full',
    borderColor: 'hsl(var(--border))',
    borderWidth: '1',
    outerBorderRadius: '0',
    tableBackground: 'transparent',
    tableShadow: 'none',
    bordered: true,
  },
  'modern': {
    headerBackground: 'hsl(var(--primary))',
    headerTextColor: 'hsl(var(--primary-foreground))',
    headerFontWeight: '600',
    headerFontSize: '14',
    cellBackground: 'hsl(var(--background))',
    cellTextColor: 'hsl(var(--foreground))',
    cellFontSize: '14',
    cellPadding: '16',
    hoverColor: 'hsl(var(--muted))',
    borderStyle: 'none',
    borderColor: 'transparent',
    borderWidth: '0',
    outerBorderRadius: '12',
    tableBackground: 'hsl(var(--background))',
    tableShadow: 'lg',
    hoverable: true,
  },
  'compact': {
    headerBackground: 'hsl(var(--muted))',
    headerTextColor: 'hsl(var(--foreground))',
    headerFontWeight: '500',
    headerFontSize: '12',
    cellBackground: 'transparent',
    cellTextColor: 'hsl(var(--foreground))',
    cellFontSize: '12',
    cellPadding: '8',
    borderStyle: 'horizontal',
    borderColor: 'hsl(var(--border))',
    borderWidth: '1',
    outerBorderRadius: '4',
    tableBackground: 'transparent',
    tableShadow: 'none',
    compact: true,
  },
  'card': {
    headerBackground: 'hsl(var(--card))',
    headerTextColor: 'hsl(var(--card-foreground))',
    headerFontWeight: '600',
    headerFontSize: '14',
    cellBackground: 'hsl(var(--card))',
    cellTextColor: 'hsl(var(--card-foreground))',
    cellFontSize: '14',
    cellPadding: '16',
    hoverColor: 'hsl(var(--accent))',
    borderStyle: 'horizontal',
    borderColor: 'hsl(var(--border))',
    borderWidth: '1',
    outerBorderRadius: '12',
    tableBackground: 'hsl(var(--card))',
    tableShadow: 'md',
    hoverable: true,
  },
};

export const TableDataEditor: React.FC<TableDataEditorProps> = ({ instance }) => {
  const { updateInstance, setSelectedInstanceId } = useBuilderStore();
  
  const tableStyles = instance.props?.tableStyles || {};
  const currentTemplate = tableStyles.template || '';

  // Get rows from children - separate header rows from data rows
  const headerRows = instance.children.filter(c => c.type === 'TableRow' && c.props?.isHeader);
  const dataRows = instance.children.filter(c => c.type === 'TableRow' && !c.props?.isHeader);
  
  // Get column count from first row
  const firstRow = headerRows[0] || dataRows[0];
  const columnCount = firstRow?.children.length || 0;

  const updateTableStyles = (updates: Partial<typeof tableStyles>) => {
    updateInstance(instance.id, {
      props: {
        ...instance.props,
        tableStyles: { ...tableStyles, ...updates }
      }
    });
  };

  const applyTemplate = (templateId: string) => {
    const templateStyle = templateStyles[templateId];
    if (templateStyle) {
      updateInstance(instance.id, {
        props: {
          ...instance.props,
          tableStyles: { ...tableStyles, ...templateStyle, template: templateId }
        }
      });
    }
  };

  // Add a new data row with cells matching the column count
  const addRow = () => {
    const cellCount = columnCount || 3;
    const rowNumber = dataRows.length + 1;
    
    const newCells: ComponentInstance[] = Array(cellCount).fill(null).map((_, idx) => ({
      id: generateId(),
      type: 'TableCell' as ComponentType,
      label: `Row ${rowNumber} - Cell ${idx + 1}`,
      props: { content: `Row ${rowNumber} - Cell ${idx + 1}` },
      children: [],
      styleSourceIds: [],
    }));

    const newRow: ComponentInstance = {
      id: generateId(),
      type: 'TableRow' as ComponentType,
      label: `Row ${rowNumber}`,
      props: { isHeader: false },
      children: newCells,
      styleSourceIds: [],
    };

    updateInstance(instance.id, {
      children: [...instance.children, newRow],
    });
  };

  // Add a new column (add cell to each row)
  const addColumn = () => {
    const colNumber = columnCount + 1;
    
    const newChildren = instance.children.map((row, rowIdx) => {
      if (row.type !== 'TableRow') return row;
      
      const isHeader = row.props?.isHeader;
      const cellType: ComponentType = isHeader ? 'TableHeaderCell' : 'TableCell';
      const rowNumber = isHeader ? 'Header' : dataRows.indexOf(row) + 1;
      
      const newCell: ComponentInstance = {
        id: generateId(),
        type: cellType,
        label: isHeader ? `Column ${colNumber}` : `Row ${rowNumber} - Cell ${colNumber}`,
        props: { content: isHeader ? `Column ${colNumber}` : `Row ${rowNumber} - Cell ${colNumber}` },
        children: [],
        styleSourceIds: [],
      };

      return {
        ...row,
        children: [...row.children, newCell],
      };
    });

    updateInstance(instance.id, {
      children: newChildren,
    });
  };

  // Add header row if not present
  const addHeaderRow = () => {
    const cellCount = columnCount || 3;
    
    const headerCells: ComponentInstance[] = Array(cellCount).fill(null).map((_, idx) => ({
      id: generateId(),
      type: 'TableHeaderCell' as ComponentType,
      label: `Column ${idx + 1}`,
      props: { content: `Column ${idx + 1}` },
      children: [],
      styleSourceIds: [],
    }));

    const headerRow: ComponentInstance = {
      id: generateId(),
      type: 'TableRow' as ComponentType,
      label: 'Header Row',
      props: { isHeader: true },
      children: headerCells,
      styleSourceIds: [],
    };

    // Insert header row at the beginning
    updateInstance(instance.id, {
      children: [headerRow, ...instance.children],
    });
  };

  // Remove a row
  const removeRow = (rowId: string) => {
    updateInstance(instance.id, {
      children: instance.children.filter(c => c.id !== rowId),
    });
  };

  // Move row up/down
  const moveRow = (rowId: string, direction: 'up' | 'down') => {
    const rowIndex = instance.children.findIndex(c => c.id === rowId);
    if (rowIndex === -1) return;
    
    const isHeader = instance.children[rowIndex].props?.isHeader;
    
    // Find the valid swap target
    let targetIndex = direction === 'up' ? rowIndex - 1 : rowIndex + 1;
    
    // Skip header rows when moving data rows
    if (!isHeader) {
      while (targetIndex >= 0 && targetIndex < instance.children.length) {
        if (!instance.children[targetIndex].props?.isHeader) break;
        targetIndex = direction === 'up' ? targetIndex - 1 : targetIndex + 1;
      }
    }
    
    if (targetIndex < 0 || targetIndex >= instance.children.length) return;
    
    const newChildren = [...instance.children];
    [newChildren[rowIndex], newChildren[targetIndex]] = [newChildren[targetIndex], newChildren[rowIndex]];
    
    updateInstance(instance.id, { children: newChildren });
  };

  // Remove last column from all rows
  const removeColumn = () => {
    if (columnCount <= 1) return;
    
    const newChildren = instance.children.map(row => {
      if (row.type !== 'TableRow') return row;
      return {
        ...row,
        children: row.children.slice(0, -1),
      };
    });

    updateInstance(instance.id, {
      children: newChildren,
    });
  };

  return (
    <div className="space-y-3">
      {/* Structure Overview */}
      <div className="p-2 rounded border border-border bg-muted/30">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-medium text-foreground">Table Structure</span>
          <div className="flex gap-1">
            <Badge variant="secondary" className="text-[9px] h-4">
              {columnCount} col{columnCount !== 1 ? 's' : ''}
            </Badge>
            <Badge variant="secondary" className="text-[9px] h-4">
              {dataRows.length} row{dataRows.length !== 1 ? 's' : ''}
            </Badge>
          </div>
        </div>
        
        <div className="flex gap-1 flex-wrap">
          <Button
            size="sm"
            variant="outline"
            onClick={addColumn}
            className="h-6 text-[9px] px-2"
          >
            <Plus className="w-3 h-3 mr-0.5" /> Column
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={addRow}
            className="h-6 text-[9px] px-2"
          >
            <Plus className="w-3 h-3 mr-0.5" /> Row
          </Button>
          {headerRows.length === 0 && (
            <Button
              size="sm"
              variant="outline"
              onClick={addHeaderRow}
              className="h-6 text-[9px] px-2"
            >
              <Plus className="w-3 h-3 mr-0.5" /> Header
            </Button>
          )}
          {columnCount > 1 && (
            <Button
              size="sm"
              variant="ghost"
              onClick={removeColumn}
              className="h-6 text-[9px] px-2 text-destructive hover:text-destructive"
            >
              <Trash2 className="w-3 h-3 mr-0.5" /> Col
            </Button>
          )}
        </div>
      </div>

      {/* Row List */}
      <div className="space-y-1">
        <Label className="text-[10px] font-medium text-foreground">Rows</Label>
        <div className="space-y-1 max-h-[120px] overflow-y-auto">
          {instance.children.filter(c => c.type === 'TableRow').map((row, idx) => {
            const isHeader = row.props?.isHeader;
            const rowLabel = isHeader ? 'Header Row' : `Row ${dataRows.indexOf(row) + 1}`;
            return (
              <div 
                key={row.id} 
                className="flex items-center gap-1 p-1.5 rounded border border-border bg-muted/30 cursor-pointer hover:bg-muted/50"
                onClick={() => setSelectedInstanceId(row.id)}
              >
                <div className="flex flex-col gap-0.5">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => { e.stopPropagation(); moveRow(row.id, 'up'); }}
                    className="h-3 w-3 p-0"
                    disabled={idx === 0}
                  >
                    <ArrowUp className="w-2 h-2" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => { e.stopPropagation(); moveRow(row.id, 'down'); }}
                    className="h-3 w-3 p-0"
                    disabled={idx === instance.children.length - 1}
                  >
                    <ArrowDown className="w-2 h-2" />
                  </Button>
                </div>
                <Badge variant={isHeader ? 'default' : 'secondary'} className="text-[9px] h-4 mr-1">
                  {isHeader ? 'H' : idx}
                </Badge>
                <span className="flex-1 text-[10px] truncate">{rowLabel}</span>
                <span className="text-[9px] text-muted-foreground">{row.children.length} cells</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => { e.stopPropagation(); removeRow(row.id); }}
                  className="h-4 w-4 p-0 text-destructive hover:text-destructive"
                  disabled={instance.children.length <= 1}
                >
                  <Trash2 className="w-2.5 h-2.5" />
                </Button>
              </div>
            );
          })}
        </div>
        <p className="text-[9px] text-muted-foreground">
          Click a row to select it and edit individual cells in the Navigator.
        </p>
      </div>

      <Separator />

      {/* Template Selection */}
      <div className="space-y-2">
        <Label className="text-[10px] font-medium text-foreground">Style Template</Label>
        <Select value={currentTemplate} onValueChange={applyTemplate}>
          <SelectTrigger className="h-7 text-[10px]">
            <SelectValue placeholder="Choose a template..." />
          </SelectTrigger>
          <SelectContent className="bg-popover z-50">
            {prebuiltTemplates.map((template) => (
              <SelectItem key={template.value} value={template.value} className="text-[10px]">
                {template.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Header Styling */}
      <div className="space-y-2">
        <Label className="text-[10px] font-medium text-foreground">Header Style</Label>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-[9px] text-muted-foreground">Background</Label>
            <ColorPicker
              value={tableStyles.headerBackground || 'transparent'}
              onChange={(val) => updateTableStyles({ headerBackground: val })}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-[9px] text-muted-foreground">Text Color</Label>
            <ColorPicker
              value={tableStyles.headerTextColor || 'hsl(var(--foreground))'}
              onChange={(val) => updateTableStyles({ headerTextColor: val })}
            />
          </div>
        </div>
      </div>

      {/* Cell Styling */}
      <div className="space-y-2">
        <Label className="text-[10px] font-medium text-foreground">Cell Style</Label>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-[9px] text-muted-foreground">Background</Label>
            <ColorPicker
              value={tableStyles.cellBackground || 'transparent'}
              onChange={(val) => updateTableStyles({ cellBackground: val })}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-[9px] text-muted-foreground">Text Color</Label>
            <ColorPicker
              value={tableStyles.cellTextColor || 'hsl(var(--foreground))'}
              onChange={(val) => updateTableStyles({ cellTextColor: val })}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-[9px] text-muted-foreground">Padding</Label>
            <Select 
              value={tableStyles.cellPadding || '12'} 
              onValueChange={(val) => updateTableStyles({ cellPadding: val })}
            >
              <SelectTrigger className="h-6 text-[10px] bg-muted">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover z-50">
                <SelectItem value="8" className="text-[10px]">Small (8px)</SelectItem>
                <SelectItem value="12" className="text-[10px]">Medium (12px)</SelectItem>
                <SelectItem value="16" className="text-[10px]">Large (16px)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Border Styling */}
      <div className="space-y-2">
        <Label className="text-[10px] font-medium text-foreground">Borders</Label>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-[9px] text-muted-foreground">Style</Label>
            <Select 
              value={tableStyles.borderStyle || 'horizontal'} 
              onValueChange={(val) => updateTableStyles({ borderStyle: val })}
            >
              <SelectTrigger className="h-6 text-[10px] bg-muted">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover z-50">
                <SelectItem value="none" className="text-[10px]">None</SelectItem>
                <SelectItem value="horizontal" className="text-[10px]">Horizontal</SelectItem>
                <SelectItem value="full" className="text-[10px]">Full Grid</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-[9px] text-muted-foreground">Color</Label>
            <ColorPicker
              value={tableStyles.borderColor || 'hsl(var(--border))'}
              onChange={(val) => updateTableStyles({ borderColor: val })}
            />
          </div>
        </div>
      </div>

      {/* Options */}
      <div className="space-y-2">
        <Label className="text-[10px] font-medium text-foreground">Options</Label>
        <div className="space-y-1.5">
          <label className="flex items-center gap-2 text-[10px]">
            <Checkbox
              checked={tableStyles.striped || false}
              onCheckedChange={(checked) => updateTableStyles({ striped: !!checked })}
              className="h-3.5 w-3.5"
            />
            Striped rows
          </label>
          <label className="flex items-center gap-2 text-[10px]">
            <Checkbox
              checked={tableStyles.hoverable || false}
              onCheckedChange={(checked) => updateTableStyles({ hoverable: !!checked })}
              className="h-3.5 w-3.5"
            />
            Hover effect
          </label>
          <label className="flex items-center gap-2 text-[10px]">
            <Checkbox
              checked={tableStyles.bordered || false}
              onCheckedChange={(checked) => updateTableStyles({ bordered: !!checked })}
              className="h-3.5 w-3.5"
            />
            Full borders
          </label>
        </div>
      </div>

      {/* Container Style */}
      <div className="space-y-2">
        <Label className="text-[10px] font-medium text-foreground">Container</Label>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-[9px] text-muted-foreground">Corner Radius</Label>
            <Select 
              value={tableStyles.outerBorderRadius || '8'} 
              onValueChange={(val) => updateTableStyles({ outerBorderRadius: val })}
            >
              <SelectTrigger className="h-6 text-[10px] bg-muted">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover z-50">
                <SelectItem value="0" className="text-[10px]">None</SelectItem>
                <SelectItem value="4" className="text-[10px]">Small</SelectItem>
                <SelectItem value="8" className="text-[10px]">Medium</SelectItem>
                <SelectItem value="12" className="text-[10px]">Large</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-[9px] text-muted-foreground">Shadow</Label>
            <Select 
              value={tableStyles.tableShadow || 'none'} 
              onValueChange={(val) => updateTableStyles({ tableShadow: val })}
            >
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
