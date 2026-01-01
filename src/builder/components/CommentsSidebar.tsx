import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useCommentStore, Comment } from '../store/useCommentStore';
import { usePageStore } from '../store/usePageStore';
import { MessageCircle, CheckCircle2, RotateCcw, Send, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface CommentCardProps {
  comment: Comment;
  onResolve: () => void;
  onUnresolve: () => void;
  onDelete: () => void;
  onReply: (content: string) => void;
}

const CommentCard: React.FC<CommentCardProps> = ({ 
  comment, 
  onResolve, 
  onUnresolve, 
  onDelete,
  onReply 
}) => {
  const [replyContent, setReplyContent] = useState('');
  const [showReplyInput, setShowReplyInput] = useState(false);

  const handleReply = () => {
    if (replyContent.trim()) {
      onReply(replyContent);
      setReplyContent('');
      setShowReplyInput(false);
    }
  };

  return (
    <div className="p-3 border border-border rounded-lg bg-background/50 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-foreground truncate">{comment.author}</span>
            <span className="text-[10px] text-muted-foreground">
              {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
            </span>
          </div>
          <p className="text-xs text-foreground mt-1">{comment.content}</p>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {comment.status === 'active' ? (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={onResolve}
              title="Resolve"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={onUnresolve}
              title="Reopen"
            >
              <RotateCcw className="w-3.5 h-3.5 text-yellow-500" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={onDelete}
            title="Delete"
          >
            <Trash2 className="w-3.5 h-3.5 text-destructive" />
          </Button>
        </div>
      </div>

      {/* Replies */}
      {comment.replies.length > 0 && (
        <div className="pl-3 border-l-2 border-border space-y-2 mt-2">
          {comment.replies.map((reply) => (
            <div key={reply.id} className="text-xs">
              <div className="flex items-center gap-2">
                <span className="font-medium">{reply.author}</span>
                <span className="text-[10px] text-muted-foreground">
                  {formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}
                </span>
              </div>
              <p className="text-foreground mt-0.5">{reply.content}</p>
            </div>
          ))}
        </div>
      )}

      {/* Reply input */}
      {showReplyInput ? (
        <div className="flex gap-2 mt-2">
          <Textarea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder="Write a reply..."
            className="min-h-[60px] text-xs resize-none"
          />
          <div className="flex flex-col gap-1">
            <Button size="sm" className="h-7 px-2" onClick={handleReply}>
              <Send className="w-3 h-3" />
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              className="h-7 px-2"
              onClick={() => setShowReplyInput(false)}
            >
              ✕
            </Button>
          </div>
        </div>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          className="h-6 text-xs px-2"
          onClick={() => setShowReplyInput(true)}
        >
          Reply
        </Button>
      )}
    </div>
  );
};

export const CommentsSidebar: React.FC = () => {
  const { currentPageId } = usePageStore();
  const { 
    getActiveComments, 
    getResolvedComments, 
    resolveComment, 
    unresolveComment,
    deleteComment,
    addReply 
  } = useCommentStore();

  const activeComments = getActiveComments(currentPageId);
  const resolvedComments = getResolvedComments(currentPageId);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <Tabs defaultValue="active" className="flex-1 flex flex-col">
        <TabsList className="w-full grid grid-cols-2 rounded-none border-b bg-transparent h-10 p-1 gap-1 flex-shrink-0">
          <TabsTrigger
            value="active"
            className="gap-1 text-xs h-full rounded-md data-[state=active]:bg-[#F5F5F5] dark:data-[state=active]:bg-zinc-800 data-[state=active]:shadow-none"
          >
            <MessageCircle className="w-3 h-3" />
            Active ({activeComments.length})
          </TabsTrigger>
          <TabsTrigger
            value="resolved"
            className="gap-1 text-xs h-full rounded-md data-[state=active]:bg-[#F5F5F5] dark:data-[state=active]:bg-zinc-800 data-[state=active]:shadow-none"
          >
            <CheckCircle2 className="w-3 h-3" />
            Resolved ({resolvedComments.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="flex-1 m-0 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-2 space-y-2">
              {activeComments.length === 0 ? (
                <div className="text-xs text-muted-foreground text-center py-8">
                  No active comments
                </div>
              ) : (
                activeComments.map((comment) => (
                  <CommentCard
                    key={comment.id}
                    comment={comment}
                    onResolve={() => resolveComment(comment.id)}
                    onUnresolve={() => unresolveComment(comment.id)}
                    onDelete={() => deleteComment(comment.id)}
                    onReply={(content) => addReply(comment.id, {
                      content,
                      author: 'You',
                      createdAt: new Date().toISOString(),
                    })}
                  />
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="resolved" className="flex-1 m-0 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-2 space-y-2">
              {resolvedComments.length === 0 ? (
                <div className="text-xs text-muted-foreground text-center py-8">
                  No resolved comments
                </div>
              ) : (
                resolvedComments.map((comment) => (
                  <CommentCard
                    key={comment.id}
                    comment={comment}
                    onResolve={() => resolveComment(comment.id)}
                    onUnresolve={() => unresolveComment(comment.id)}
                    onDelete={() => deleteComment(comment.id)}
                    onReply={(content) => addReply(comment.id, {
                      content,
                      author: 'You',
                      createdAt: new Date().toISOString(),
                    })}
                  />
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
};
