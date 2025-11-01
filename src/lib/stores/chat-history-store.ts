import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AIMessage, AIConversation } from '@/types/ai';

interface ChatHistoryStore {
  conversations: AIConversation[];
  currentConversationId: string | null;
  currentMessages: AIMessage[];
  
  // Actions
  createConversation: (title: string, initialMessages?: AIMessage[]) => void;
  addMessage: (message: AIMessage) => void;
  clearCurrentMessages: () => void;
  deleteConversation: (conversationId: string) => void;
  loadConversation: (conversationId: string) => void;
  getCurrentConversation: () => AIConversation | null;
  getAllConversations: () => AIConversation[];
}

const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

export const useChatHistoryStore = create<ChatHistoryStore>()(
  persist(
    (set, get) => ({
      conversations: [],
      currentConversationId: null,
      currentMessages: [
        {
          id: '1',
          role: 'assistant',
          content:
            "Hi! I'm your AI productivity assistant. You can ask me to create tasks, habits, goals, or schedule time blocks. Try saying 'Add a task to finish the project' or 'Create a daily meditation habit'",
          timestamp: new Date().toISOString(),
        },
      ],

      createConversation: (title: string, initialMessages?: AIMessage[]) => {
        const conversationId = generateId();
        const newConversation: AIConversation = {
          id: conversationId,
          user_id: 'default-user',
          title: title || `Chat ${new Date().toLocaleString()}`,
          messages: initialMessages || [
            {
              id: '1',
              role: 'assistant',
              content:
                "Hi! I'm your AI productivity assistant. You can ask me to create tasks, habits, goals, or schedule time blocks. Try saying 'Add a task to finish the project' or 'Create a daily meditation habit'",
              timestamp: new Date().toISOString(),
            },
          ],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        set((state) => ({
          conversations: [newConversation, ...state.conversations],
          currentConversationId: conversationId,
          currentMessages: newConversation.messages,
        }));
      },

      addMessage: (message: AIMessage) => {
        set((state) => {
          const updatedMessages = [...state.currentMessages, message];
          const updatedConversations = state.conversations.map((conv) =>
            conv.id === state.currentConversationId
              ? {
                  ...conv,
                  messages: updatedMessages,
                  updated_at: new Date().toISOString(),
                }
              : conv
          );

          return {
            currentMessages: updatedMessages,
            conversations: updatedConversations,
          };
        });
      },

      clearCurrentMessages: () => {
        set((state) => {
          const initialMessage: AIMessage = {
            id: '1',
            role: 'assistant',
            content:
              "Hi! I'm your AI productivity assistant. You can ask me to create tasks, habits, goals, or schedule time blocks. Try saying 'Add a task to finish the project' or 'Create a daily meditation habit'",
            timestamp: new Date().toISOString(),
          };

          const updatedConversations = state.conversations.map((conv) =>
            conv.id === state.currentConversationId
              ? {
                  ...conv,
                  messages: [initialMessage],
                  updated_at: new Date().toISOString(),
                }
              : conv
          );

          return {
            currentMessages: [initialMessage],
            conversations: updatedConversations,
          };
        });
      },

      deleteConversation: (conversationId: string) => {
        set((state) => {
          const updatedConversations = state.conversations.filter((conv) => conv.id !== conversationId);

          // If we're deleting the current conversation, load the first one
          let newCurrentConversationId = state.currentConversationId;
          let newCurrentMessages = state.currentMessages;

          if (state.currentConversationId === conversationId && updatedConversations.length > 0) {
            newCurrentConversationId = updatedConversations[0].id;
            newCurrentMessages = updatedConversations[0].messages;
          } else if (state.currentConversationId === conversationId) {
            newCurrentConversationId = null;
            newCurrentMessages = [
              {
                id: '1',
                role: 'assistant',
                content:
                  "Hi! I'm your AI productivity assistant. You can ask me to create tasks, habits, goals, or schedule time blocks. Try saying 'Add a task to finish the project' or 'Create a daily meditation habit'",
                timestamp: new Date().toISOString(),
              },
            ];
          }

          return {
            conversations: updatedConversations,
            currentConversationId: newCurrentConversationId,
            currentMessages: newCurrentMessages,
          };
        });
      },

      loadConversation: (conversationId: string) => {
        set((state) => {
          const conversation = state.conversations.find((conv) => conv.id === conversationId);
          return {
            currentConversationId: conversationId,
            currentMessages: conversation?.messages || [],
          };
        });
      },

      getCurrentConversation: () => {
        const state = get();
        return (
          state.conversations.find((conv) => conv.id === state.currentConversationId) || null
        );
      },

      getAllConversations: () => {
        return get().conversations;
      },
    }),
    {
      name: 'chat-history-store',
      version: 1,
    }
  )
);
