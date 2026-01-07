import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  mode: 'build' | 'discuss';
  metadata?: {
    componentsCreated?: string[];
    action?: 'create' | 'update' | 'delete';
  };
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
}

const MAX_SESSIONS = 50;
const MAX_MESSAGES_PER_SESSION = 100;

const generateId = () => Math.random().toString(36).substring(2, 11);

const generateTitle = (firstMessage: string): string => {
  const truncated = firstMessage.slice(0, 40);
  return truncated.length < firstMessage.length ? `${truncated}...` : truncated;
};

interface ChatStore {
  sessions: ChatSession[];
  currentSessionId: string | null;

  createSession: () => string;
  addMessage: (message: Omit<ChatMessage, 'id'>) => void;
  updateLastAssistantMessage: (content: string) => void;
  deleteSession: (id: string) => void;
  setCurrentSession: (id: string | null) => void;
  getCurrentSession: () => ChatSession | null;
  clearAllSessions: () => void;
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      sessions: [],
      currentSessionId: null,

      createSession: () => {
        const id = generateId();
        const newSession: ChatSession = {
          id,
          title: 'New Chat',
          messages: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        set((state) => {
          let sessions = [newSession, ...state.sessions];
          // Prune old sessions if over limit
          if (sessions.length > MAX_SESSIONS) {
            sessions = sessions.slice(0, MAX_SESSIONS);
          }
          return {
            sessions,
            currentSessionId: id,
          };
        });

        return id;
      },

      addMessage: (message) => {
        const state = get();
        let sessionId = state.currentSessionId;

        // Create a new session if none exists
        if (!sessionId) {
          sessionId = get().createSession();
        }

        const newMessage: ChatMessage = {
          ...message,
          id: generateId(),
        };

        set((state) => ({
          sessions: state.sessions.map((session) => {
            if (session.id !== sessionId) return session;

            let messages = [...session.messages, newMessage];
            // Prune old messages if over limit
            if (messages.length > MAX_MESSAGES_PER_SESSION) {
              messages = messages.slice(-MAX_MESSAGES_PER_SESSION);
            }

            // Update title from first user message
            const title =
              session.messages.length === 0 && message.role === 'user'
                ? generateTitle(message.content)
                : session.title;

            return {
              ...session,
              messages,
              title,
              updatedAt: Date.now(),
            };
          }),
        }));
      },

      updateLastAssistantMessage: (content) => {
        const state = get();
        const sessionId = state.currentSessionId;
        if (!sessionId) return;

        set((state) => ({
          sessions: state.sessions.map((session) => {
            if (session.id !== sessionId) return session;

            const messages = [...session.messages];
            const lastIndex = messages.length - 1;

            if (lastIndex >= 0 && messages[lastIndex].role === 'assistant') {
              messages[lastIndex] = {
                ...messages[lastIndex],
                content,
              };
            } else {
              // Create new assistant message if last isn't assistant
              messages.push({
                id: generateId(),
                role: 'assistant',
                content,
                timestamp: Date.now(),
                mode: 'build',
              });
            }

            return {
              ...session,
              messages,
              updatedAt: Date.now(),
            };
          }),
        }));
      },

      deleteSession: (id) => {
        set((state) => {
          const sessions = state.sessions.filter((s) => s.id !== id);
          const currentSessionId =
            state.currentSessionId === id
              ? sessions[0]?.id || null
              : state.currentSessionId;

          return { sessions, currentSessionId };
        });
      },

      setCurrentSession: (id) => {
        set({ currentSessionId: id });
      },

      getCurrentSession: () => {
        const state = get();
        return state.sessions.find((s) => s.id === state.currentSessionId) || null;
      },

      clearAllSessions: () => {
        set({ sessions: [], currentSessionId: null });
      },
    }),
    {
      name: 'builder-chat-history',
    }
  )
);
