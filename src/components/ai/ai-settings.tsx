'use client';

import { useAIStore } from '@/lib/stores/ai-store';
import { Button } from '@/components/ui/button';

export function AISettings() {
  const { settings, updateSettings } = useAIStore();

  return (
    <div className="space-y-6">
      {/* AI Settings */}
      <div className="bg-black-900 rounded-lg border border-black p-6">
        <h3 className="text-lg font-semibold text-white mb-4">AI Assistant Settings</h3>
        <p className="text-sm text-gray-400 mb-4">Customize AI behavior and preferences</p>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label htmlFor="chat-history" className="font-medium text-gray-200">Save Chat History</label>
            <input
              id="chat-history"
              type="checkbox"
              checked={settings.chatHistory}
              onChange={(e) => updateSettings({ chatHistory: e.target.checked })}
              className="w-5 h-5 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between">
            <label htmlFor="auto-create" className="font-medium text-gray-200">Auto-create Items</label>
            <input
              id="auto-create"
              type="checkbox"
              checked={settings.autoCreateItems}
              onChange={(e) => updateSettings({ autoCreateItems: e.target.checked })}
              className="w-5 h-5 cursor-pointer"
            />
          </div>

          <div>
            <label htmlFor="max-context" className="block font-medium text-gray-200 mb-2">Max Context Messages</label>
            <select 
              id="max-context"
              value={settings.maxContextMessages.toString()}
              onChange={(e) => updateSettings({ maxContextMessages: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-600 rounded-md bg-black text-white font-medium hover:border-purple-500 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="5" className="bg-black text-white">5 messages</option>
              <option value="10" className="bg-black text-white">10 messages</option>
              <option value="20" className="bg-black text-white">20 messages</option>
              <option value="50" className="bg-black text-white">50 messages</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
