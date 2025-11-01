import { create } from 'zustand';
import { AISettings, VoiceSettings } from '@/types/ai';

interface AIStore {
  settings: AISettings;
  voiceSettings: VoiceSettings;
  updateSettings: (settings: Partial<AISettings>) => void;
  updateVoiceSettings: (settings: Partial<VoiceSettings>) => void;
}

export const useAIStore = create<AIStore>((set) => ({
  settings: {
    voiceEnabled: true,
    chatHistory: true,
    autoCreateItems: true,
    maxContextMessages: 10,
  },
  voiceSettings: {
    enabled: true,
    language: 'en-US',
    voice: 'female',
    autoSpeak: true,
  },
  updateSettings: (newSettings) =>
    set((state) => ({
      settings: { ...state.settings, ...newSettings },
    })),
  updateVoiceSettings: (newSettings) =>
    set((state) => ({
      voiceSettings: { ...state.voiceSettings, ...newSettings },
    })),
}));
