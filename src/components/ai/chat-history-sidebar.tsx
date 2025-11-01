'use client';

import { useChatHistoryStore } from '@/lib/stores/chat-history-store';
import { useConfirm } from '@/lib/hooks/use-confirm';
import { ConfirmDialog } from '@/components/common/confirm-dialog';
import { Button } from '@/components/ui/button';
import { Trash2, Plus, MessageSquare } from 'lucide-react';
import clsx from 'clsx';

export function ChatHistorySidebar() {
  const {
    getAllConversations,
    currentConversationId,
    loadConversation,
    deleteConversation,
    createConversation,
  } = useChatHistoryStore();
  const { isOpen, title, message, confirmLabel, cancelLabel, type, handleConfirm, handleCancel, confirm } = useConfirm();
  const conversations = getAllConversations();

  const handleNewChat = () => {
    createConversation(`Chat ${new Date().toLocaleString()}`);
  };

  const handleDelete = async (e: React.MouseEvent, conversationId: string) => {
    e.stopPropagation();
    const confirmed = await confirm({
      title: 'Delete Conversation',
      message: 'Are you sure you want to delete this conversation? This action cannot be undone.',
      confirmLabel: 'Delete',
      cancelLabel: 'Cancel',
      type: 'danger',
    });

    if (confirmed) {
      deleteConversation(conversationId);
    }
  };

  return (
    <>
      <div className="w-64 bg-black-950 border-r border-black h-full overflow-y-auto flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-black">
        <Button
          onClick={handleNewChat}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Chat
        </Button>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {conversations.length === 0 ? (
          <p className="text-xs text-gray-500 p-4 text-center">No conversations yet</p>
        ) : (
          conversations.map((conversation) => (
            <div
              key={conversation.id}
              onClick={() => loadConversation(conversation.id)}
              className={clsx(
                'p-3 rounded-lg cursor-pointer group transition-colors border',
                currentConversationId === conversation.id
                  ? 'bg-purple-900 border-purple-500 text-white'
                  : 'bg-black-900 border-black text-gray-300 hover:bg-black-800'
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <MessageSquare className="w-4 h-4 shrink-0" />
                    <p className="text-sm font-medium truncate">{conversation.title}</p>
                  </div>
                  <p className="text-xs opacity-75 truncate">
                    {conversation.messages.length} messages
                  </p>
                  <p className="text-xs opacity-60 mt-1">
                    {new Date(conversation.updated_at).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={(e) => handleDelete(e, conversation.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-300 shrink-0"
                  title="Delete conversation"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>

    {/* Confirm Dialog */}
    <ConfirmDialog
      isOpen={isOpen}
      title={title}
      message={message}
      confirmLabel={confirmLabel}
      cancelLabel={cancelLabel}
      type={type}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
    />
    </>
  );
}
