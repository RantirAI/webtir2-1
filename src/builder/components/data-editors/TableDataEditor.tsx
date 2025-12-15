import React from 'react';
import { Plus, X, ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ComponentInstance } from '../../store/types';
import { useBuilderStore } from '../../store/useBuilderStore';

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
  const { updateInstance } = useBuilderStore();
  
  const rows = instance.props?.rows || 3;
  const columns = instance.props?.columns || 3;
  const headers: string[] = instance.props?.headers || Array(columns).fill('').map((_, i) => `Column ${i + 1}`);
  const currentTemplate = instance.props?.tableStyles?.template || '';

  // Normalize data: handle both 2D string arrays and arrays of objects
  const normalizeData = (): string[][] => {
    const rawData = instance.props?.data;
    if (!rawData) {
      return Array(rows).fill(null).map(() => Array(columns).fill(''));
    }
    
    if (Array.isArray(rawData) && rawData.length > 0) {
      const firstRow = rawData[0];
      
      // Check if first row is an object (not an array)
      if (firstRow && typeof firstRow === 'object' && !Array.isArray(firstRow)) {
        const keys = Object.keys(firstRow);
        return rawData.map((obj: any) => 
          keys.map(key => String(obj[key] ?? ''))
        );
      }
      
      // Check if first row is an array
      if (Array.isArray(firstRow)) {
        return rawData.map((row: any[]) => 
          row.map(cell => typeof cell === 'object' ? JSON.stringify(cell) : String(cell ?? ''))
        );
      }
    }
    
    return Array(rows).fill(null).map(() => Array(columns).fill(''));
  };

  const data: string[][] = normalizeData();

  const updateProps = (updates: Record<string, any>) => {
    updateInstance(instance.id, {
      props: { ...instance.props, ...updates }
    });
  };

  const applyTemplate = (templateId: string) => {
    const templateStyle = templateStyles[templateId];
    if (templateStyle) {
      updateInstance(instance.id, {
        props: {
          ...instance.props,
          tableStyles: { ...instance.props?.tableStyles, ...templateStyle, template: templateId }
        }
      });
    }
  };

  const addColumn = () => {
    const newHeaders = [...headers, `Column ${headers.length + 1}`];
    const newData = data.map(row => [...row, '']);
    updateProps({ headers: newHeaders, data: newData, columns: columns + 1 });
  };

  const removeColumn = (colIndex: number) => {
    if (columns <= 1) return;
    const newHeaders = headers.filter((_, i) => i !== colIndex);
    const newData = data.map(row => row.filter((_, i) => i !== colIndex));
    updateProps({ headers: newHeaders, data: newData, columns: columns - 1 });
  };

  const addRow = () => {
    const newRow = Array(columns).fill('');
    updateProps({ data: [...data, newRow], rows: rows + 1 });
  };

  const removeRow = (rowIndex: number) => {
    if (rows <= 1) return;
    const newData = data.filter((_, i) => i !== rowIndex);
    updateProps({ data: newData, rows: rows - 1 });
  };

  const updateHeader = (colIndex: number, value: string) => {
    const newHeaders = [...headers];
    newHeaders[colIndex] = value;
    updateProps({ headers: newHeaders });
  };

  const updateCell = (rowIndex: number, colIndex: number, value: string) => {
    const newData = data.map((row, ri) =>
      ri === rowIndex ? row.map((cell, ci) => ci === colIndex ? value : cell) : row
    );
    updateProps({ data: newData });
  };

  const moveRow = (fromIndex: number, direction: 'up' | 'down') => {
    const toIndex = direction === 'up' ? fromIndex - 1 : fromIndex + 1;
    if (toIndex < 0 || toIndex >= data.length) return;
    const newData = [...data];
    [newData[fromIndex], newData[toIndex]] = [newData[toIndex], newData[fromIndex]];
    updateProps({ data: newData });
  };

  return (
    <div className="space-y-4">
      {/* Template Selection */}
      <div className="space-y-1.5">
        <Label className="text-[10px] font-medium text-foreground">Template</Label>
        <Select value={currentTemplate} onValueChange={applyTemplate}>
          <SelectTrigger className="h-7 text-[11px] bg-background border-border">
            <SelectValue placeholder="Choose a template..." />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border z-50">
            {prebuiltTemplates.map(template => (
              <SelectItem key={template.value} value={template.value} className="text-[11px]">
                {template.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Settings */}
      <div className="space-y-2">
        <Label className="text-[10px] font-medium text-foreground">Settings</Label>
        <div className="grid grid-cols-2 gap-2">
          <label className="flex items-center gap-2 text-[10px]">
            <Checkbox
              checked={instance.props?.tableStyles?.striped ?? false}
              onCheckedChange={(checked) => updateInstance(instance.id, {
                props: { ...instance.props, tableStyles: { ...instance.props?.tableStyles, striped: !!checked } }
              })}
              className="h-3.5 w-3.5"
            />
            Striped rows
          </label>
          <label className="flex items-center gap-2 text-[10px]">
            <Checkbox
              checked={instance.props?.tableStyles?.hoverable ?? false}
              onCheckedChange={(checked) => updateInstance(instance.id, {
                props: { ...instance.props, tableStyles: { ...instance.props?.tableStyles, hoverable: !!checked } }
              })}
              className="h-3.5 w-3.5"
            />
            Hoverable rows
          </label>
          <label className="flex items-center gap-2 text-[10px]">
            <Checkbox
              checked={instance.props?.tableStyles?.bordered ?? false}
              onCheckedChange={(checked) => updateInstance(instance.id, {
                props: { ...instance.props, tableStyles: { ...instance.props?.tableStyles, bordered: !!checked } }
              })}
              className="h-3.5 w-3.5"
            />
            Full borders
          </label>
          <label className="flex items-center gap-2 text-[10px]">
            <Checkbox
              checked={instance.props?.tableStyles?.compact ?? false}
              onCheckedChange={(checked) => updateInstance(instance.id, {
                props: { ...instance.props, tableStyles: { ...instance.props?.tableStyles, compact: !!checked } }
              })}
              className="h-3.5 w-3.5"
            />
            Compact
          </label>
          <label className="flex items-center gap-2 text-[10px]">
            <Checkbox
              checked={instance.props?.tableStyles?.stickyHeader ?? false}
              onCheckedChange={(checked) => updateInstance(instance.id, {
                props: { ...instance.props, tableStyles: { ...instance.props?.tableStyles, stickyHeader: !!checked } }
              })}
              className="h-3.5 w-3.5"
            />
            Sticky header
          </label>
        </div>
      </div>

      {/* Controls */}
      <div className="space-y-2">
        <Label className="text-[10px] font-medium text-foreground">Structure</Label>
        <div className="flex items-center gap-2">
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
        </div>
      </div>

      {/* Headers */}
      <div className="space-y-1">
        <Label className="text-[10px] font-medium text-foreground">Headers</Label>
        <div className="flex flex-wrap gap-1">
          {headers.map((header, colIndex) => (
            <div key={colIndex} className="flex items-center gap-0.5">
              <Input
                value={header}
                onChange={(e) => updateHeader(colIndex, e.target.value)}
                className="h-5 text-[9px] w-20"
                placeholder={`Col ${colIndex + 1}`}
              />
              <Button
                size="sm"
                variant="ghost"
                onClick={() => removeColumn(colIndex)}
                className="h-4 w-4 p-0 text-destructive hover:text-destructive"
                disabled={columns <= 1}
              >
                <X className="w-2.5 h-2.5" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Data Rows */}
      <div className="space-y-1">
        <Label className="text-[10px] font-medium text-foreground">Data ({rows} rows)</Label>
        <div className="space-y-1 max-h-[200px] overflow-y-auto">
          {data.map((row, rowIndex) => (
            <div key={rowIndex} className="flex items-center gap-1 p-1.5 rounded border border-border bg-muted/30">
              <div className="flex flex-col gap-0.5">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => moveRow(rowIndex, 'up')}
                  className="h-3 w-3 p-0"
                  disabled={rowIndex === 0}
                >
                  <ArrowUp className="w-2 h-2" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => moveRow(rowIndex, 'down')}
                  className="h-3 w-3 p-0"
                  disabled={rowIndex === data.length - 1}
                >
                  <ArrowDown className="w-2 h-2" />
                </Button>
              </div>
              <span className="text-[9px] text-muted-foreground w-4">{rowIndex + 1}</span>
              <div className="flex-1 flex flex-wrap gap-1">
                {row.map((cell, colIndex) => (
                  <Input
                    key={colIndex}
                    value={cell}
                    onChange={(e) => updateCell(rowIndex, colIndex, e.target.value)}
                    className="h-5 text-[9px] w-20"
                    placeholder={headers[colIndex] || `Cell`}
                  />
                ))}
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => removeRow(rowIndex)}
                className="h-4 w-4 p-0 text-destructive hover:text-destructive"
                disabled={rows <= 1}
              >
                <X className="w-2.5 h-2.5" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
