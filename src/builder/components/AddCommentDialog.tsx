import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useCommentStore } from '../store/useCommentStore';
import { X } from 'lucide-react';

interface AddCommentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  position: { x: number; y: number } | null;
  pageId: string;
  canvasRef?: HTMLElement | null;
}

export const AddCommentDialog: React.FC<AddCommentDialogProps> = ({
  open,
  onOpenChange,
  position,
  pageId,
  canvasRef,
}) => {
  const [content, setContent] = useState('');
  const { addComment } = useCommentStore();

  const handleSubmit = () => {
    if (content.trim() && position) {
      addComment({
        pageId,
        x: position.x,
        y: position.y,
        content: content.trim(),
        author: 'You',
        createdAt: new Date().toISOString(),
        status: 'active',
        replies: [],
      });
      setContent('');
      onOpenChange(false);
      // Don't call setIsAddingComment(false) - keep comment mode active
    }
  };

  const handleClose = () => {
    setContent('');
    onOpenChange(false);
    // Don't call setIsAddingComment(false) - keep comment mode active
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
    if (e.key === 'Escape') {
      handleClose();
    }
  };

  if (!open || !position) return null;

  return (
    <div
      className="absolute z-[100]"
      style={{
        left: `${position.x}%`,
        top: `${position.y}px`,
        transform: 'translate(-50%, -50%)',
      }}
    >
      {/* Marker at click position */}
      <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shadow-lg">
        +
      </div>
      
      {/* Comment input card - positioned to the right of marker */}
      <div 
        className="absolute left-8 top-1/2 -translate-y-1/2 bg-background border border-border rounded-lg shadow-lg p-2 w-56"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-medium text-foreground">Add Comment</span>
          <button
            onClick={handleClose}
            className="p-0.5 hover:bg-muted rounded text-muted-foreground hover:text-foreground"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Write your comment..."
          className="min-h-[50px] text-[11px] resize-none mb-1.5"
          autoFocus
        />
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="sm" onClick={handleClose} className="h-5 px-2 text-[10px]">
            Cancel
          </Button>
          <Button size="sm" onClick={handleSubmit} disabled={!content.trim()} className="h-5 px-2 text-[10px]">
            Add
          </Button>
        </div>
      </div>
    </div>
  );
};
