import React, { useState } from 'react';
import { Comment, useCommentStore } from '../store/useCommentStore';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle2, RotateCcw, Send, Trash2 } from 'lucide-react';
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
      <PopoverContent className="w-72 p-3" align="start">
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium">{comment.author}</span>
                <span className="text-[10px] text-muted-foreground">
                  {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                </span>
              </div>
              <p className="text-xs mt-1">{comment.content}</p>
            </div>
          </div>

          {/* Replies */}
          {comment.replies.length > 0 && (
            <div className="pl-3 border-l-2 border-border space-y-2">
              {comment.replies.map((reply) => (
                <div key={reply.id} className="text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{reply.author}</span>
                    <span className="text-[10px] text-muted-foreground">
                      {formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="mt-0.5">{reply.content}</p>
                </div>
              ))}
            </div>
          )}

          {/* Reply input */}
          <div className="flex gap-2">
            <Textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Write a reply..."
              className="min-h-[50px] text-xs resize-none"
            />
            <Button size="sm" className="h-auto px-2" onClick={handleReply}>
              <Send className="w-3 h-3" />
            </Button>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-2 border-t">
            {isResolved ? (
              <Button
                variant="outline"
                size="sm"
                className="flex-1 h-7 text-xs gap-1"
                onClick={() => unresolveComment(comment.id)}
              >
                <RotateCcw className="w-3 h-3" />
                Reopen
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="flex-1 h-7 text-xs gap-1"
                onClick={() => resolveComment(comment.id)}
              >
                <CheckCircle2 className="w-3 h-3" />
                Resolve
              </Button>
            )}
            <Button
              variant="destructive"
              size="sm"
              className="h-7 text-xs gap-1 px-2"
              onClick={() => {
                deleteComment(comment.id);
                setIsOpen(false);
              }}
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
