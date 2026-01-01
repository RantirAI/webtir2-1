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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-sm">Add Comment</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your comment..."
            className="min-h-[100px] resize-none"
            autoFocus
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!content.trim()}>
            Add Comment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
