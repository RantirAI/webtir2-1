import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ComponentInstance } from '../store/types';
import { usePrebuiltStore } from '../store/usePrebuiltStore';
import { toast } from 'sonner';

interface SavePrebuiltDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  instance: ComponentInstance | null;
}

export const SavePrebuiltDialog: React.FC<SavePrebuiltDialogProps> = ({
  open,
  onOpenChange,
  instance,
}) => {
  const [name, setName] = useState('');
  const { addPrebuilt, markAsPrebuilt } = usePrebuiltStore();

  const handleSave = () => {
    if (!instance) return;
    if (!name.trim()) {
      toast.error('Please enter a name for the component');
      return;
    }

    addPrebuilt(name.trim(), instance);
    markAsPrebuilt(instance.id);
    toast.success(`"${name.trim()}" saved as prebuilt component`);
    setName('');
    onOpenChange(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Save as Prebuilt Component</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Component Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter component name..."
              autoFocus
            />
          </div>
          {instance && (
            <p className="text-sm text-muted-foreground">
              Saving "{instance.label || instance.type}" as a reusable prebuilt component.
            </p>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!name.trim()}>
            Save Component
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
