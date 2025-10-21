import React from 'react';
import { ComponentInstance } from '../store/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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
  const data = instance.props?.data || Array(rows).fill(null).map(() => Array(columns).fill(''));

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

  return (
    <div className="w-full overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            {headers.map((header: string, colIndex: number) => (
              <TableHead key={colIndex}>
                <EditableText
                  value={header}
                  onChange={(value) => handleHeaderChange(colIndex, value)}
                  as="span"
                  className="font-medium"
                  isSelected={isSelected}
                />
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row: string[], rowIndex: number) => (
            <TableRow key={rowIndex}>
              {row.map((cell: string, colIndex: number) => (
                <TableCell key={colIndex}>
                  <EditableText
                    value={cell}
                    onChange={(value) => handleCellChange(rowIndex, colIndex, value)}
                    as="span"
                    isSelected={isSelected}
                  />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
