import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useCommentStore } from '../store/useCommentStore';

interface AddCommentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  position: { x: number; y: number };
  pageId: string;
}

export const AddCommentDialog: React.FC<AddCommentDialogProps> = ({
  open,
  onOpenChange,
  position,
  pageId,
}) => {
  const [content, setContent] = useState('');
  const { addComment, setIsAddingComment } = useCommentStore();

  const handleSubmit = () => {
    if (content.trim()) {
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
      setIsAddingComment(false);
    }
  };

  const handleClose = () => {
    setContent('');
    onOpenChange(false);
    setIsAddingComment(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[280px] p-3 gap-2">
        <DialogHeader className="pb-0">
          <DialogTitle className="text-xs font-medium">Add Comment</DialogTitle>
        </DialogHeader>
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your comment..."
          className="min-h-[60px] text-xs resize-none"
          autoFocus
        />
        <DialogFooter className="gap-1.5 sm:gap-1.5">
          <Button variant="ghost" size="sm" onClick={handleClose} className="h-6 px-2 text-xs">
            Cancel
          </Button>
          <Button size="sm" onClick={handleSubmit} disabled={!content.trim()} className="h-6 px-2 text-xs">
            Add
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
