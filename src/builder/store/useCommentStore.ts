import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CommentReply {
  id: string;
  content: string;
  author: string;
  createdAt: string;
}

export interface Comment {
  id: string;
  pageId: string;
  x: number; // Position on canvas (percentage)
  y: number;
  content: string;
  author: string;
  createdAt: string;
  status: 'active' | 'resolved';
  replies: CommentReply[];
}

interface CommentStore {
  comments: Record<string, Comment>;
  commentsVisible: boolean;
  isAddingComment: boolean;
  
  addComment: (comment: Omit<Comment, 'id'>) => string;
  updateComment: (id: string, updates: Partial<Comment>) => void;
  resolveComment: (id: string) => void;
  unresolveComment: (id: string) => void;
  deleteComment: (id: string) => void;
  addReply: (commentId: string, reply: Omit<CommentReply, 'id'>) => void;
  
  toggleCommentsVisibility: () => void;
  setCommentsVisible: (visible: boolean) => void;
  setIsAddingComment: (isAdding: boolean) => void;
  
  getPageComments: (pageId: string) => Comment[];
  getActiveComments: (pageId: string) => Comment[];
  getResolvedComments: (pageId: string) => Comment[];
}

const generateId = () => Math.random().toString(36).substring(2, 11);

export const useCommentStore = create<CommentStore>()(
  persist(
    (set, get) => ({
      comments: {},
      commentsVisible: true,
      isAddingComment: false,
      
      addComment: (comment) => {
        const id = generateId();
        set((state) => ({
          comments: {
            ...state.comments,
            [id]: { ...comment, id },
          },
        }));
        return id;
      },
      
      updateComment: (id, updates) => {
        set((state) => ({
          comments: {
            ...state.comments,
            [id]: state.comments[id] ? { ...state.comments[id], ...updates } : state.comments[id],
          },
        }));
      },
      
      resolveComment: (id) => {
        set((state) => ({
          comments: {
            ...state.comments,
            [id]: state.comments[id] ? { ...state.comments[id], status: 'resolved' } : state.comments[id],
          },
        }));
      },
      
      unresolveComment: (id) => {
        set((state) => ({
          comments: {
            ...state.comments,
            [id]: state.comments[id] ? { ...state.comments[id], status: 'active' } : state.comments[id],
          },
        }));
      },
      
      deleteComment: (id) => {
        set((state) => {
          const { [id]: removed, ...rest } = state.comments;
          return { comments: rest };
        });
      },
      
      addReply: (commentId, reply) => {
        const replyId = generateId();
        set((state) => ({
          comments: {
            ...state.comments,
            [commentId]: state.comments[commentId]
              ? {
                  ...state.comments[commentId],
                  replies: [...state.comments[commentId].replies, { ...reply, id: replyId }],
                }
              : state.comments[commentId],
          },
        }));
      },
      
      toggleCommentsVisibility: () => {
        set((state) => ({ commentsVisible: !state.commentsVisible }));
      },
      
      setCommentsVisible: (visible) => {
        set({ commentsVisible: visible });
      },
      
      setIsAddingComment: (isAdding) => {
        set({ isAddingComment: isAdding });
      },
      
      getPageComments: (pageId) => {
        return Object.values(get().comments).filter((c) => c.pageId === pageId);
      },
      
      getActiveComments: (pageId) => {
        return Object.values(get().comments).filter((c) => c.pageId === pageId && c.status === 'active');
      },
      
      getResolvedComments: (pageId) => {
        return Object.values(get().comments).filter((c) => c.pageId === pageId && c.status === 'resolved');
      },
    }),
    {
      name: 'builder-comments-storage',
    }
  )
);
