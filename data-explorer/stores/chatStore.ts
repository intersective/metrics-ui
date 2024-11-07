import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Message, SerializableMessage } from '@/types/chat';

interface ChatStore {
  messages: SerializableMessage[];
  threadId: string | null;
  isLoading: boolean;
  pendingRequest: {
    message: string;
    timestamp: string;
  } | null;
  addMessage: (message: Message, vizData?: { code: string; data: any }) => void;
  clearMessages: () => void;
  setThreadId: (id: string) => void;
  setPending: (message: string | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set) => ({
      messages: [],
      threadId: null,
      isLoading: false,
      pendingRequest: null,
      addMessage: (message, vizData) => set((state) => ({ 
        messages: [...state.messages, {
          role: message.role,
          content: message.content,
          timestamp: message.timestamp.toISOString(),
          visualizationData: vizData
        }],
        pendingRequest: null
      })),
      clearMessages: () => set({ messages: [], threadId: null, pendingRequest: null }),
      setThreadId: (id) => set({ threadId: id }),
      setPending: (message) => set({ 
        pendingRequest: message ? {
          message,
          timestamp: new Date().toISOString()
        } : null 
      }),
      setLoading: (loading) => set({ isLoading: loading })
    }),
    {
      name: 'chat-storage',
    }
  )
);
