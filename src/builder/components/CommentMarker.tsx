import React, { useState } from 'react';
import { Comment, useCommentStore } from '../store/useCommentStore';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle2, RotateCcw, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface CommentMarkerProps {
  comment: Comment;
  index: number;
}

export const CommentMarker: React.FC<CommentMarkerProps> = ({ comment, index }) => {
  const { resolveComment, unresolveComment, deleteComment, addReply } = useCommentStore();
  const [replyContent, setReplyContent] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const handleReply = () => {
    if (replyContent.trim()) {
      addReply(comment.id, {
        content: replyContent,
        author: 'You',
        createdAt: new Date().toISOString(),
      });
      setReplyContent('');
    }
  };

  const isResolved = comment.status === 'resolved';

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          className={`absolute z-50 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold cursor-pointer transition-all hover:scale-110 shadow-lg ${
            isResolved
              ? 'bg-green-500 text-white'
              : 'bg-primary text-primary-foreground'
          }`}
          style={{
            left: `${comment.x}%`,
            top: `${comment.y}%`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          {index + 1}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-2" align="start">
        <div className="space-y-1.5">
          {/* Header with author, time, and action icons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-medium">{comment.author}</span>
              <span className="text-[9px] text-muted-foreground">
                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
              </span>
            </div>
            <div className="flex items-center gap-0.5">
              {isResolved ? (
                <button
                  onClick={() => unresolveComment(comment.id)}
                  className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground"
                  title="Reopen"
                >
                  <RotateCcw className="w-3 h-3" />
                </button>
              ) : (
                <button
                  onClick={() => resolveComment(comment.id)}
                  className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-green-600"
                  title="Resolve"
                >
                  <CheckCircle2 className="w-3 h-3" />
                </button>
              )}
              <button
                onClick={() => {
                  deleteComment(comment.id);
                  setIsOpen(false);
                }}
                className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-destructive"
                title="Delete"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>
          
          {/* Comment content */}
          <p className="text-[11px] text-muted-foreground leading-relaxed">{comment.content}</p>

          {/* Replies */}
          {comment.replies.length > 0 && (
            <div className="pl-2 border-l border-border/50 space-y-1 mt-1.5">
              {comment.replies.map((reply) => (
                <div key={reply.id}>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] font-medium">{reply.author}</span>
                    <span className="text-[9px] text-muted-foreground">
                      {formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground">{reply.content}</p>
                </div>
              ))}
            </div>
          )}

          {/* Reply input */}
          <div className="flex gap-1 pt-1">
            <Textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Reply..."
              className="min-h-[32px] text-[10px] resize-none py-1.5 px-2"
            />
            <Button 
              size="sm" 
              className="h-8 w-8 p-0 shrink-0" 
              onClick={handleReply}
              disabled={!replyContent.trim()}
            >
              <span className="text-[10px]">↵</span>
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
