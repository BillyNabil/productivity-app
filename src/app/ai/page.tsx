'use client';

import { useState } from 'react';
import { AIChat } from '@/components/ai/ai-chat';
import { AISettings } from '@/components/ai/ai-settings';
import { Button } from '@/components/ui/button';
import { MessageSquare, Settings, CheckSquare, Target, Repeat2, Calendar } from 'lucide-react';

export default function AIPage() {
  const [activeTab, setActiveTab] = useState<'chat' | 'settings'>('chat');

  return (
    <div className="min-h-screen bg-linear-to-br from-black to-black p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <MessageSquare className="w-8 h-8" />
            AI Productivity Assistant
          </h1>
          <p className="text-lg text-gray-300">
            Chat and speak naturally to create tasks, goals, habits, and schedule your time
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <Button
            onClick={() => setActiveTab('chat')}
            variant={activeTab === 'chat' ? 'default' : 'outline'}
            className="px-6 flex items-center gap-2"
          >
            <MessageSquare className="w-4 h-4" />
            Chat
          </Button>
          <Button
            onClick={() => setActiveTab('settings')}
            variant={activeTab === 'settings' ? 'default' : 'outline'}
            className="px-6 flex items-center gap-2"
          >
            <Settings className="w-4 h-4" />
            Settings
          </Button>
        </div>

        {/* Content */}
        <div>
          {activeTab === 'chat' && <AIChat />}
          {activeTab === 'settings' && <AISettings />}
        </div>

        {/* Quick Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-12">
          <div className="bg-black-800 rounded-lg p-4 border border-black shadow flex flex-col items-start">
            <CheckSquare className="w-6 h-6 mb-2 text-blue-400" />
            <h3 className="font-semibold text-white">Tasks</h3>
            <p className="text-sm text-gray-400">Create and manage tasks</p>
          </div>
          <div className="bg-black-800 rounded-lg p-4 border border-black shadow flex flex-col items-start">
            <Target className="w-6 h-6 mb-2 text-red-400" />
            <h3 className="font-semibold text-white">Goals</h3>
            <p className="text-sm text-gray-400">Set daily goals</p>
          </div>
          <div className="bg-black-800 rounded-lg p-4 border border-black shadow flex flex-col items-start">
            <Repeat2 className="w-6 h-6 mb-2 text-green-400" />
            <h3 className="font-semibold text-white">Habits</h3>
            <p className="text-sm text-gray-400">Build recurring habits</p>
          </div>
          <div className="bg-black-800 rounded-lg p-4 border border-black shadow flex flex-col items-start">
            <Calendar className="w-6 h-6 mb-2 text-purple-400" />
            <h3 className="font-semibold text-white">Calendar</h3>
            <p className="text-sm text-gray-400">Schedule time blocks</p>
          </div>
        </div>
      </div>
    </div>
  );
}
