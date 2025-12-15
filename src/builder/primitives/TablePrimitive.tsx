import React from 'react';
import { ComponentInstance } from '../store/types';
import { EditableText } from '../components/EditableText';

interface TablePrimitiveProps {
  instance: ComponentInstance;
  isSelected: boolean;
  onUpdateProp: (key: string, value: any) => void;
}

export const TablePrimitive: React.FC<TablePrimitiveProps> = ({
  instance,
  isSelected,
  onUpdateProp,
}) => {
  const rows = instance.props?.rows || 3;
  const columns = instance.props?.columns || 3;
  const headers = instance.props?.headers || Array(columns).fill('').map((_, i) => `Column ${i + 1}`);
  const styles = instance.props?.tableStyles || {};

  // Normalize data: handle both 2D string arrays and arrays of objects
  const rawData = instance.props?.data;
  const normalizeData = (): string[][] => {
    if (!rawData) {
      return Array(rows).fill(null).map(() => Array(columns).fill(''));
    }
    
    // If it's already a 2D string array, use it
    if (Array.isArray(rawData) && rawData.length > 0) {
      const firstRow = rawData[0];
      
      // Check if first row is an object (not an array)
      if (firstRow && typeof firstRow === 'object' && !Array.isArray(firstRow)) {
        // Convert array of objects to 2D string array
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

  const data = normalizeData();

  const handleHeaderChange = (colIndex: number, value: string) => {
    const newHeaders = [...headers];
    newHeaders[colIndex] = value;
    onUpdateProp('headers', newHeaders);
  };

  const handleCellChange = (rowIndex: number, colIndex: number, value: string) => {
    const newData = data.map((row: string[]) => [...row]);
    newData[rowIndex][colIndex] = value;
    onUpdateProp('data', newData);
  };

  // Style calculations
  const shadowMap: Record<string, string> = {
    none: 'none',
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  };

  const borderStyle = styles.borderStyle || 'horizontal';
  const borderColor = styles.borderColor || 'hsl(var(--border))';
  const borderWidth = styles.borderWidth || '1';

  const getCellBorderStyle = (isLastCol: boolean, isLastRow: boolean) => {
    const result: React.CSSProperties = {};
    
    switch (borderStyle) {
      case 'none':
        break;
      case 'horizontal':
        if (!isLastRow) {
          result.borderBottom = `${borderWidth}px solid ${borderColor}`;
        }
        break;
      case 'vertical':
        if (!isLastCol) {
          result.borderRight = `${borderWidth}px solid ${borderColor}`;
        }
        break;
      case 'full':
        result.border = `${borderWidth}px solid ${borderColor}`;
        break;
    }
    
    return result;
  };

  const cellPadding = styles.compact ? '8px' : (styles.cellPadding ? `${styles.cellPadding}px` : '12px');

  return (
    <div
      style={{
        width: '100%',
        overflow: 'auto',
        backgroundColor: styles.tableBackground || 'transparent',
        borderRadius: styles.outerBorderRadius ? `${styles.outerBorderRadius}px` : '0',
        boxShadow: shadowMap[styles.tableShadow || 'none'],
        maxHeight: styles.maxHeight ? `${styles.maxHeight}px` : undefined,
      }}
    >
      <table
        style={{
          width: '100%',
          borderCollapse: styles.borderStyle === 'full' ? 'collapse' : 'separate',
          borderSpacing: 0,
        }}
      >
        <thead
          style={{
            position: styles.stickyHeader ? 'sticky' : undefined,
            top: styles.stickyHeader ? 0 : undefined,
            zIndex: styles.stickyHeader ? 10 : undefined,
          }}
        >
          <tr>
            {headers.map((header: string, colIndex: number) => (
              <th
                key={colIndex}
                style={{
                  padding: cellPadding,
                  backgroundColor: styles.headerBackground || 'hsl(var(--muted))',
                  color: styles.headerTextColor || 'hsl(var(--foreground))',
                  fontWeight: styles.headerFontWeight || '600',
                  fontSize: styles.headerFontSize ? `${styles.headerFontSize}px` : '14px',
                  textAlign: 'left',
                  ...getCellBorderStyle(colIndex === headers.length - 1, false),
                }}
              >
                <EditableText
                  value={header}
                  onChange={(value) => handleHeaderChange(colIndex, value)}
                  as="span"
                  className="font-medium"
                  isSelected={isSelected}
                />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row: string[], rowIndex: number) => (
            <tr
              key={rowIndex}
              style={{
                backgroundColor: styles.striped && rowIndex % 2 === 1
                  ? (styles.stripedColor || 'hsl(var(--muted) / 0.5)')
                  : (styles.cellBackground || 'transparent'),
                minHeight: styles.rowHeight ? `${styles.rowHeight}px` : undefined,
                transition: styles.hoverable ? 'background-color 0.15s' : undefined,
              }}
              onMouseEnter={(e) => {
                if (styles.hoverable && styles.hoverColor) {
                  (e.currentTarget as HTMLElement).style.backgroundColor = styles.hoverColor;
                }
              }}
              onMouseLeave={(e) => {
                if (styles.hoverable) {
                  (e.currentTarget as HTMLElement).style.backgroundColor = 
                    styles.striped && rowIndex % 2 === 1
                      ? (styles.stripedColor || 'hsl(var(--muted) / 0.5)')
                      : (styles.cellBackground || 'transparent');
                }
              }}
            >
              {row.map((cell: string, colIndex: number) => (
                <td
                  key={colIndex}
                  style={{
                    padding: cellPadding,
                    color: styles.cellTextColor || 'hsl(var(--foreground))',
                    fontSize: styles.cellFontSize ? `${styles.cellFontSize}px` : '14px',
                    ...getCellBorderStyle(colIndex === row.length - 1, rowIndex === data.length - 1),
                  }}
                >
                  <EditableText
                    value={cell}
                    onChange={(value) => handleCellChange(rowIndex, colIndex, value)}
                    as="span"
                    isSelected={isSelected}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
