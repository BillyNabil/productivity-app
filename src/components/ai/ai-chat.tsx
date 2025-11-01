'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useVoiceInput } from '@/lib/hooks/useVoice';
import { useConfirm } from '@/lib/hooks/use-confirm';
import { enhancedAIService } from '@/lib/services/enhanced-ai-service';
import { useChatHistoryStore } from '@/lib/stores/chat-history-store';
import { ConfirmDialog } from '@/components/common/confirm-dialog';
import { AIMessage, AIResponse } from '@/types/ai';
import { Mic, Send, Loader, VolumeX, MessageSquare, Trash2 } from 'lucide-react';
import clsx from 'clsx';

export function AIChat() {
  const { currentMessages, addMessage, clearCurrentMessages, currentConversationId, createConversation } =
    useChatHistoryStore();
  const { isOpen, title, message, confirmLabel, cancelLabel, type, handleConfirm, handleCancel, confirm } = useConfirm();
  const [messages, setMessages] = useState<AIMessage[]>(currentMessages);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { isListening, transcript, isSupported: voiceSupported, startListening, stopListening } =
    useVoiceInput();

  // Initialize conversation on first render
  useEffect(() => {
    if (!currentConversationId) {
      createConversation('Chat');
    }
  }, []);

  // Sync store messages with local state
  useEffect(() => {
    setMessages(currentMessages);
  }, [currentMessages]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Set transcript to input when voice is used
  useEffect(() => {
    if (transcript) {
      setInput(transcript);
    }
  }, [transcript]);

  const handleVoiceInput = async () => {
    if (isListening) {
      stopListening();
      // Auto-send after listening stops
      if (transcript) {
        await handleSubmit(undefined, transcript);
      }
    } else {
      startListening();
    }
  };

  const handleSubmit = async (e?: React.FormEvent, voiceText?: string) => {
    e?.preventDefault();
    const messageText = voiceText || input;

    if (!messageText.trim()) return;

    // Add user message
    const userMessage: AIMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: new Date().toISOString(),
      type: voiceText ? 'voice' : 'text',
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    // Add to store
    addMessage(userMessage);

    try {
      // Process with enhanced AI service (Gemini or local NLP fallback)
      const response = await enhancedAIService.processRequest(messageText);

      // Add assistant response
      const assistantMessage: AIMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.message,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      addMessage(assistantMessage);
    } catch (error) {
      console.error('Error processing message:', error);
      const errorMessage: AIMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      addMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = async () => {
    const confirmed = await confirm({
      title: 'Clear Chat History',
      message: 'Are you sure you want to clear all messages in this chat? This action cannot be undone.',
      confirmLabel: 'Clear',
      cancelLabel: 'Cancel',
      type: 'danger',
    });

    if (confirmed) {
      clearCurrentMessages();
    }
  };

  return (
    <>
      <div className="flex flex-col h-[600px] bg-black-900 rounded-lg border border-black shadow-lg">
      {/* Header */}
      <div className="bg-linear-to-black from- to-purple-700 text-white p-4 rounded-t-lg flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <MessageSquare className="w-6 h-6" />
          <div>
            <h2 className="text-lg font-semibold">AI Assistant</h2>
            <p className="text-sm text-blue-200">Chat or speak to manage your productivity</p>
          </div>
        </div>
        <Button
          onClick={handleClearChat}
          variant="outline"
          size="sm"
          className="text-red-400 border-red-400 hover:bg-red-900/20"
          title="Clear chat history"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Clear
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-black-950">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={clsx('flex', {
              'justify-end': msg.role === 'user',
              'justify-start': msg.role === 'assistant',
            })}
          >
            <div
              className={clsx('max-w-xs lg:max-w-md px-4 py-2 rounded-lg border-white', {
                'bg-black border-white rounded-lg border text-white rounded-br-none': msg.role === 'user',
                'bg-black-800 text-gray-100 rounded-bl-none border border-black': msg.role === 'assistant',
              })}
            >
              <p className="text-sm">{msg.content}</p>
              {msg.type === 'voice' && msg.role === 'user' && (
                <p className="text-xs mt-1 opacity-75">Voice input</p>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-black-800 text-gray-100 px-4 py-2 rounded-lg border border-black">
              <div className="flex items-center gap-2">
                <Loader className="w-4 h-4 animate-spin" />
                <span className="text-sm">Processing...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-black p-4 bg-black-900">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything... or use voice"
            className="flex-1 bg-black-800 border-black text-white placeholder-gray-400"
            disabled={loading}
          />

          {voiceSupported && (
            <Button
              type="button"
              onClick={handleVoiceInput}
              disabled={loading}
              variant={isListening ? 'destructive' : 'outline'}
              size="icon"
              title={isListening ? 'Stop listening' : 'Start voice input'}
            >
              {isListening ? <VolumeX className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </Button>
          )}

          <Button type="submit" disabled={loading || !input.trim()} size="icon">
            <Send className="w-4 h-4" />
          </Button>
        </form>

        {isListening && (
          <p className="text-xs text-gray-400 mt-2 animate-pulse">Listening...</p>
        )}

        {/* Quick Tips */}
        <div className="mt-4 pt-4 border-t border-black">
          <p className="text-xs font-semibold text-gray-300 mb-2">Quick Tips:</p>
          <div className="text-xs text-gray-400 space-y-1">
            <p><strong>Create Tasks:</strong> "Add a task to finish the report"</p>
            <p><strong>Set Habits:</strong> "Create a daily meditation habit"</p>
            <p><strong>Set Goals:</strong> "My goal is to complete the project"</p>
            <p><strong>Schedule Time:</strong> "Schedule a meeting from 2pm to 3pm"</p>
            <p><strong>Set Reminders:</strong> "Remind me in 1 hour"</p>
          </div>
        </div>
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
