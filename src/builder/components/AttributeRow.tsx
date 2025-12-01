import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { X, Trash2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface AttributeRowProps {
  name: string;
  value: string;
  instanceId: string;
  onSave: (oldName: string, newName: string, newValue: string) => void;
  onDelete: (name: string) => void;
}

export const AttributeRow: React.FC<AttributeRowProps> = ({
  name,
  value,
  instanceId,
  onSave,
  onDelete,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(name);
  const [editValue, setEditValue] = useState(value);

  const handleSave = () => {
    const sanitizedName = editName.replace(/[^a-zA-Z0-9_-]/g, '');
    if (['id', 'class', 'style', 'classname'].includes(sanitizedName.toLowerCase())) {
      toast({ title: 'Reserved attribute', description: 'Cannot use reserved HTML attributes', variant: 'destructive' });
      return;
    }
    if (!sanitizedName) return;
    
    onSave(name, sanitizedName, editValue);
    setIsEditing(false);
  };

  const handleDelete = () => {
    onDelete(name);
  };

  const handleStartEdit = () => {
    setEditName(name);
    setEditValue(value);
    setIsEditing(true);
  };

  return (
    <div 
      className="group flex items-center gap-1 py-0.5 px-1 bg-muted/30 rounded text-[10px] hover:bg-muted/50"
    >
      {isEditing ? (
        <>
          <Input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            className="h-5 text-[10px] flex-1 px-1"
            placeholder="name"
            autoFocus
          />
          <span className="text-muted-foreground">=</span>
          <Input
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="h-5 text-[10px] flex-1 px-1"
            placeholder="value"
          />
          <Button
            size="sm"
            variant="ghost"
            onClick={handleSave}
            className="h-5 w-5 p-0 text-green-600 hover:text-green-700"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsEditing(false)}
            className="h-5 w-5 p-0"
          >
            <X className="w-2.5 h-2.5" />
          </Button>
        </>
      ) : (
        <>
          <span className="flex-1 truncate font-mono">
            {name}="{value}"
          </span>
          <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 transition-opacity">
            <Button
              size="sm"
              variant="ghost"
              onClick={handleStartEdit}
              className="h-4 w-4 p-0"
            >
              <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleDelete}
              className="h-4 w-4 p-0 text-destructive hover:text-destructive"
            >
              <Trash2 className="w-2.5 h-2.5" />
            </Button>
          </div>
        </>
      )}
    </div>
  );
};
