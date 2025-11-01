// AI Feature Types
export type AIRequestType = 'create' | 'update' | 'analyze' | 'suggest';

export type ItemType = 'task' | 'goal' | 'habit' | 'reminder' | 'time_block' | 'calendar_event';

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  type?: 'text' | 'voice';
}

export interface AIConversation {
  id: string;
  user_id: string;
  title: string;
  messages: AIMessage[];
  created_at: string;
  updated_at: string;
}

export interface AIRequest {
  type: AIRequestType;
  itemType: ItemType;
  content: string;
  context?: {
    relatedTaskIds?: string[];
    relatedHabitIds?: string[];
    timeframe?: string;
  };
}

export interface AIResponse {
  success: boolean;
  message: string;
  action?: {
    type: ItemType;
    operation: 'create' | 'update' | 'delete';
    data: Record<string, any>;
  };
  suggestions?: AIsuggestion[];
  reasoning?: string;
}

export interface AIsuggestion {
  id: string;
  type: ItemType;
  title: string;
  description: string;
  priority?: 'high' | 'medium' | 'low';
  estimatedTime?: number;
}

export interface VoiceSettings {
  enabled: boolean;
  language: string;
  voice: 'male' | 'female';
  autoSpeak: boolean;
}

export interface AISettings {
  voiceEnabled: boolean;
  chatHistory: boolean;
  autoCreateItems: boolean;
  maxContextMessages: number;
}
