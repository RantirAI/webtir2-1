import React from 'react';
import { Plus, X, ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ComponentInstance } from '../../store/types';
import { useBuilderStore } from '../../store/useBuilderStore';

interface TableDataEditorProps {
  instance: ComponentInstance;
}

export const TableDataEditor: React.FC<TableDataEditorProps> = ({ instance }) => {
  const { updateInstance } = useBuilderStore();
  
  const rows = instance.props?.rows || 3;
  const columns = instance.props?.columns || 3;
  const headers: string[] = instance.props?.headers || Array(columns).fill('').map((_, i) => `Column ${i + 1}`);
  const data: string[][] = instance.props?.data || Array(rows).fill(null).map(() => Array(columns).fill(''));

  const updateProps = (updates: Record<string, any>) => {
    updateInstance(instance.id, {
      props: { ...instance.props, ...updates }
    });
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
    <div className="space-y-3">
      {/* Controls */}
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

      {/* Headers */}
      <div className="space-y-1">
        <label className="text-[10px] font-medium text-foreground">Headers</label>
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
        <label className="text-[10px] font-medium text-foreground">Data ({rows} rows)</label>
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
